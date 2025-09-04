package com.porflyo.repository;

import static com.porflyo.common.DdbKeys.SLUG_PK_PREFIX;
import static com.porflyo.common.DdbKeys.SLUG_PORTFOLIO_SK_PREFIX;
import static com.porflyo.common.DdbKeys.pk;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.porflyo.exceptions.publicUrl.StaleUrlOwnershipException;
import com.porflyo.exceptions.publicUrl.UrlAlreadyTakenException;
import com.porflyo.exceptions.publicUrl.UrlNotFoundException;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.portfolio.PortfolioUrl;
import com.porflyo.model.portfolio.Slug;
import com.porflyo.ports.PortfolioUrlRepository;
import com.porflyo.Item.DdbPortfolioUrlItem;
import com.porflyo.mapper.DdbPortfolioUrlMapper;
import  com.porflyo.schema.PortfolioUrlTableSchema;
import com.porflyo.configuration.DdbConfig;

import io.micronaut.context.annotation.Requires;
import io.micronaut.core.annotation.NonNull;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Expression;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.model.IgnoreNullsMode;
import software.amazon.awssdk.enhanced.dynamodb.model.PutItemEnhancedRequest;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import software.amazon.awssdk.enhanced.dynamodb.model.UpdateItemEnhancedRequest;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.CancellationReason;
import software.amazon.awssdk.services.dynamodb.model.ConditionalCheckFailedException;
import software.amazon.awssdk.services.dynamodb.model.Delete;
import software.amazon.awssdk.services.dynamodb.model.Put;
import software.amazon.awssdk.services.dynamodb.model.TransactWriteItem;
import software.amazon.awssdk.services.dynamodb.model.TransactWriteItemsRequest;
import software.amazon.awssdk.services.dynamodb.model.TransactionCanceledException;

@Singleton
@Requires(beans = DdbConfig.class)
public class DdbPortfolioUrlRepository implements PortfolioUrlRepository {

    private static final Logger log = LoggerFactory.getLogger(DdbPortfolioUrlRepository.class);

    private final String tableName;

    private final DdbPortfolioUrlMapper mapper;
    private final DynamoDbTable<DdbPortfolioUrlItem> table;
    private final DynamoDbClient lowLevel; // needed for TransactWrite

    @Inject
    public DdbPortfolioUrlRepository(DynamoDbEnhancedClient enhanced,
            @Named("lowDynamoDbClient")DynamoDbClient lowLevel,
            DdbConfig config, DdbPortfolioUrlMapper mapper) {
        this.tableName = config.tableName();
        this.lowLevel = lowLevel;
        this.table = enhanced.table(tableName, PortfolioUrlTableSchema.SCHEMA);
        this.mapper = mapper;
    }


    // ────────────────────────── Find ──────────────────────────

    @Override
    public @NonNull Optional<PortfolioUrl> findBySlug(@NonNull Slug slug) {
        String pk = pk(SLUG_PK_PREFIX, slug.value());

        QueryConditional q = QueryConditional.keyEqualTo(k -> k.partitionValue(pk));

        var pageIterable = table.query(r -> r.queryConditional(q).limit(1));
        var it = pageIterable.items().iterator();

        if (!it.hasNext()) {
            log.debug("Slug mapping not found: {}", slug.value());
            return Optional.empty();
        }

        DdbPortfolioUrlItem found = it.next();
        PortfolioUrl domain = mapper.toDomain(found);
        log.debug("Slug mapping found: {} -> {}", slug.value(), domain.userId().value());
        return Optional.of(domain);
    }


    // ────────────────────────── Reserve (conditional create) ──────────────────────────

    @Override
    public boolean reserve(@NonNull Slug slug,
                           @NonNull UserId userId,
                           @NonNull PortfolioId portfolioId,
                           boolean isPublic) {

        DdbPortfolioUrlItem item = mapper.toItem(slug, userId, portfolioId, isPublic);

        // Only one PK, atomicity
        Expression condition = Expression.builder()
            .expression("attribute_not_exists(PK)")
            .build();

        var req = PutItemEnhancedRequest.builder(DdbPortfolioUrlItem.class)
            .item(item)
            .conditionExpression(condition)
            .build();

        try {
            table.putItem(req);
            log.debug("Reserved slug '{}' for portfolio {} (user {})", slug.value(), portfolioId.value(), userId.value());
            return true;
        } catch (ConditionalCheckFailedException e) {
            log.debug("Slug '{}' is already taken", slug.value());
            return false;
        }
    }


    // ────────────────────────── Release (delete) ──────────────────────────

    @Override
    public void release(@NonNull Slug slugUrl) {
        Key key = Key.builder()
            .partitionValue(pk(SLUG_PK_PREFIX, slugUrl.value()))
            .sortValue(SLUG_PORTFOLIO_SK_PREFIX)
            .build();

        try{
            table.deleteItem(r -> r.key(key));
            log.debug("Released slug '{}'", slugUrl.value());

        } catch (ConditionalCheckFailedException e) {
            throw new UrlNotFoundException(slugUrl.value());
        }
    }


    // ────────────────────────── Change slug (atomic) ──────────────────────────

    @Override
    public void changeSlugAtomic(
            @NonNull Slug oldSlug,
            @NonNull Slug newSlug,
            @NonNull UserId userId,
            @NonNull PortfolioId portfolioId,
            boolean isPublic) {

        TransactWriteItemsRequest tx = buildSlugChangeTx(
            oldSlug,
            newSlug,
            userId,
            portfolioId,
            isPublic
        );

        try {
            lowLevel.transactWriteItems(tx);
            log.debug("Changed slug atomically: {} -> {} for portfolio {} (user {})",
                oldSlug != null ? oldSlug.value() : "(none)",
                newSlug.value(),
                portfolioId.value(),
                userId.value());
        } catch (TransactionCanceledException e) {
            throw mapSlugChangeException(e, oldSlug, newSlug);
        }
    }


    // ────────────────────────── Update visibility ──────────────────────────

    @Override
    public void updateVisibility(@NonNull Slug slug, boolean isPublic) {

        DdbPortfolioUrlItem partial = mapper.toItem(slug, null, null, isPublic);

        UpdateItemEnhancedRequest<DdbPortfolioUrlItem> req =
            UpdateItemEnhancedRequest.builder(DdbPortfolioUrlItem.class)
                .item(partial)
                .ignoreNullsMode(IgnoreNullsMode.SCALAR_ONLY)
                .build();

        try {
            table.updateItem(req);
            log.debug("Updated visibility for slug '{}': {}", slug.value(), isPublic);
        
        } catch (ConditionalCheckFailedException e) {
            throw new UrlNotFoundException(slug.value());
        }
    }


    // ────────────────────────── Helpers ──────────────────────────

    private TransactWriteItemsRequest buildSlugChangeTx(
        Slug oldSlug,
        Slug newSlug,
        UserId userId,
        PortfolioId portfolioId,
        boolean isPublic) {
        // Put new mapping with uniqueness condition (always needed)
        Map<String, AttributeValue> putItem = Map.of(
            "PK", AttributeValue.fromS(pk(SLUG_PK_PREFIX, newSlug.value())),
            "SK", AttributeValue.fromS(SLUG_PORTFOLIO_SK_PREFIX),
            "userId", AttributeValue.fromS(userId.value()),
            "portfolioId", AttributeValue.fromS(portfolioId.value()),
            "isPublic", AttributeValue.fromBool(isPublic)
        );

        Put putNew = Put.builder()
            .tableName(tableName)
            .item(putItem)
            .conditionExpression("attribute_not_exists(PK)")
            .build();

        // If there is no old slug (first time assignment), we only need to put the new mapping
        if (oldSlug == null) {
            return TransactWriteItemsRequest.builder()
                .transactItems(
                    TransactWriteItem.builder().put(putNew).build()
                )
                .build();
        }

        // Delete old mapping with condition (defensive: ensure user/portfolio match)
        Map<String, AttributeValue> deleteKey = Map.of(
            "PK", AttributeValue.fromS(pk(SLUG_PK_PREFIX, oldSlug.value())),
            "SK", AttributeValue.fromS(SLUG_PORTFOLIO_SK_PREFIX)
        );

        Map<String, AttributeValue> deleteCondValues = Map.of(
            ":uid", AttributeValue.fromS(userId.value()),
            ":pid", AttributeValue.fromS(portfolioId.value())
        );

        Delete deleteOld = Delete.builder()
            .tableName(tableName)
            .key(deleteKey)
            .conditionExpression("userId = :uid AND portfolioId = :pid")
            .expressionAttributeValues(deleteCondValues)
            .build();

        // Transactional write for atomicity, ensure both operations succeed or fail together
        return TransactWriteItemsRequest.builder()
            .transactItems(
                TransactWriteItem.builder().delete(deleteOld).build(),
                TransactWriteItem.builder().put(putNew).build()
            )
            .build();
    }

    private RuntimeException mapSlugChangeException(TransactionCanceledException e, Slug oldSlug, Slug newSlug) {
        var reasons = e.cancellationReasons();
        int idx = 0;

        if (oldSlug != null && isConditionalFailed(reasons, idx++)) {
            return new StaleUrlOwnershipException(oldSlug.value());
        }
        if (isConditionalFailed(reasons, idx)) {
            return new UrlAlreadyTakenException(newSlug.value());
        }

        return e; // Others: throughput, throttling, etc.
    }

    private boolean isConditionalFailed(List<CancellationReason> reasons, int idx) {
        return reasons.size() > idx && "ConditionalCheckFailed".equals(reasons.get(idx).code());
    }

}
