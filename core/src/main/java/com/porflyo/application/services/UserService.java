package com.porflyo.application.services;

import java.util.Map;
import java.util.Optional;

import com.porflyo.application.ports.input.UserUseCase;
import com.porflyo.application.ports.output.UserRepository;
import com.porflyo.domain.model.shared.EntityId;
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
    public @NonNull EntityId create(@Valid @NonNull User user) {
        repository.save(user);
        return user.id();       // ID already generated at domain level
    }

    @Override
    public @NonNull Optional<User> findById(@NonNull EntityId id) {
        return repository.findById(id);
    }

    @Override
    public @NonNull User patch(@Valid @NonNull EntityId id, @NonNull Map<String, Object> attributes) {
        return repository.patch(id, attributes);
    }
    

    @Override
    public void delete(@NonNull EntityId id) {
        repository.delete(id);
    }
}
