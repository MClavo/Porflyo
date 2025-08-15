package com.porflyo.application.services;

import java.util.Optional;

import com.porflyo.application.dto.UserPatchDto;
import com.porflyo.application.ports.input.UserUseCase;
import com.porflyo.application.ports.output.UserRepository;
import com.porflyo.domain.model.ids.UserId;
import com.porflyo.domain.model.user.User;

import io.micronaut.core.annotation.NonNull;
import io.micronaut.validation.Validated;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import jakarta.validation.Valid;

/**
 * Thin application layer orchestrator that delegates pure
 * persistence to the {@link UserRepository}.
 */
@Singleton
@Validated
public class UserService implements UserUseCase{

    private final  UserRepository repository;

    @Inject
    UserService(UserRepository userRepository) {
        this.repository = userRepository;
    }

    @Override
    public @NonNull Optional<User> findById(@NonNull UserId id) {
        return repository.findById(id);
    }

    @Override
    public @NonNull User patch(@NonNull UserId userId, @Valid @NonNull UserPatchDto patch) {
        return repository.patch(userId, patch);
    }
    
    @Override
    public void delete(@NonNull UserId id) {
        repository.delete(id);
    }
}
