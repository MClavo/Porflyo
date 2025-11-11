package com.porflyo.ports;

import java.util.Optional;

import com.porflyo.dto.UserPatchDto;
import com.porflyo.model.ids.ProviderUserId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.user.ProviderAccount;
import com.porflyo.model.user.User;

import io.micronaut.core.annotation.NonNull;

/**
 * Persistence abstraction for {@link User} aggregates.
 * Implemented in the infrastructure layer (e.g. DynamoDB).
 */
public interface UserRepository {

    void save(@NonNull User user);

    @NonNull Optional<User> findById(@NonNull UserId id);

    @NonNull Optional<User> findByProviderId(@NonNull ProviderUserId providerId);

    @NonNull User patch(@NonNull UserId userId, @NonNull UserPatchDto patch);

    @NonNull User patchProviderAccount(@NonNull UserId userId, @NonNull ProviderAccount account);

    void delete(@NonNull UserId id);
}
