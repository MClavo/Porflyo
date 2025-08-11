package com.porflyo.infrastructure.adapters.output.dynamodb.schema;

import com.porflyo.infrastructure.adapters.output.dynamodb.dto.DdbSavedSectionDto;

import software.amazon.awssdk.enhanced.dynamodb.EnhancedType;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.mapper.StaticAttributeTags;

public final class SavedSecionTableSchema {
    
    private SavedSecionTableSchema() {
    }

    public static final TableSchema<DdbSavedSectionDto> SCHEMA = TableSchema
            .builder(DdbSavedSectionDto.class)
            .newItemSupplier(DdbSavedSectionDto::new)

            // ────────────────────────── Key Attributes ──────────────────────────
            .addAttribute(String.class, a -> a.name("PK")
                    .getter(DdbSavedSectionDto::getPK)
                    .setter(DdbSavedSectionDto::setPK)
                    .tags(StaticAttributeTags.primaryPartitionKey()))
            .addAttribute(String.class, a -> a.name("SK")
                    .getter(DdbSavedSectionDto::getSK)
                    .setter(DdbSavedSectionDto::setSK)
                    .tags(StaticAttributeTags.primarySortKey()))

            // ────────────────────────── Section Attributes ──────────────────────────
            .addAttribute(String.class, a -> a.name("sectionId")
                    .getter(DdbSavedSectionDto::getSectionId)
                    .setter(DdbSavedSectionDto::setSectionId))
            .addAttribute(String.class, a -> a.name("userId")
                    .getter(DdbSavedSectionDto::getUserId)
                    .setter(DdbSavedSectionDto::setUserId))
            .addAttribute(String.class, a -> a.name("name")
                    .getter(DdbSavedSectionDto::getName)
                    .setter(DdbSavedSectionDto::setName))
            .addAttribute(String.class, a -> a.name("sectionType")
                    .getter(DdbSavedSectionDto::getSectionType)
                    .setter(DdbSavedSectionDto::setSectionType))
            .addAttribute(String.class, a -> a.name("title")
                    .getter(DdbSavedSectionDto::getTitle)
                    .setter(DdbSavedSectionDto::setTitle))
            .addAttribute(Object.class, a -> a.name("content")
                    .getter(DdbSavedSectionDto::getContent)
                    .setter(DdbSavedSectionDto::setContent))
            .addAttribute(EnhancedType.listOf(String.class), 
                a -> a.name("media")
                .getter(DdbSavedSectionDto::getMedia)
                .setter(DdbSavedSectionDto::setMedia))
            .addAttribute(Integer.class, a -> a.name("version")
                .getter(DdbSavedSectionDto::getVersion)
                .setter(DdbSavedSectionDto::setVersion))
            .build();

}
