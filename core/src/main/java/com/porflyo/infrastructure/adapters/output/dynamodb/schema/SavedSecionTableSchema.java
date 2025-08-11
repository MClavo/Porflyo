package com.porflyo.infrastructure.adapters.output.dynamodb.schema;

import com.porflyo.infrastructure.adapters.output.dynamodb.Item.DdbSavedSectionItem;

import software.amazon.awssdk.enhanced.dynamodb.EnhancedType;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.mapper.StaticAttributeTags;

public final class SavedSecionTableSchema {
    
    private SavedSecionTableSchema() {
    }

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
            .addAttribute(String.class, a -> a.name("sectionId")
                    .getter(DdbSavedSectionItem::getSectionId)
                    .setter(DdbSavedSectionItem::setSectionId))
            .addAttribute(String.class, a -> a.name("userId")
                    .getter(DdbSavedSectionItem::getUserId)
                    .setter(DdbSavedSectionItem::setUserId))
            .addAttribute(String.class, a -> a.name("name")
                    .getter(DdbSavedSectionItem::getName)
                    .setter(DdbSavedSectionItem::setName))
            .addAttribute(String.class, a -> a.name("sectionType")
                    .getter(DdbSavedSectionItem::getSectionType)
                    .setter(DdbSavedSectionItem::setSectionType))
            .addAttribute(String.class, a -> a.name("title")
                    .getter(DdbSavedSectionItem::getTitle)
                    .setter(DdbSavedSectionItem::setTitle))
            .addAttribute(Object.class, a -> a.name("content")
                    .getter(DdbSavedSectionItem::getContent)
                    .setter(DdbSavedSectionItem::setContent))
            .addAttribute(EnhancedType.listOf(String.class), 
                a -> a.name("media")
                .getter(DdbSavedSectionItem::getMedia)
                .setter(DdbSavedSectionItem::setMedia))
            .addAttribute(Integer.class, a -> a.name("version")
                .getter(DdbSavedSectionItem::getVersion)
                .setter(DdbSavedSectionItem::setVersion))
            .build();

}
