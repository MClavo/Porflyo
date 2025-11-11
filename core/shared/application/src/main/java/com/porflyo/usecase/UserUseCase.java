package com.porflyo.usecase;

import java.util.Optional;

import com.porflyo.dto.UserPatchDto;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.user.User;
import com.porflyo.ports.UserRepository;

import io.micronaut.core.annotation.NonNull;
import io.micronaut.validation.Validated;
import jakarta.inject.Inject;
import jakarta.validation.Valid;

/**
 * Thin application layer orchestrator that delegates pure
 * persistence to the {@link UserRepository}.
 */
@Validated
public class UserUseCase{

    private final  UserRepository repository;

    @Inject
    UserUseCase(UserRepository userRepository) {
        this.repository = userRepository;
    }

    public @NonNull Optional<User> findById(@NonNull UserId id) {
        return repository.findById(id);
    }

    public @NonNull User patch(@NonNull UserId userId, @Valid @NonNull UserPatchDto patch) {
        return repository.patch(userId, patch);
    }
    
    public void delete(@NonNull UserId id) {
        repository.delete(id);
    }
}
