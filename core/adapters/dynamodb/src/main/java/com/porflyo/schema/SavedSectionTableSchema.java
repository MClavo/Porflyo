package  com.porflyo.schema;

import com.porflyo.Item.DdbSavedSectionItem;

import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.mapper.StaticAttributeTags;

public final class SavedSectionTableSchema {
    
    private SavedSectionTableSchema() {}

    public static final TableSchema<DdbSavedSectionItem> SCHEMA = TableSchema
            .builder(DdbSavedSectionItem.class)
            .newItemSupplier(DdbSavedSectionItem::new)

            // ────────────────────────── Key Attributes ──────────────────────────
            .addAttribute(String.class, a -> a.name("PK")
                    .getter(DdbSavedSectionItem::getPK)
                    .setter(DdbSavedSectionItem::setPK)
                    .tags(StaticAttributeTags.primaryPartitionKey()))
            .addAttribute(String.class, a -> a.name("SK")
                    .getter(DdbSavedSectionItem::getSK)
                    .setter(DdbSavedSectionItem::setSK)
                    .tags(StaticAttributeTags.primarySortKey()))

            // ────────────────────────── Section Attributes ──────────────────────────
            .addAttribute(String.class, a -> a.name("n")
                    .getter(DdbSavedSectionItem::getName)
                    .setter(DdbSavedSectionItem::setName))
            .addAttribute(byte[].class, a -> a.name("s")
                    .getter(DdbSavedSectionItem::getSection)
                    .setter(DdbSavedSectionItem::setSection))
            .addAttribute(Integer.class, a -> a.name("v")
                .getter(DdbSavedSectionItem::getVersion)
                .setter(DdbSavedSectionItem::setVersion))
            .build();

}
