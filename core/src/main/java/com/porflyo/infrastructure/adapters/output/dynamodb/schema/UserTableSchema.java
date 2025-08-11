package com.porflyo.infrastructure.adapters.output.dynamodb.schema;

import com.porflyo.infrastructure.adapters.output.dynamodb.Item.DdbUserItem;

import software.amazon.awssdk.enhanced.dynamodb.EnhancedType;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.mapper.StaticAttributeTags;

/**
 * Schema definition for the User table in DynamoDB.
 * <p>
 * Defines the primary key, sort key, GSI and attributes for the User entity.
 * </p>
 */
public final class UserTableSchema {

    private UserTableSchema() {}

    public static final TableSchema<DdbUserItem> SCHEMA = TableSchema
            .builder(DdbUserItem.class)
            .newItemSupplier(DdbUserItem::new)

            // ────────────────────────── Key Attributes ──────────────────────────
            .addAttribute(String.class, a -> a.name("PK")
                    .getter(DdbUserItem::getPK)
                    .setter(DdbUserItem::setPK)
                    .tags(StaticAttributeTags.primaryPartitionKey()))
            .addAttribute(String.class, a -> a.name("SK")
                    .getter(DdbUserItem::getSK)
                    .setter(DdbUserItem::setSK)
                    .tags(StaticAttributeTags.primarySortKey()))
            
            // GSI for provider user ID, used for queries in OAuth flow
            .addAttribute(String.class, a -> a.name("providerUserId")
                .getter(DdbUserItem::getProviderUserId)
                .setter(DdbUserItem::setProviderUserId)
                .tags(StaticAttributeTags.secondaryPartitionKey("provider-user-id-index")))
            
                
            // ────────────────────────── User Attributes ──────────────────────────
            .addAttribute(String.class, a -> a.name("userId")
                    .getter(DdbUserItem::getUserId)
                    .setter(DdbUserItem::setUserId))
            .addAttribute(String.class, a -> a.name("name")
                    .getter(DdbUserItem::getName)
                    .setter(DdbUserItem::setName))
            .addAttribute(String.class, a -> a.name("email")
                    .getter(DdbUserItem::getEmail)
                    .setter(DdbUserItem::setEmail))
            .addAttribute(String.class, a -> a.name("description")
                    .getter(DdbUserItem::getDescription)
                    .setter(DdbUserItem::setDescription))
            .addAttribute(String.class, a -> a.name("profileImage")
                    .getter(DdbUserItem::getProfileImage)
                    .setter(DdbUserItem::setProfileImage))
            .addAttribute(EnhancedType.mapOf(String.class, String.class),
                    a -> a.name("socials")
                        .getter(DdbUserItem::getSocials)
                        .setter(DdbUserItem::setSocials))
            .addAttribute(String.class, a -> a.name("providerUserName")
                    .getter(DdbUserItem::getProviderUserName)
                    .setter(DdbUserItem::setProviderUserName))
            .addAttribute(String.class, a -> a.name("providerAvatarUrl")
                    .getter(DdbUserItem::getProviderAvatarUrl)
                    .setter(DdbUserItem::setProviderAvatarUrl))
            .addAttribute(String.class, a -> a.name("providerAccessToken")
                    .getter(DdbUserItem::getProviderAccessToken)
                    .setter(DdbUserItem::setProviderAccessToken))
            .build();
}
