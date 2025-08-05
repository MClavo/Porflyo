package com.porflyo.testing.mocks.ports;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

import java.util.Map;
import java.util.Optional;

import org.mockito.Mockito;

import com.porflyo.application.ports.output.UserRepository;
import com.porflyo.domain.model.shared.EntityId;
import com.porflyo.domain.model.user.ProviderAccount;
import com.porflyo.domain.model.user.User;
import com.porflyo.testing.data.TestData;

import io.micronaut.core.annotation.NonNull;

public final class MockUserRepository implements UserRepository {

    private final UserRepository mock;

    private MockUserRepository(UserRepository mock) {
        this.mock = mock;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static MockUserRepository withDefaults() {
        return builder().build();
    }

    @Override
    public void save(@NonNull User user) {
        mock.save(user);
    }

    @Override
    @NonNull
    public Optional<User> findById(@NonNull EntityId id) {
        return mock.findById(id);
    }

    @Override
    public Optional<User> findByProviderId(@NonNull String providerId) {
        return mock.findByProviderId(providerId);
    }

    @Override
    public User patch(@NonNull EntityId id, @NonNull Map<String, Object> attributes) {
        return mock.patch(id, attributes);
    }

    @Override
    public User patchProviderAccount(@NonNull EntityId id, @NonNull ProviderAccount providerAccount) {
        return mock.patchProviderAccount(id, providerAccount);
    }

    @Override
    public void delete(@NonNull EntityId id) {
        mock.delete(id);
    }

    public UserRepository mock() {
        return mock;
    }

    public static class Builder {
        private final UserRepository mock = Mockito.mock(UserRepository.class);

        public Builder saveDoesNothing() {
            doNothing().when(mock).save(any());
            return this;
        }

        public Builder findByIdReturns(User user) {
            when(mock.findById(any())).thenReturn(Optional.ofNullable(user));
            return this;
        }

        public Builder findByIdThrows(RuntimeException ex) {
            when(mock.findById(any())).thenThrow(ex);
            return this;
        }

        public Builder findByProviderIdReturns(User user) {
            when(mock.findByProviderId(any())).thenReturn(Optional.ofNullable(user));
            return this;
        }

        public Builder findByProviderIdThrows(RuntimeException ex) {
            when(mock.findByProviderId(any())).thenThrow(ex);
            return this;
        }

        public Builder patchDoesNothing() {
            doNothing().when(mock).patch(any(), any());
            return this;
        }

        public Builder patchProviderAccountDoesNothing() {
            doNothing().when(mock).patchProviderAccount(any(), any());
            return this;
        }

        public Builder deleteDoesNothing() {
            doNothing().when(mock).delete(any());
            return this;
        }

        public Builder withDefaultUser() {
            return findByIdReturns(TestData.DEFAULT_USER);
        }

        public MockUserRepository build() {
            return new MockUserRepository(mock);
        }
    }
}
