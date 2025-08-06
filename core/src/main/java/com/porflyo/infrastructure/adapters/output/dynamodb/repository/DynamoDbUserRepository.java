package com.porflyo.infrastructure.adapters.output.dynamodb.repository;

import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.porflyo.application.ports.output.UserRepository;
import com.porflyo.domain.model.shared.EntityId;
import com.porflyo.domain.model.user.ProviderAccount;
import com.porflyo.domain.model.user.User;
import com.porflyo.infrastructure.adapters.output.dynamodb.dto.DynamoDbUserDto;
import com.porflyo.infrastructure.adapters.output.dynamodb.mapper.DynamoDbUserMapper;
import com.porflyo.infrastructure.adapters.output.dynamodb.schema.UserTableSchema;
import com.porflyo.infrastructure.configuration.DynamoDbConfig;

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
 * Serialization details are fully delegated to {@link DynamoDbUserMapper}.
 * </p>
 */
@Singleton
@Requires(beans = DynamoDbConfig.class)
public class DynamoDbUserRepository implements UserRepository {
    private static final Logger log = LoggerFactory.getLogger(DynamoDbUserRepository.class);
    private final DynamoDbTable<DynamoDbUserDto> table;
    //private DynamoDbConfig dynamoDbConfig;

    @Inject
    public DynamoDbUserRepository(DynamoDbEnhancedClient enhanced, DynamoDbConfig dynamoDbConfig) {
        //this.dynamoDbConfig = dynamoDbConfig;
        this.table = enhanced.table(dynamoDbConfig.tableName(), UserTableSchema.SCHEMA);
    }

    @Override
    public void save(@NonNull User user) {
        table.putItem(DynamoDbUserMapper.toDto(user));
        log.debug("Saved user: {}", user.id().value());
    }

    @Override
    public @NonNull Optional<User> findById(@NonNull EntityId id) {
        Key key = buildUserKey(id);
        DynamoDbUserDto dto = table.getItem(r -> r.key(key));
        
        if (dto == null) {
            log.debug("User not found: {}", id.value());
        } else {
            log.debug("Found user: {}", id.value());
        }


        return Optional.ofNullable(dto).map(DynamoDbUserMapper::toDomain);
    }

    @Override
    public Optional<User> findByProviderId(@NonNull String providerId) {
        Key key = Key.builder()
                .partitionValue(providerId)
                .build();

        // Query the GSI for provider-user-id-index
        QueryConditional query = QueryConditional.keyEqualTo(key);

        // Even if there is only one item, we need SdkIterable to handle pagination
        SdkIterable<Page<DynamoDbUserDto>> result = table
            .index("provider-user-id-index")
            .query(query);

        DynamoDbUserDto dto = result.stream()
                .flatMap(p -> p.items().stream())
                .findFirst()
                .orElse(null);
        
        if (dto == null) {
            log.debug("User not found for provider ID: {}", providerId);
        } else {
            log.debug("Found user for provider ID: {}", providerId);
        }

        return Optional.ofNullable(dto).map(DynamoDbUserMapper::toDomain);
    }
    

    @Override
    public User patch(@NonNull EntityId id, @NonNull Map<String, Object> attrs) {
        if (attrs.isEmpty()) return null;

        // Dto with null fields except for the attributes in attrs
        DynamoDbUserDto updateItem = DynamoDbUserMapper.createPatchDto(id, attrs);
        UpdateItemEnhancedRequest<DynamoDbUserDto> request = createUpdateItemRequest(updateItem);
        
        DynamoDbUserDto result = table.updateItem(request);
        log.debug("Patched user: {}", id.value());

        return DynamoDbUserMapper.toDomain(result);
    }

    

    @Override
    public User patchProviderAccount(@NonNull EntityId id, @NonNull ProviderAccount providerAccount) {
        DynamoDbUserDto updateItem = DynamoDbUserMapper.createPatchDto(id, providerAccount);

        UpdateItemEnhancedRequest<DynamoDbUserDto> request = createUpdateItemRequest(updateItem);

        DynamoDbUserDto result = table.updateItem(request);
        log.debug("Patched provider account for user: {}", id.value());
        
        return DynamoDbUserMapper.toDomain(result);
    }

    @Override
    public void delete(@NonNull EntityId id) {
        Key key = buildUserKey(id);
        table.deleteItem(r -> r.key(key));
        log.debug("Deleted user: {}", id.value());
    }


    private Key buildUserKey(EntityId id) {
        Key key = Key.builder()
                .partitionValue("USER#" + id.value())
                .sortValue("PROFILE")
                .build();
        return key;
    }

    private UpdateItemEnhancedRequest<DynamoDbUserDto> createUpdateItemRequest(DynamoDbUserDto updateItem) {
        UpdateItemEnhancedRequest<DynamoDbUserDto> request =
            UpdateItemEnhancedRequest.builder(DynamoDbUserDto.class)
            .item(updateItem)
            .ignoreNullsMode(IgnoreNullsMode.SCALAR_ONLY)
            .build();
        return request;
    }

}
