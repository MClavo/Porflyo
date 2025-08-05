package com.porflyo.testing.mocks.input;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Map;
import java.util.Optional;

import com.porflyo.application.ports.input.UserUseCase;
import com.porflyo.domain.model.shared.EntityId;
import com.porflyo.domain.model.user.User;

/**
 * Mockito-based mock of {@link UserUseCase} for unit tests.
 * Allows stubbing of methods via fluent builder syntax.
 */
public final class MockUserUseCase {

    private final UserUseCase mock;

    private MockUserUseCase(UserUseCase mock) {
        this.mock = mock;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static MockUserUseCase withDefaults() {
        return builder().build();
    }

    public UserUseCase instance() {
        return mock;
    }

    public static final class Builder {
        private final UserUseCase mock = mock(UserUseCase.class);

        public Builder withCreateReturn(EntityId id) {
            when(mock.create(any(User.class))).thenReturn(id);
            return this;
        }

        public Builder withFindReturn(EntityId id, User user) {
            when(mock.findById(eq(id))).thenReturn(Optional.of(user));
            return this;
        }

        public Builder withFindEmpty(EntityId id) {
            when(mock.findById(eq(id))).thenReturn(Optional.empty());
            return this;
        }

        public Builder withPatchReturn(EntityId id, Map<String, Object> attributes, User user) {
            when(mock.patch(eq(id), eq(attributes))).thenReturn(user);
            return this;
        }

        public Builder withPatchAnyReturn(User user) {
            when(mock.patch(any(EntityId.class), anyMap())).thenReturn(user);
            return this;
        }

        public Builder withDelete() {
            doNothing().when(mock).delete(any(EntityId.class));
            return this;
        }

        public UserUseCase buildInstance() {
            return mock;
        }

        public MockUserUseCase build() {
            return new MockUserUseCase(mock);
        }
    }
}
