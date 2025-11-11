package com.porflyo.repository;

import static com.porflyo.common.DdbKeys.USER_PK_PREFIX;
import static com.porflyo.common.DdbKeys.USER_PORTFOLIO_SK_PREFIX;
import static com.porflyo.common.DdbKeys.pk;
import static com.porflyo.common.DdbKeys.sk;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.porflyo.dto.PortfolioPatchDto;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.portfolio.Portfolio;
import com.porflyo.model.portfolio.Slug;
import com.porflyo.ports.PortfolioRepository;
import com.porflyo.Item.DdbPortfolioItem;
import com.porflyo.mapper.DdbPortfolioMapper;
import  com.porflyo.schema.PortfolioTableSchema;
import com.porflyo.configuration.DdbConfig;

import io.micronaut.context.annotation.Requires;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import jakarta.validation.constraints.NotNull;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.model.IgnoreNullsMode;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import software.amazon.awssdk.enhanced.dynamodb.model.UpdateItemEnhancedRequest;

@Singleton
@Requires(beans = DdbConfig.class)
public class DdbPortfolioRepository implements PortfolioRepository {
    private final DdbPortfolioMapper mapper;
    private static final Logger log = LoggerFactory.getLogger(DdbPortfolioRepository.class);
    private final DynamoDbTable<DdbPortfolioItem> table;

    @Inject
    public DdbPortfolioRepository(DynamoDbEnhancedClient enhanced, DdbConfig dynamoDbConfig, DdbPortfolioMapper portfolioMapper) {
        this.mapper = portfolioMapper;
        this.table = enhanced.table(
            dynamoDbConfig.userTable(),
            PortfolioTableSchema.SCHEMA);
    }


    // ────────────────────────── Save ──────────────────────────
    
    @Override
    public void save(@NotNull Portfolio portfolio) {
        table.putItem(mapper.toItem(portfolio));
        log.debug("Saved portfolio: {}", portfolio.id().value());
    }


    // ────────────────────────── Find ──────────────────────────

    @Override
    public @NotNull Optional<Portfolio> findById(UserId userId, PortfolioId id) {
        Key key = buildPortfolioKey(userId, id);
        DdbPortfolioItem dto = table.getItem(r -> r.key(key));

        if (dto == null) {
            log.debug("Portfolio not found: {}", id.value());
            return Optional.empty();
        } else {
            log.debug("Found portfolio: {}", id.value());
        }

        return Optional.ofNullable(dto).map(mapper::toDomain);
    }

    @Override
    public @NotNull List<Portfolio> findByUserId(UserId userId) {
        String pk = pk(USER_PK_PREFIX, userId.value());

        // Query for all portfolios of the user: restrict to sort keys that begin with the portfolio prefix
        QueryConditional query = QueryConditional
            .sortBeginsWith(k -> k.partitionValue(pk).sortValue(USER_PORTFOLIO_SK_PREFIX));

        List<Portfolio> portfolios = table.query(r -> r.queryConditional(query))
            .items()
            .stream()
            .map(mapper::toDomain)
            .toList();

        log.debug("Found {} portfolios for user: {}", portfolios.size(), userId.value());
        return portfolios;        
    }


    // ────────────────────────── Patch ──────────────────────────

    @Override
    public @NotNull Portfolio patch(
            @NotNull UserId userId,
            @NotNull PortfolioId portfolioId,
            @NotNull PortfolioPatchDto patch) {
        
        DdbPortfolioItem updateItem = mapper.patchToItem(userId, portfolioId, patch);
        UpdateItemEnhancedRequest<DdbPortfolioItem> request = createUpdateItemRequest(updateItem);
        
        DdbPortfolioItem result = table.updateItem(request);

        log.debug("Patched portfolio: {} for user: {}", portfolioId.value(), userId.value());

        return mapper.toDomain(result);
    }

    @Override
    public @NotNull Portfolio setUrlAndVisibility(UserId userId, PortfolioId id, Slug slug, boolean published) {

        DdbPortfolioItem updateItem = mapper.slugAndVisibilityToItem(userId, id, slug, published);
        UpdateItemEnhancedRequest<DdbPortfolioItem> request = createUpdateItemRequest(updateItem);

        DdbPortfolioItem result = table.updateItem(request);
        log.debug("Updated slug and visibility for portfolio: {} for user: {}", id.value(), userId.value());

        return mapper.toDomain(result);
    }


    // ────────────────────────── Delete ──────────────────────────

    @Override
    public void delete(UserId userId, PortfolioId portfolioId) {
        Key key = buildPortfolioKey(userId, portfolioId);
        table.deleteItem(r -> r.key(key));
        log.debug("Deleted portfolio: {} for user: {}", portfolioId.value(), userId.value());
    }

    // ────────────────────────── Private Methods ──────────────────────────
    private Key buildPortfolioKey(UserId userId, PortfolioId id) {
        return Key.builder()
                .partitionValue(pk(USER_PK_PREFIX, userId.value()))
                .sortValue(sk(USER_PORTFOLIO_SK_PREFIX, id.value()))
                .build();
    }

    private UpdateItemEnhancedRequest<DdbPortfolioItem> createUpdateItemRequest(DdbPortfolioItem updateItem) {
        UpdateItemEnhancedRequest<DdbPortfolioItem> request =
            UpdateItemEnhancedRequest.builder(DdbPortfolioItem.class)
            .item(updateItem)
            .ignoreNullsMode(IgnoreNullsMode.SCALAR_ONLY)
            .build();
        return request;
    }
    
}
