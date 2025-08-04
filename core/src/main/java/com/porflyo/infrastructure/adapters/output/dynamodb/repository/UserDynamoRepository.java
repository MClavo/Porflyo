package com.porflyo.infrastructure.adapters.output.dynamodb.repository;

import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.porflyo.application.ports.output.UserRepository;
import com.porflyo.domain.model.shared.EntityId;
import com.porflyo.domain.model.user.ProviderAccount;
import com.porflyo.domain.model.user.User;
import com.porflyo.infrastructure.adapters.output.dynamodb.dto.DynamoUserDto;
import com.porflyo.infrastructure.adapters.output.dynamodb.mapper.UserDynamoMapper;
import com.porflyo.infrastructure.adapters.output.dynamodb.schema.UserTableSchema;
import com.porflyo.infrastructure.configuration.DynamoDbConfig;

import io.micronaut.core.annotation.NonNull;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.model.IgnoreNullsMode;
import software.amazon.awssdk.enhanced.dynamodb.model.UpdateItemEnhancedRequest;

/**
 * DynamoDB implementation of the {@link UserRepository} port.
 * <p>
 * Serialization details are fully delegated to {@link UserDynamoMapper}.
 * </p>
 */
@Singleton
public class UserDynamoRepository implements UserRepository {
    private static final Logger log = LoggerFactory.getLogger(UserDynamoRepository.class);
    private final DynamoDbTable<DynamoUserDto> table;
    //private DynamoDbConfig dynamoDbConfig;

    @Inject
    public UserDynamoRepository(DynamoDbEnhancedClient enhanced, DynamoDbConfig dynamoDbConfig) {
        //this.dynamoDbConfig = dynamoDbConfig;
        this.table = enhanced.table(dynamoDbConfig.tableName(), UserTableSchema.SCHEMA);
    }

    @Override
    public void save(@NonNull User user) {
        table.putItem(UserDynamoMapper.toDto(user));
        log.debug("Saved user: {}", user.id().value());
    }

    @Override
    public @NonNull Optional<User> findById(@NonNull EntityId id) {
        Key key = buildUserKey(id);
        DynamoUserDto dto = table.getItem(r -> r.key(key));
        
        if (dto == null) {
            log.debug("User not found: {}", id.value());
        } else {
            log.debug("Found user: {}", id.value());
        }


        return Optional.ofNullable(dto).map(UserDynamoMapper::toDomain);
    }

    
    

    @Override
    public User patch(@NonNull EntityId id, @NonNull Map<String, Object> attrs) {
        if (attrs.isEmpty()) return null;

        // Dto with null fields except for the attributes in attrs
        DynamoUserDto updateItem = UserDynamoMapper.createPatchDto(id, attrs);
        UpdateItemEnhancedRequest<DynamoUserDto> request = createUpdateItemRequest(updateItem);
        
        DynamoUserDto result = table.updateItem(request);
        log.debug("Patched user: {}", id.value());

        return UserDynamoMapper.toDomain(result);
    }

    

    @Override
    public void patchProviderAccount(@NonNull EntityId id, @NonNull ProviderAccount providerAccount) {
        DynamoUserDto updateItem = UserDynamoMapper.createPatchDto(id, providerAccount);

        UpdateItemEnhancedRequest<DynamoUserDto> request = createUpdateItemRequest(updateItem);

        table.updateItem(request);
        log.debug("Patched provider account for user: {}", id.value());
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

    private UpdateItemEnhancedRequest<DynamoUserDto> createUpdateItemRequest(DynamoUserDto updateItem) {
        UpdateItemEnhancedRequest<DynamoUserDto> request =
            UpdateItemEnhancedRequest.builder(DynamoUserDto.class)
            .item(updateItem)
            .ignoreNullsMode(IgnoreNullsMode.SCALAR_ONLY)
            .build();
        return request;
    }

}
