package com.porflyo.infrastructure.adapters.output.dynamodb.schema;

import com.porflyo.infrastructure.adapters.output.dynamodb.Item.DdbPortfolioItem;

import software.amazon.awssdk.enhanced.dynamodb.EnhancedType;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.mapper.StaticAttributeTags;

public final class PortfolioTableSchema {

    private PortfolioTableSchema() {}

    public static final TableSchema<DdbPortfolioItem> SCHEMA = TableSchema
            .builder(DdbPortfolioItem.class)    
            .newItemSupplier(DdbPortfolioItem::new)

            // ────────────────────────── Key Attributes ──────────────────────────
            .addAttribute(String.class, a -> a.name("PK")
                .getter(DdbPortfolioItem::getPK)
                .setter(DdbPortfolioItem::setPK)
                .tags(StaticAttributeTags.primaryPartitionKey()))
            .addAttribute(String.class, a -> a.name("SK")
                .getter(DdbPortfolioItem::getSK)
                .setter(DdbPortfolioItem::setSK)
                .tags(StaticAttributeTags.primarySortKey()))
            
            // ────────────────────────── Portfolio Attributes ──────────────────────────
            .addAttribute(String.class, a -> a.name("portfolioId")
                .getter(DdbPortfolioItem::getPortfolioId)
                .setter(DdbPortfolioItem::setPortfolioId))
            .addAttribute(String.class, a -> a.name("userId")
                .getter(DdbPortfolioItem::getUserId)
                .setter(DdbPortfolioItem::setUserId))
            .addAttribute(String.class, a -> a.name("template")
                .getter(DdbPortfolioItem::getTemplate)
                .setter(DdbPortfolioItem::setTemplate))
            .addAttribute(String.class, a -> a.name("title")
                .getter(DdbPortfolioItem::getTitle)
                .setter(DdbPortfolioItem::setTitle))
            .addAttribute(String.class, a -> a.name("description")
                .getter(DdbPortfolioItem::getDescription)
                .setter(DdbPortfolioItem::setDescription))
            .addAttribute(EnhancedType.listOf(Object.class), a -> a.name("sections")
                .getter(DdbPortfolioItem::getSections)
                .setter(DdbPortfolioItem::setSections))
            .addAttribute(EnhancedType.listOf(String.class), a -> a.name("media")
                .getter(DdbPortfolioItem::getMedia)
                .setter(DdbPortfolioItem::setMedia))
            .addAttribute(Integer.class, a -> a.name("modelVersion")
                .getter(DdbPortfolioItem::getModelVersion)
                .setter(DdbPortfolioItem::setModelVersion))
            .addAttribute(String.class, a -> a.name("desiredSlug")
                .getter(DdbPortfolioItem::getDesiredSlug)
                .setter(DdbPortfolioItem::setDesiredSlug))
            .addAttribute(Boolean.class, a -> a.name("isPublished")
                .getter(DdbPortfolioItem::getIsPublished)
                .setter(DdbPortfolioItem::setIsPublished))
            .addAttribute(String.class, a -> a.name("createdAt")
                .getter(DdbPortfolioItem::getCreatedAt)
                .setter(DdbPortfolioItem::setCreatedAt))
            .build();
}
