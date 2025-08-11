package com.porflyo.infrastructure.adapters.output.dynamodb.schema;

import com.porflyo.infrastructure.adapters.output.dynamodb.Item.DdbMediaItem;

import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.mapper.StaticAttributeTags;

public final class MediaTableSchema {
    private MediaTableSchema() {}

    public static final TableSchema<DdbMediaItem> SCHEMA = TableSchema
            .builder(DdbMediaItem.class)
            .newItemSupplier(DdbMediaItem::new)

            // ────────────────────────── Key Attributes ──────────────────────────
            .addAttribute(String.class, a -> a.name("PK")
                    .getter(DdbMediaItem::getPK)
                    .setter(DdbMediaItem::setPK)
                    .tags(StaticAttributeTags.primaryPartitionKey()))
            .addAttribute(String.class, a -> a.name("SK")
                    .getter(DdbMediaItem::getSK)
                    .setter(DdbMediaItem::setSK)
                    .tags(StaticAttributeTags.primarySortKey()))


            // ────────────────────────── Media Attributes ──────────────────────────
            .addAttribute(String.class, a -> a.name("mediaId")
                    .getter(DdbMediaItem::getMediaId)
                    .setter(DdbMediaItem::setMediaId))
            .addAttribute(Integer.class, a -> a.name("useCount")
                    .getter(DdbMediaItem::getUseCount)
                    .setter(DdbMediaItem::setUseCount))
            .addAttribute(Integer.class, a -> a.name("size")
                    .getter(DdbMediaItem::getSize)
                    .setter(DdbMediaItem::setSize))
            .addAttribute(String.class, a -> a.name("type")
                    .getter(DdbMediaItem::getType)
                    .setter(DdbMediaItem::setType))
            .addAttribute(String.class, a -> a.name("createdAt")
                    .getter(DdbMediaItem::getCreatedAt)
                    .setter(DdbMediaItem::setCreatedAt))
            .build();
}
