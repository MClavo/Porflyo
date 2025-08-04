package com.porflyo.testing.mocks.input;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;

import com.porflyo.application.ports.input.UserUseCase;
import com.porflyo.domain.model.shared.EntityId;
import com.porflyo.domain.model.user.User;

import io.micronaut.core.annotation.NonNull;

/**
 * Extremely lightweight in-memory mock for {@link UserUseCase}.
 * <p>
 * – Uses a plain {@link HashMap} as backing store.<br>
 * – Allows optional overrides via builder lambdas.<br>
 * – Perfect for unit tests where the real repository is irrelevant.
 */
public final class MockUserUseCase implements UserUseCase {

    /* --------------------------------------------------------------------- */
    /* Backing store & optional overrides */
    /* --------------------------------------------------------------------- */

    private final Map<EntityId, User> store = new HashMap<>();

    private final Function<User, EntityId> createFn;
    private final Function<EntityId, Optional<User>> findFn;
    private final Function<User, User> updateFn;
    private final Function<EntityId, Boolean> deleteFn;

    /* --------------------------------------------------------------------- */
    /* Constructor (package-private, use builder) */
    /* --------------------------------------------------------------------- */

    public MockUserUseCase(Function<User, EntityId> createFn,
            Function<EntityId, Optional<User>> findFn,
            Function<User, User> updateFn,
            Function<EntityId, Boolean> deleteFn) {
        this.createFn = createFn;
        this.findFn = findFn;
        this.updateFn = updateFn;
        this.deleteFn = deleteFn;
    }

    /* --------------------------------------------------------------------- */
    /* Builder – override only what you need */
    /* --------------------------------------------------------------------- */

    public static Builder builder() {
        return new Builder();
    }

    public static MockUserUseCase withDefaults() {
        return builder().build();
    }

    public static final class Builder {
        private final Map<EntityId, User> seed = new HashMap<>();

        private Function<User, EntityId> createFn;
        private Function<EntityId, Optional<User>> findFn;
        private Function<User, User> updateFn;
        private Function<EntityId, Boolean> deleteFn;

        /** Pre-populate the in-memory store. */
        public Builder seed(User... users) {
            Arrays.stream(users).forEach(u -> seed.put(u.id(), u));
            return this;
        }

        public Builder onCreate(Function<User, EntityId> fn) {
            this.createFn = fn;
            return this;
        }

        public Builder onFind(Function<EntityId, Optional<User>> fn) {
            this.findFn = fn;
            return this;
        }

        public Builder onUpdate(Function<User, User> fn) {
            this.updateFn = fn;
            return this;
        }

        public Builder onDelete(Function<EntityId, Boolean> fn) {
            this.deleteFn = fn;
            return this;
        }

        public MockUserUseCase build() {
            var mock = new MockUserUseCase(
                    createFn != null ? createFn : user -> {seed.put(user.id(), user);  return user.id();},
                    findFn   != null ? findFn   : id   -> Optional.ofNullable(seed.get(id)),
                    updateFn != null ? updateFn : user -> {seed.put(user.id(), user);  return user;},
                    deleteFn != null ? deleteFn : id   -> seed.remove(id) != null);
                    
            mock.store.putAll(seed); // copy initial data
            return mock;
        }
    }

    /* --------------------------------------------------------------------- */
    /* Implementation of UserUseCase */
    /* --------------------------------------------------------------------- */

    @Override
    public @NonNull EntityId create(@NonNull User user) {
        return createFn.apply(user);
    }

    @Override
    public @NonNull Optional<User> findById(@NonNull EntityId id) {
        return findFn.apply(id);
    }

    @Override
    public @NonNull User update(@NonNull User user) {
        return updateFn.apply(user);
    }

    @Override
    public void delete(@NonNull EntityId id) {
        deleteFn.apply(id);
    }
}
