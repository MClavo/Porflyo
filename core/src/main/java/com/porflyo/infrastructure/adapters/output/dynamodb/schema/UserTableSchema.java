package com.porflyo.infrastructure.adapters.output.dynamodb.schema;

import com.porflyo.infrastructure.adapters.output.dynamodb.dto.DynamoDbUserDto;

import software.amazon.awssdk.enhanced.dynamodb.EnhancedType;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.mapper.StaticAttributeTags;

/**
 * Defines the DynamoDB table schema for the {@link DynamoDbUserDto} entity.
 * <p>
 * This class provides a static {@code TableSchema} instance that maps the
 * attributes
 * of {@code DynamoUserDto} to their corresponding DynamoDB table columns.
 * </p>
 * <ul>
 * <li><b>PK</b>: Primary partition key</li>
 * <li><b>SK</b>: Primary sort key</li>
 * <li><b>name</b>: User's display name</li>
 * <li><b>email</b>: User's email address</li>
 * <li><b>description</b>: User's description or bio</li>
 * <li><b>providerUserId</b>: ID from the authentication provider</li>
 * <li><b>providerUserName</b>: Username from the authentication provider</li>
 * <li><b>profileImage</b>: URL to the user's profile image</li>
 * <li><b>accessToken</b>: Access token from the authentication provider</li>
 * <li><b>socials</b>: Map of user's social accounts</li>
 * </ul>
 * <p>
 * This class is final and cannot be instantiated.
 * </p>
 */
public final class UserTableSchema {

    private UserTableSchema() {
    }

    public static final TableSchema<DynamoDbUserDto> SCHEMA = TableSchema.builder(DynamoDbUserDto.class)
            .newItemSupplier(DynamoDbUserDto::new)

            // ────────────────────────── Key Attributes ──────────────────────────
            .addAttribute(String.class, a -> a.name("PK")
                    .getter(DynamoDbUserDto::getPk)
                    .setter(DynamoDbUserDto::setPk)
                    .tags(StaticAttributeTags.primaryPartitionKey()))
            .addAttribute(String.class, a -> a.name("SK")
                    .getter(DynamoDbUserDto::getSk)
                    .setter(DynamoDbUserDto::setSk)
                    .tags(StaticAttributeTags.primarySortKey()))
            
            // GSI for provider user ID, used for lookups in OAuth flow
            .addAttribute(String.class, a -> a.name("providerUserId")
                .getter(DynamoDbUserDto::getProviderUserId)
                .setter(DynamoDbUserDto::setProviderUserId)
                .tags(StaticAttributeTags.secondaryPartitionKey("provider-user-id-index")))
            
                
            // ────────────────────────── User Attributes ──────────────────────────
            .addAttribute(String.class, a -> a.name("name")
                    .getter(DynamoDbUserDto::getName)
                    .setter(DynamoDbUserDto::setName))
            .addAttribute(String.class, a -> a.name("email")
                    .getter(DynamoDbUserDto::getEmail)
                    .setter(DynamoDbUserDto::setEmail))
            .addAttribute(String.class, a -> a.name("description")
                    .getter(DynamoDbUserDto::getDescription)
                    .setter(DynamoDbUserDto::setDescription))
            .addAttribute(String.class, a -> a.name("providerUserName")
                    .getter(DynamoDbUserDto::getProviderUserName)
                    .setter(DynamoDbUserDto::setProviderUserName))
            .addAttribute(String.class, a -> a.name("providerAvatarUrl")
                    .getter(DynamoDbUserDto::getProviderAvatarUrl)
                    .setter(DynamoDbUserDto::setProviderAvatarUrl))
            .addAttribute(String.class, a -> a.name("providerAccessToken")
                    .getter(DynamoDbUserDto::getProviderAccessToken)
                    .setter(DynamoDbUserDto::setProviderAccessToken))
            .addAttribute(String.class, a -> a.name("profileImage")
                    .getter(DynamoDbUserDto::getProfileImage)
                    .setter(DynamoDbUserDto::setProfileImage))
            .addAttribute(String.class, a -> a.name("accessToken")
                    .getter(DynamoDbUserDto::getProviderAccessToken)
                    .setter(DynamoDbUserDto::setProviderAccessToken))
            .addAttribute(
                EnhancedType.mapOf(String.class, String.class),
                a -> a.name("socials")
                    .getter(DynamoDbUserDto::getSocials)
                    .setter(DynamoDbUserDto::setSocials)
            )
            .build();
}
