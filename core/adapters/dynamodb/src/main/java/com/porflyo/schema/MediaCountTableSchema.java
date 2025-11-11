package  com.porflyo.schema;

import com.porflyo.Item.DdbMediaCountItem;

import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.mapper.StaticAttributeTags;

public final class MediaCountTableSchema {
    
    private MediaCountTableSchema() {}

    public static final TableSchema<DdbMediaCountItem> SCHEMA = TableSchema
            .builder(DdbMediaCountItem.class)
            .newItemSupplier(DdbMediaCountItem::new)

            // ────────────────────────── Key Attributes ──────────────────────────
            .addAttribute(String.class, a -> a.name("PK")
                    .getter(DdbMediaCountItem::getPK)
                    .setter(DdbMediaCountItem::setPK)
                    .tags(StaticAttributeTags.primaryPartitionKey()))
            .addAttribute(String.class, a -> a.name("SK")
                    .getter(DdbMediaCountItem::getSK)
                    .setter(DdbMediaCountItem::setSK)
                    .tags(StaticAttributeTags.primarySortKey()))


            // ────────────────────────── Media Attributes ──────────────────────────
            .addAttribute(byte[].class, a -> a.name("mediaCount")
                    .getter(DdbMediaCountItem::getMediaCount)
                    .setter(DdbMediaCountItem::setMediaCount))
            .build();
}
