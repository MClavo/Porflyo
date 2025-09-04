package com.porflyo.repository;

import static com.porflyo.common.DdbKeys.GSI_PROVIDER_USER_ID;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.porflyo.dto.UserPatchDto;
import com.porflyo.model.ids.ProviderUserId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.user.ProviderAccount;
import com.porflyo.model.user.User;
import com.porflyo.ports.UserRepository;
import com.porflyo.Item.DdbUserItem;
import com.porflyo.mapper.DdbUserMapper;
import  com.porflyo.schema.UserTableSchema;
import com.porflyo.configuration.DdbConfig;

import io.micronaut.context.annotation.Requires;
import io.micronaut.core.annotation.NonNull;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import software.amazon.awssdk.core.pagination.sync.SdkIterable;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.model.IgnoreNullsMode;
import software.amazon.awssdk.enhanced.dynamodb.model.Page;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import software.amazon.awssdk.enhanced.dynamodb.model.UpdateItemEnhancedRequest;

/**
 * DynamoDB implementation of the {@link UserRepository} port.
 * <p>
 * Serialization details are fully delegated to {@link DdbUserMapper}.
 * </p>
 */
@Singleton
@Requires(beans = DdbConfig.class)
public class DdbUserRepository implements UserRepository {
   
    private static final Logger log = LoggerFactory.getLogger(DdbUserRepository.class);
    private final DynamoDbTable<DdbUserItem> table;
    private final DdbUserMapper ddbUserMapper;

    @Inject
    public DdbUserRepository(DynamoDbEnhancedClient enhanced, DdbConfig dynamoDbConfig, DdbUserMapper ddbUserMapper) {
        this.table = enhanced.table(dynamoDbConfig.tableName(), UserTableSchema.SCHEMA);
        this.ddbUserMapper = ddbUserMapper;
    }

    // ────────────────────────── Save ──────────────────────────

    @Override
    public void save(@NonNull User user) {
        table.putItem(ddbUserMapper.toItem(user));
        log.debug("Saved user: {}", user.id().value());
    }


    // ────────────────────────── Find ──────────────────────────
    
    @Override
    public @NonNull Optional<User> findById(@NonNull UserId id) {
        Key key = buildUserKey(id);
        DdbUserItem dto = table.getItem(r -> r.key(key));
        
        if (dto == null) {
            log.debug("User not found: {}", id.value());
        } else {
            log.debug("Found user: {}", id.value());
        }


        return Optional.ofNullable(dto).map(ddbUserMapper::toDomain);
    }

    @Override
    public Optional<User> findByProviderId(@NonNull ProviderUserId providerId) {
        Key key = Key.builder()
                .partitionValue(providerId.value())
                .build();

        // Query the GSI for provider-user-id-index
        QueryConditional query = QueryConditional.keyEqualTo(key);

        // Even if there is only one item, we need SdkIterable to handle pagination
        SdkIterable<Page<DdbUserItem>> result = table
            .index(GSI_PROVIDER_USER_ID)
            .query(query);

        DdbUserItem dto = result.stream()
                .flatMap(p -> p.items().stream())
                .findFirst()
                .orElse(null);
        
        if (dto == null) {
            log.debug("User not found for provider ID: {}", providerId.value());
        } else {
            log.debug("Found user for provider ID: {}", providerId.value());
        }

        return Optional.ofNullable(dto).map(ddbUserMapper::toDomain);
    }
    

    // ────────────────────────── Patch ──────────────────────────

    @Override
    public User patch(@NonNull UserId id, @NonNull UserPatchDto patch) {
       
        // Dto with null fields except for the attributes in attrs
        DdbUserItem updateItem = ddbUserMapper.patchToItem(id, patch);
        UpdateItemEnhancedRequest<DdbUserItem> request = createUpdateItemRequest(updateItem);
        
        DdbUserItem result = table.updateItem(request);
        log.debug("Patched user: {}", id.value());

        return ddbUserMapper.toDomain(result);
    }

    @Override
    public User patchProviderAccount(@NonNull UserId id, @NonNull ProviderAccount providerAccount) {
        DdbUserItem updateItem = ddbUserMapper.providerToItem(id, providerAccount);
        UpdateItemEnhancedRequest<DdbUserItem> request = createUpdateItemRequest(updateItem);

        DdbUserItem result = table.updateItem(request);
        log.debug("Patched provider account for user: {}", id.value());

        return ddbUserMapper.toDomain(result);
    }


    // ────────────────────────── Delete ──────────────────────────

    @Override
    public void delete(@NonNull UserId id) {
        Key key = buildUserKey(id);
        table.deleteItem(r -> r.key(key));
        log.debug("Deleted user: {}", id.value());
    }


    // ────────────────────────── Private Methods ──────────────────────────

    private Key buildUserKey(UserId id) {
        Key key = Key.builder()
                .partitionValue("USER#" + id.value())
                .sortValue("PROFILE")
                .build();
        return key;
    }

    private UpdateItemEnhancedRequest<DdbUserItem> createUpdateItemRequest(DdbUserItem updateItem) {
        UpdateItemEnhancedRequest<DdbUserItem> request =
            UpdateItemEnhancedRequest.builder(DdbUserItem.class)
            .item(updateItem)
            .ignoreNullsMode(IgnoreNullsMode.SCALAR_ONLY)
            .build();
        return request;
    }

}
