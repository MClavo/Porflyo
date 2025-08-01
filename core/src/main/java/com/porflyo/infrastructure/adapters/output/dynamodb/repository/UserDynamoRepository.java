package com.porflyo.infrastructure.adapters.output.dynamodb.repository;

import com.porflyo.application.ports.output.UserRepository;
import com.porflyo.domain.model.shared.EntityId;
import com.porflyo.domain.model.user.User;
import com.porflyo.infrastructure.adapters.output.dynamodb.common.GenericDynamoRepository;
import com.porflyo.infrastructure.adapters.output.dynamodb.dto.DynamoUserDto;
import com.porflyo.infrastructure.adapters.output.dynamodb.mapper.UserDynamoMapper;
import io.micronaut.core.annotation.NonNull;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

import java.util.Map;
import java.util.Optional;

/**
 * DynamoDB implementation of the {@link UserRepository} port.
 * <p>Serialization details are fully delegated to {@link UserDynamoMapper}.</p>
 */
@Singleton
public class UserDynamoRepository implements UserRepository {

    private final GenericDynamoRepository genericRepo;

    @Inject
    public UserDynamoRepository(GenericDynamoRepository genericRepo) {
        this.genericRepo = genericRepo;
    }


    @Override
    public void save(@NonNull User user) {
        DynamoUserDto dto = UserDynamoMapper.toDto(user);
        Map<String, AttributeValue> item = UserDynamoMapper.toItem(dto);
        genericRepo.putItem(item);
    }

    @Override
    public @NonNull Optional<User> findById(@NonNull EntityId id) {
        Map<String, AttributeValue> key = Map.of(
                "PK", AttributeValue.fromS("USER#" + id.value()),
                "SK", AttributeValue.fromS("PROFILE"));
        return genericRepo.getItem(key)
                .map(UserDynamoMapper::fromItem)
                .map(UserDynamoMapper::toDomain);
    }

    @Override
    public void delete(@NonNull EntityId id) {
        Map<String, AttributeValue> key = Map.of(
                "PK", AttributeValue.fromS("USER#" + id.value()),
                "SK", AttributeValue.fromS("PROFILE"));
        genericRepo.deleteItem(key);
    }
}
