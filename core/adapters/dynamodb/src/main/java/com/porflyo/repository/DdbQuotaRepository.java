package com.porflyo.repository;



import static com.porflyo.common.DdbKeys.USER_PK_PREFIX;
import static com.porflyo.common.DdbKeys.USER_QUOTA_SK_PREFIX;
import static com.porflyo.common.DdbKeys.pk;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.porflyo.ports.output.QuotaRepository;
import com.porflyo.model.ids.UserId;
import com.porflyo.Item.DdbQuotaItem;
import  com.porflyo.schema.QuotaTableSchema;
import com.porflyo.configuration.DdbConfig;
import com.porflyo.configuration.QuotaConfig;

import io.micronaut.context.annotation.Requires;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;

@Singleton
@Requires(beans = DdbConfig.class)
public class DdbQuotaRepository implements QuotaRepository {
    private final QuotaConfig quotaConfig;
    private final Logger log = LoggerFactory.getLogger(DdbQuotaRepository.class);
    private final DynamoDbTable<DdbQuotaItem> table;

    @Inject
    public DdbQuotaRepository(DynamoDbEnhancedClient enhanced, DdbConfig dynamoDbConfig, QuotaConfig quotaConfig) {
        this.table = enhanced.table(
            dynamoDbConfig.tableName(),
            QuotaTableSchema.SCHEMA);
        this.quotaConfig = quotaConfig;
    }


    // ────────────────────────── Save ──────────────────────────

    public void create(UserId userId) {
        DdbQuotaItem item = new DdbQuotaItem();
        item.setPK(pk(USER_PK_PREFIX, userId.value()));
        item.setSK(USER_QUOTA_SK_PREFIX);

        item.setPortfolioCount(0);
        item.setSavedSectionCount(0);

        table.putItem(item);
        log.debug("Created quota item for user: {}", userId.value());
    }


    // ────────────────────────── Find ──────────────────────────
    public Integer getSavedSectionCount(UserId userId) {
        DdbQuotaItem item = getQuotaItem(userId);

        if (item == null) {
            log.warn("No quota item found for user: {}", userId);
            return null;
        }

        return item.getSavedSectionCount();
    }

    public Integer getPortfolioCount(UserId userId) {
        DdbQuotaItem item = getQuotaItem(userId);

        if (item == null) {
            log.warn("No quota item found for user: {}", userId);
            return null;
        }

        return item.getPortfolioCount();
    }


    // ────────────────────────── Update Counter ────────────────────────── 
    
    public int updateSavedSectionCount(UserId userId, int updateBy) {
        DdbQuotaItem item = getQuotaItem(userId);

        if (item == null) {
            log.warn("No quota item found for user: {}", userId.value());
            throw new IllegalStateException("Quota item not found for user: " + userId.value());
        }

        int count = item.getSavedSectionCount() + updateBy;

        if (count > quotaConfig.maxSavedSections() || count < 0) {
            log.warn("Quota exceeded for user: {}. Attempted to set savedSectionCount to {}", userId.value(), count);
            throw new IllegalStateException("Quota exceeded for saved sections");
        }

        item.setSavedSectionCount(count);

        table.updateItem(item);
        log.debug("Updated saved section count for user: {} to {}", userId.value(), count);

        return count;
    }

    public int updatePortfolioCount(UserId userId, int updateBy) {
       DdbQuotaItem item = getQuotaItem(userId);

        if (item == null) {
            log.warn("No quota item found for user: {}", userId.value());
            throw new IllegalStateException("Quota item not found for user: " + userId.value());
        }

        int count = item.getPortfolioCount() + updateBy;

        if (count > quotaConfig.maxPortfolios() || count < 0) {
            log.warn("Quota exceeded for user: {}. Attempted to set portfolioCount to {}", userId.value(), count);
            throw new IllegalStateException("Quota exceeded for portfolio");
        }

        item.setPortfolioCount(count);

        table.updateItem(item);
        log.debug("Updated portfolio count for user: {} to {}", userId.value(), count);

        return count;
    }


    // ────────────────────────── Delete ──────────────────────────
    
    public void delete(UserId userId) {
        Key key = buildMediaKey(userId);
        
        table.deleteItem(r -> r.key(key));
        log.debug("Deleted quota item for user: {}", userId.value());
    }


    // ────────────────────────── Private Methods ──────────────────────────
    private DdbQuotaItem getQuotaItem(UserId userId) {
        Key key = buildMediaKey(userId);
        return table.getItem(r -> r.key(key));
    }

    
    private Key buildMediaKey(UserId userId) {
        return Key.builder()
                .partitionValue(pk(USER_PK_PREFIX, userId.value()))
                .sortValue(USER_QUOTA_SK_PREFIX)
                .build();
    }

}


