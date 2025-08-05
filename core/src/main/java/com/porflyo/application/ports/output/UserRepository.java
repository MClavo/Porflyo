package com.porflyo.application.ports.output;

import java.util.Map;
import java.util.Optional;

import com.porflyo.domain.model.shared.EntityId;
import com.porflyo.domain.model.user.ProviderAccount;
import com.porflyo.domain.model.user.User;

import io.micronaut.core.annotation.NonNull;

/**
 * Persistence abstraction for {@link User} aggregates.
 * Implemented in the infrastructure layer (e.g. DynamoDB).
 */
public interface UserRepository {

    void save(@NonNull User user);  // Create or Update

    @NonNull
    Optional<User> findById(@NonNull EntityId id);

    Optional<User> findByProviderId(@NonNull String providerId);

    User patch(@NonNull EntityId id, @NonNull Map<String, Object> attributes);

    User patchProviderAccount(@NonNull EntityId id, @NonNull ProviderAccount providerAccount);

    void delete(@NonNull EntityId id);
    
}
