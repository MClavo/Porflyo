package com.porflyo.infrastructure.adapters.output.dynamodb.schema;

import com.porflyo.infrastructure.adapters.output.dynamodb.Item.DdbPortfolioItem;

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
            .addAttribute(String.class, a -> a.name("tm")
                .getter(DdbPortfolioItem::getTemplate)
                .setter(DdbPortfolioItem::setTemplate))
            .addAttribute(String.class, a -> a.name("tt")
                .getter(DdbPortfolioItem::getTitle)
                .setter(DdbPortfolioItem::setTitle))
            .addAttribute(byte[].class, a -> a.name("ds")
                .getter(DdbPortfolioItem::getDescription)
                .setter(DdbPortfolioItem::setDescription))
            .addAttribute(byte[].class, a -> a.name("sc")
                .getter(DdbPortfolioItem::getSections)
                .setter(DdbPortfolioItem::setSections))
            .addAttribute(Integer.class, a -> a.name("v")
                .getter(DdbPortfolioItem::getModelVersion)
                .setter(DdbPortfolioItem::setModelVersion))
            .addAttribute(String.class, a -> a.name("s")
                .getter(DdbPortfolioItem::getDesiredSlug)
                .setter(DdbPortfolioItem::setDesiredSlug))
            .addAttribute(Boolean.class, a -> a.name("p")
                .getter(DdbPortfolioItem::getIsPublished)
                .setter(DdbPortfolioItem::setIsPublished))
            .build();
}
