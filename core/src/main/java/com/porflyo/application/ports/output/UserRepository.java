package com.porflyo.application.ports.output;

import java.util.Optional;

import com.porflyo.application.dto.UserPatchDto;
import com.porflyo.domain.model.ids.ProviderUserId;
import com.porflyo.domain.model.ids.UserId;
import com.porflyo.domain.model.user.ProviderAccount;
import com.porflyo.domain.model.user.User;

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
