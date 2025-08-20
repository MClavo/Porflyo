package  com.porflyo.schema;

import static com.porflyo.common.DdbKeys.GSI_PROVIDER_USER_ID;

import com.porflyo.Item.DdbUserItem;

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
            .addAttribute(String.class, a -> a.name("PID")
                .getter(DdbUserItem::getProviderUserId)
                .setter(DdbUserItem::setProviderUserId)
                .tags(StaticAttributeTags.secondaryPartitionKey(GSI_PROVIDER_USER_ID)))
            
                
            // ────────────────────────── User Attributes ──────────────────────────
            .addAttribute(String.class, a -> a.name("userId")
                    .getter(DdbUserItem::getUserId)
                    .setter(DdbUserItem::setUserId))
            .addAttribute(String.class, a -> a.name("nm")
                    .getter(DdbUserItem::getName)
                    .setter(DdbUserItem::setName))
            .addAttribute(String.class, a -> a.name("em")
                    .getter(DdbUserItem::getEmail)
                    .setter(DdbUserItem::setEmail))
            .addAttribute(byte[].class, a -> a.name("ds")
                    .getter(DdbUserItem::getDescription)
                    .setter(DdbUserItem::setDescription))
            .addAttribute(String.class, a -> a.name("pi")
                    .getter(DdbUserItem::getProfileImage)
                    .setter(DdbUserItem::setProfileImage))
            .addAttribute(byte[].class, a -> a.name("sc")
                        .getter(DdbUserItem::getSocials)
                        .setter(DdbUserItem::setSocials))
            .addAttribute(String.class, a -> a.name("pn")
                    .getter(DdbUserItem::getProviderUserName)
                    .setter(DdbUserItem::setProviderUserName))
            .addAttribute(String.class, a -> a.name("pa")
                    .getter(DdbUserItem::getProviderAvatarUrl)
                    .setter(DdbUserItem::setProviderAvatarUrl))
            .addAttribute(String.class, a -> a.name("pt")
                    .getter(DdbUserItem::getProviderAccessToken)
                    .setter(DdbUserItem::setProviderAccessToken))
            .build();
}
