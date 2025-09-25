package com.porflyo.schema;

import com.porflyo.Item.DdbSlotMetricsItem;

import software.amazon.awssdk.enhanced.dynamodb.EnhancedType;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.mapper.StaticAttributeTags;

public final class SlotMetricsTableSchema {
    private SlotMetricsTableSchema() {}

    public static final TableSchema<DdbSlotMetricsItem> SCHEMA = TableSchema
            .builder(DdbSlotMetricsItem.class)    
            .newItemSupplier(DdbSlotMetricsItem::new)

            // ────────────────────────── Key & Index ──────────────────────────
            
            .addAttribute(String.class, a -> a.name("PK")
                .getter(DdbSlotMetricsItem::getPK)
                .setter(DdbSlotMetricsItem::setPK)
                .tags(StaticAttributeTags.primaryPartitionKey()))
            .addAttribute(String.class, a -> a.name("SK")
                .getter(DdbSlotMetricsItem::getSK)
                .setter(DdbSlotMetricsItem::setSK)
                .tags(StaticAttributeTags.primarySortKey()))

            
            .addAttribute(String.class, a -> a.name("D")
                .getter(DdbSlotMetricsItem::getDate)
                .setter(DdbSlotMetricsItem::setDate))


            // ────────────────────────── Projects ──────────────────────────
            .addAttribute(EnhancedType.listOf(Integer.class), a -> a.name("p")
                .getter(DdbSlotMetricsItem::getProjectId)
                .setter(DdbSlotMetricsItem::setProjectId))
            .addAttribute(EnhancedType.listOf(Integer.class), a -> a.name("v")
                .getter(DdbSlotMetricsItem::getViewTime)
                .setter(DdbSlotMetricsItem::setViewTime))
            .addAttribute(EnhancedType.listOf(Integer.class), a -> a.name("f")
                .getter(DdbSlotMetricsItem::getTTFI)
                .setter(DdbSlotMetricsItem::setTTFI))
            .addAttribute(EnhancedType.listOf(Integer.class), a -> a.name("c")
                .getter(DdbSlotMetricsItem::getCodeViews)
                .setter(DdbSlotMetricsItem::setCodeViews))
            .addAttribute(EnhancedType.listOf(Integer.class), a -> a.name("l")
                .getter(DdbSlotMetricsItem::getLiveViews)
                .setter(DdbSlotMetricsItem::setLiveViews))


            // ────────────────────────── HeatMap ──────────────────────────
            .addAttribute(String.class, a -> a.name("V")
                .getter(DdbSlotMetricsItem::getVersion)
                .setter(DdbSlotMetricsItem::setVersion))
            .addAttribute(Integer.class, a -> a.name("m")
                .getter(DdbSlotMetricsItem::getColumns)
                .setter(DdbSlotMetricsItem::setColumns))
            .addAttribute(byte[].class, a -> a.name("H")
                .getter(DdbSlotMetricsItem::getHeatMap)
                .setter(DdbSlotMetricsItem::setHeatMap))

            .build();
}
