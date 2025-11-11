package com.porflyo.schema;

import com.porflyo.Item.DdbPortfolioMetricsItem;

import software.amazon.awssdk.enhanced.dynamodb.EnhancedType;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.mapper.StaticAttributeTags;

public final class PortfolioMetricsTableSchema {
    private PortfolioMetricsTableSchema() {}

    public static final TableSchema<DdbPortfolioMetricsItem> SCHEMA = TableSchema
            .builder(DdbPortfolioMetricsItem.class)    
            .newItemSupplier(DdbPortfolioMetricsItem::new)

            // ────────────────────────── Key Attributes ──────────────────────────
            .addAttribute(String.class, a -> a.name("PK")
                .getter(DdbPortfolioMetricsItem::getPK)
                .setter(DdbPortfolioMetricsItem::setPK)
                .tags(StaticAttributeTags.primaryPartitionKey()))
            .addAttribute(String.class, a -> a.name("SK")
                .getter(DdbPortfolioMetricsItem::getSK)
                .setter(DdbPortfolioMetricsItem::setSK)
                .tags(StaticAttributeTags.primarySortKey()))

            
            // ────────────────────────── Portfolio Metrics Attributes ──────────────────────────
            .addAttribute(String.class, a -> a.name("V")
                .getter(DdbPortfolioMetricsItem::getVersion)
                .setter(DdbPortfolioMetricsItem::setVersion))
            .addAttribute(EnhancedType.listOf(Integer.class), a -> a.name("D")
                .getter(DdbPortfolioMetricsItem::getDayIntegers)
                .setter(DdbPortfolioMetricsItem::setDayIntegers))

            // ────────────────────────── Engagement ──────────────────────────
            .addAttribute(EnhancedType.listOf(Integer.class), a -> a.name("a")
                .getter(DdbPortfolioMetricsItem::getActiveTime)
                .setter(DdbPortfolioMetricsItem::setActiveTime))
            .addAttribute(EnhancedType.listOf(Integer.class), a -> a.name("v")
                .getter(DdbPortfolioMetricsItem::getViews)
                .setter(DdbPortfolioMetricsItem::setViews))
            .addAttribute(EnhancedType.listOf(Integer.class), a -> a.name("q")
                .getter(DdbPortfolioMetricsItem::getQualityVisits)
                .setter(DdbPortfolioMetricsItem::setQualityVisits))
            .addAttribute(EnhancedType.listOf(Integer.class), a -> a.name("e")
                .getter(DdbPortfolioMetricsItem::getEmailCopies)
                .setter(DdbPortfolioMetricsItem::setEmailCopies))
            .addAttribute(EnhancedType.listOf(Integer.class), a -> a.name("o")
                .getter(DdbPortfolioMetricsItem::getSocialClicks)
                .setter(DdbPortfolioMetricsItem::setSocialClicks))
            .addAttribute(EnhancedType.listOf(Integer.class), a -> a.name("d")
                .getter(DdbPortfolioMetricsItem::getDeviceViews)
                .setter(DdbPortfolioMetricsItem::setDeviceViews))

            // ────────────────────────── Interaction ──────────────────────────
            .addAttribute(EnhancedType.listOf(Integer.class), a -> a.name("s")
                .getter(DdbPortfolioMetricsItem::getTotalScrollScore)
                .setter(DdbPortfolioMetricsItem::setTotalScrollScore))
            .addAttribute(EnhancedType.listOf(Integer.class), a -> a.name("t")
                .getter(DdbPortfolioMetricsItem::getTotalScrollTime)
                .setter(DdbPortfolioMetricsItem::setTotalScrollTime))
            .addAttribute(EnhancedType.listOf(Integer.class), a -> a.name("F")
                .getter(DdbPortfolioMetricsItem::getTtfiSumMs)
                .setter(DdbPortfolioMetricsItem::setTtfiSumMs))
            .addAttribute(EnhancedType.listOf(Integer.class), a -> a.name("C")
                .getter(DdbPortfolioMetricsItem::getTtfiCount)
                .setter(DdbPortfolioMetricsItem::setTtfiCount))

            // ────────────────────────── Projects ──────────────────────────
            .addAttribute(EnhancedType.listOf(Integer.class), a -> a.name("w")
                .getter(DdbPortfolioMetricsItem::getViewTime)
                .setter(DdbPortfolioMetricsItem::setViewTime))
            .addAttribute(EnhancedType.listOf(Integer.class), a -> a.name("x")
                .getter(DdbPortfolioMetricsItem::getExposures)
                .setter(DdbPortfolioMetricsItem::setExposures))
            .addAttribute(EnhancedType.listOf(Integer.class), a -> a.name("c")
                .getter(DdbPortfolioMetricsItem::getCodeViews)
                .setter(DdbPortfolioMetricsItem::setCodeViews))
            .addAttribute(EnhancedType.listOf(Integer.class), a -> a.name("l")
                .getter(DdbPortfolioMetricsItem::getLiveViews)
                .setter(DdbPortfolioMetricsItem::setLiveViews))
            .build();
}
