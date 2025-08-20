package com.porflyo.ports.input;

import java.util.Optional;

import com.porflyo.dto.UserPatchDto;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.user.User;

import io.micronaut.core.annotation.NonNull;
import io.micronaut.validation.Validated;
import jakarta.validation.Valid;



/**
 * UserUseCase defines the input ports for user-related operations.
 * It provides methods to find, patch, and delete users.
 * Creation is handled by the Auth service.
 */
@Validated
public interface UserUseCase {
    @NonNull Optional<User> findById(@NonNull UserId id);

    @NonNull User patch(@NonNull UserId id, @Valid @NonNull UserPatchDto patch);

    void delete(@NonNull UserId id);
}
