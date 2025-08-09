package com.porflyo.application.ports.input;

import java.util.Optional;

import com.porflyo.application.dto.UserPatchDto;
import com.porflyo.domain.model.ids.ProviderUserId;
import com.porflyo.domain.model.ids.UserId;
import com.porflyo.domain.model.user.User;

import io.micronaut.core.annotation.NonNull;
import io.micronaut.validation.Validated;
import jakarta.validation.Valid;



/**
 * Contract for user-related operations.
 */
@Validated
public interface UserUseCase {
    
    @NonNull UserId create(@Valid @NonNull User user);

    @NonNull Optional<User> findById(@NonNull UserId id);

    @NonNull Optional<User> findByProviderId(@NonNull ProviderUserId providerId);

    @NonNull User patch(@Valid @NonNull UserPatchDto patch);
    
    void delete(@NonNull UserId id);
}
