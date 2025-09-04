package  com.porflyo.schema;

import com.porflyo.Item.DdbQuotaItem;

import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.mapper.StaticAttributeTags;

public final class QuotaTableSchema {
    
    private QuotaTableSchema() {}

    public static final TableSchema<DdbQuotaItem> SCHEMA = TableSchema
            .builder(DdbQuotaItem.class)
            .newItemSupplier(DdbQuotaItem::new)

            // ────────────────────────── Key Attributes ──────────────────────────
            .addAttribute(String.class, a -> a.name("PK")
                    .getter(DdbQuotaItem::getPK)
                    .setter(DdbQuotaItem::setPK)
                    .tags(StaticAttributeTags.primaryPartitionKey()))
            .addAttribute(String.class, a -> a.name("SK")
                    .getter(DdbQuotaItem::getSK)
                    .setter(DdbQuotaItem::setSK)
                    .tags(StaticAttributeTags.primarySortKey()))

            // ────────────────────────── Quota Attributes ──────────────────────────
            .addAttribute(Integer.class, a -> a.name("savedSectionCount")
                    .getter(DdbQuotaItem::getSavedSectionCount)
                    .setter(DdbQuotaItem::setSavedSectionCount))
            .addAttribute(Integer.class, a -> a.name("portfolioCount")
                    .getter(DdbQuotaItem::getPortfolioCount)
                    .setter(DdbQuotaItem::setPortfolioCount))

            .build();
}
