package com.porflyo.infrastructure.adapters.output.dynamodb.schema;

import com.porflyo.infrastructure.adapters.output.dynamodb.Item.DdbPortfolioUrlItem;

import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.mapper.StaticAttributeTags;

public final class PortfolioUrlTableSchema {

    private PortfolioUrlTableSchema() {}

    public static final TableSchema<DdbPortfolioUrlItem> SCHEMA = TableSchema
            .builder(DdbPortfolioUrlItem.class)
            .newItemSupplier(DdbPortfolioUrlItem::new)

            // ────────────────────────── Key Attributes ──────────────────────────
            .addAttribute(String.class, a -> a.name("PK")
                .getter(DdbPortfolioUrlItem::getPK)
                .setter(DdbPortfolioUrlItem::setPK)
                .tags(StaticAttributeTags.primaryPartitionKey()))
            .addAttribute(String.class, a -> a.name("SK")
                .getter(DdbPortfolioUrlItem::getSK)
                .setter(DdbPortfolioUrlItem::setSK)
                .tags(StaticAttributeTags.primarySortKey()))

            // ────────────────────────── Portfolio URL Attributes ──────────────────────────
            .addAttribute(String.class, a -> a.name("userId")
                .getter(DdbPortfolioUrlItem::getUserId)
                .setter(DdbPortfolioUrlItem::setUserId))
            .addAttribute(String.class, a -> a.name("portfolioId")
                .getter(DdbPortfolioUrlItem::getPortfolioId)
                .setter(DdbPortfolioUrlItem::setPortfolioId))
            .addAttribute(Boolean.class, a -> a.name("isPublic")
                .getter(DdbPortfolioUrlItem::isPublic)
                .setter(DdbPortfolioUrlItem::setPublic))
            .build();
}
