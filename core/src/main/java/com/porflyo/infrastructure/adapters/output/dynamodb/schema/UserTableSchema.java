package com.porflyo.infrastructure.adapters.output.dynamodb.schema;

import com.porflyo.infrastructure.adapters.output.dynamodb.dto.DdbUserDto;

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

    private UserTableSchema() {
    }

    public static final TableSchema<DdbUserDto> SCHEMA = TableSchema
            .builder(DdbUserDto.class)
            .newItemSupplier(DdbUserDto::new)

            // ────────────────────────── Key Attributes ──────────────────────────
            .addAttribute(String.class, a -> a.name("PK")
                    .getter(DdbUserDto::getPK)
                    .setter(DdbUserDto::setPK)
                    .tags(StaticAttributeTags.primaryPartitionKey()))
            .addAttribute(String.class, a -> a.name("SK")
                    .getter(DdbUserDto::getSK)
                    .setter(DdbUserDto::setSK)
                    .tags(StaticAttributeTags.primarySortKey()))
            
            // GSI for provider user ID, used for queries in OAuth flow
            .addAttribute(String.class, a -> a.name("providerUserId")
                .getter(DdbUserDto::getProviderUserId)
                .setter(DdbUserDto::setProviderUserId)
                .tags(StaticAttributeTags.secondaryPartitionKey("provider-user-id-index")))
            
                
            // ────────────────────────── User Attributes ──────────────────────────
            .addAttribute(String.class, a -> a.name("userId")
                    .getter(DdbUserDto::getUserId)
                    .setter(DdbUserDto::setUserId))
            .addAttribute(String.class, a -> a.name("name")
                    .getter(DdbUserDto::getName)
                    .setter(DdbUserDto::setName))
            .addAttribute(String.class, a -> a.name("email")
                    .getter(DdbUserDto::getEmail)
                    .setter(DdbUserDto::setEmail))
            .addAttribute(String.class, a -> a.name("description")
                    .getter(DdbUserDto::getDescription)
                    .setter(DdbUserDto::setDescription))
            .addAttribute(String.class, a -> a.name("profileImage")
                    .getter(DdbUserDto::getProfileImage)
                    .setter(DdbUserDto::setProfileImage))
            .addAttribute(EnhancedType.mapOf(String.class, String.class),
                    a -> a.name("socials")
                        .getter(DdbUserDto::getSocials)
                        .setter(DdbUserDto::setSocials))
            .addAttribute(String.class, a -> a.name("providerUserName")
                    .getter(DdbUserDto::getProviderUserName)
                    .setter(DdbUserDto::setProviderUserName))
            .addAttribute(String.class, a -> a.name("providerAvatarUrl")
                    .getter(DdbUserDto::getProviderAvatarUrl)
                    .setter(DdbUserDto::setProviderAvatarUrl))
            .addAttribute(String.class, a -> a.name("providerAccessToken")
                    .getter(DdbUserDto::getProviderAccessToken)
                    .setter(DdbUserDto::setProviderAccessToken))
            .build();
}
