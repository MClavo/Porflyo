package com.porflyo.infrastructure.adapters.output.dynamodb.schema;

import com.porflyo.infrastructure.adapters.output.dynamodb.dto.DynamoUserDto;

import software.amazon.awssdk.enhanced.dynamodb.EnhancedType;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.mapper.StaticAttributeTags;

/**
 * Defines the DynamoDB table schema for the {@link DynamoUserDto} entity.
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
 * <li><b>avatarUrl</b>: URL to the user's avatar image</li>
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

    public static final TableSchema<DynamoUserDto> SCHEMA = TableSchema.builder(DynamoUserDto.class)
            .newItemSupplier(DynamoUserDto::new)
            .addAttribute(String.class, a -> a.name("PK")
                    .getter(DynamoUserDto::getPk)
                    .setter(DynamoUserDto::setPk)
                    .tags(StaticAttributeTags.primaryPartitionKey()))
            .addAttribute(String.class, a -> a.name("SK")
                    .getter(DynamoUserDto::getSk)
                    .setter(DynamoUserDto::setSk)
                    .tags(StaticAttributeTags.primarySortKey()))
            .addAttribute(String.class, a -> a.name("name")
                    .getter(DynamoUserDto::getName)
                    .setter(DynamoUserDto::setName))
            .addAttribute(String.class, a -> a.name("email")
                    .getter(DynamoUserDto::getEmail)
                    .setter(DynamoUserDto::setEmail))
            .addAttribute(String.class, a -> a.name("description")
                    .getter(DynamoUserDto::getDescription)
                    .setter(DynamoUserDto::setDescription))
            .addAttribute(String.class, a -> a.name("providerUserId")
                    .getter(DynamoUserDto::getProviderUserId)
                    .setter(DynamoUserDto::setProviderUserId))
            .addAttribute(String.class, a -> a.name("providerUserName")
                    .getter(DynamoUserDto::getProviderUserName)
                    .setter(DynamoUserDto::setProviderUserName))
            .addAttribute(String.class, a -> a.name("providerAvatarUrl")
                    .getter(DynamoUserDto::getProviderAvatarUrl)
                    .setter(DynamoUserDto::setProviderAvatarUrl))
            .addAttribute(String.class, a -> a.name("providerAccessToken")
                    .getter(DynamoUserDto::getProviderAccessToken)
                    .setter(DynamoUserDto::setProviderAccessToken))
            .addAttribute(String.class, a -> a.name("avatarUrl")
                    .getter(DynamoUserDto::getAvatarUrl)
                    .setter(DynamoUserDto::setAvatarUrl))
            .addAttribute(String.class, a -> a.name("accessToken")
                    .getter(DynamoUserDto::getProviderAccessToken)
                    .setter(DynamoUserDto::setProviderAccessToken))
            .addAttribute(
                EnhancedType.mapOf(String.class, String.class),
                a -> a.name("socials")
                    .getter(DynamoUserDto::getSocials)
                    .setter(DynamoUserDto::setSocials)
            )
            .build();
}
