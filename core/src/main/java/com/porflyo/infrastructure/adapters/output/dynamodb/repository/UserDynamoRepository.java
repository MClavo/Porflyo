package com.porflyo.infrastructure.adapters.output.dynamodb.repository;

import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import com.porflyo.application.ports.output.UserRepository;
import com.porflyo.domain.model.shared.EntityId;
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
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

/**
 * DynamoDB implementation of the {@link UserRepository} port.
 * <p>
 * Serialization details are fully delegated to {@link UserDynamoMapper}.
 * </p>
 */
@Singleton
public class UserDynamoRepository implements UserRepository {

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
    }

    @Override
    public @NonNull Optional<User> findById(@NonNull EntityId id) {
        Key key = buildUserKey(id);
        DynamoUserDto dto = table.getItem(r -> r.key(key));
        return Optional.ofNullable(dto).map(UserDynamoMapper::toDomain);
    }

    @Override
    public void patch(@NonNull EntityId id, @NonNull Map<String, Object> attrs) {
        if (attrs.isEmpty()) return;

        // Dto with null fields for attributes except those in attrs
        DynamoUserDto updateItem = UserDynamoMapper.createPatchDto(attrs);

        UpdateItemEnhancedRequest<DynamoUserDto> request =
            UpdateItemEnhancedRequest.builder(DynamoUserDto.class)
            .item(updateItem)
            .ignoreNullsMode(IgnoreNullsMode.SCALAR_ONLY)
            .build();

        table.updateItem(request);
    }

    private Key buildUserKey(EntityId id) {
        Key key = Key.builder()
                .partitionValue("USER#" + id.value())
                .sortValue("PROFILE")
                .build();
        return key;
    }

    @Deprecated
    private AttributeValue toAttributeValue(Object value) {
        return switch (value) {
            case String s -> AttributeValue.builder().s(s).build();
            case Number n -> AttributeValue.builder().n(n.toString()).build();
            case Boolean b -> AttributeValue.builder().bool(b).build();
            case Map<?, ?> m -> {
                @SuppressWarnings("unchecked")
                Map<String, String> map = (Map<String, String>) m;
                Map<String, AttributeValue> converted = map.entrySet().stream()
                        .collect(Collectors.toMap(
                                Map.Entry::getKey,
                                e -> AttributeValue.builder().s(e.getValue()).build()));
                yield AttributeValue.builder().m(converted).build();
            }
            default -> AttributeValue.builder().s(value.toString()).build();
        };
    }

    @Override
    public void delete(@NonNull EntityId id) {
        Key key = Key.builder()
                .partitionValue("USER#" + id.value())
                .sortValue("PROFILE")
                .build();
        table.deleteItem(r -> r.key(key));
    }
}
