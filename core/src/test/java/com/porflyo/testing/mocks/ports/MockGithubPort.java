package com.porflyo.testing.mocks.ports;

import java.util.List;
import java.util.function.Supplier;

import com.porflyo.application.ports.output.ProviderPort;
import com.porflyo.domain.model.provider.ProviderRepo;
import com.porflyo.domain.model.provider.ProviderUser;
import com.porflyo.testing.data.TestData;


/**
 * Mock implementation of the {@link ProviderPort} interface for testing purposes.
 * <p>
 * This record allows for flexible configuration of return values and exceptions
 * for each method, using {@link Supplier} instances. It is intended to be used
 * in unit tests to simulate various behaviors of the GithubPort without making
 * real network calls.
 * </p>
 *
 * <p>
 * Usage example:
 * <pre>
 * MockGithubPort mockPort = MockGithubPort.builder()
 *     .accessToken("custom_token")
 *     .githubUser(customUser)
 *     .repositories(customRepos)
 *     .throwOnExchange(new RuntimeException("Exchange failed"))
 *     .build();
 * </pre>
 * </p>
 *
 * <ul>
 *   <li>{@code accessTokenSupplier} - Supplies the access token to return from {@link #exchangeCodeForAccessToken(String)}.</li>
 *   <li>{@code userSupplier} - Supplies the {@link ProviderUser} to return from {@link #getUserData(String)}.</li>
 *   <li>{@code repositoriesSupplier} - Supplies the list of {@link ProviderRepo} to return from {@link #getUserRepos(String)}.</li>
 *   <li>{@code exchangeExceptionSupplier} - Supplies an exception to throw from {@link #exchangeCodeForAccessToken(String)}, or {@code null} for none.</li>
 *   <li>{@code userDataExceptionSupplier} - Supplies an exception to throw from {@link #getUserData(String)}, or {@code null} for none.</li>
 *   <li>{@code repositoriesExceptionSupplier} - Supplies an exception to throw from {@link #getUserRepos(String)}, or {@code null} for none.</li>
 * </ul>
 *
 * <p>
 * The {@link Builder} inner class provides a fluent API for configuring the mock.
 * </p>
 *
 * @see ProviderPort
 * @see TestData
 */
public record MockGithubPort(
    Supplier<String> accessTokenSupplier,
    Supplier<ProviderUser> userSupplier,
    Supplier<List<ProviderRepo>> repositoriesSupplier,
    Supplier<RuntimeException> exchangeExceptionSupplier,
    Supplier<RuntimeException> userDataExceptionSupplier,
    Supplier<RuntimeException> repositoriesExceptionSupplier
) implements ProviderPort {

    public static Builder builder() {
        return new Builder();
    }

    public static MockGithubPort withDefaults() {
        return builder().build();
    }

    @Override
    public String exchangeCodeForAccessToken(String code) {
        if (exchangeExceptionSupplier.get() != null) throw exchangeExceptionSupplier.get();
        return accessTokenSupplier.get();
    }

    @Override
    public ProviderUser getUserData(String accessToken) {
        if (userDataExceptionSupplier.get() != null) throw userDataExceptionSupplier.get();
        return userSupplier.get();
    }

    @Override
    public List<ProviderRepo> getUserRepos(String accessToken) {
        if (repositoriesExceptionSupplier.get() != null) throw repositoriesExceptionSupplier.get();
        return repositoriesSupplier.get();
    }

    public static class Builder {
        private Supplier<String> accessTokenSupplier = () -> TestData.DEFAULT_ACCESS_TOKEN;
        private Supplier<ProviderUser> userSupplier = () -> TestData.DEFAULT_GITHUB_USER;
        private Supplier<List<ProviderRepo>> repositoriesSupplier = () -> TestData.DEFAULT_REPOS;

        private Supplier<RuntimeException> exchangeExceptionSupplier = () -> null;
        private Supplier<RuntimeException> userDataExceptionSupplier = () -> null;
        private Supplier<RuntimeException> repositoriesExceptionSupplier = () -> null;

        public Builder accessToken(String token) {
            this.accessTokenSupplier = () -> token;
            return this;
        }

        public Builder githubUser(ProviderUser user) {
            this.userSupplier = () -> user;
            return this;
        }

        public Builder repositories(List<ProviderRepo> repos) {
            this.repositoriesSupplier = () -> repos;
            return this;
        }

        public Builder throwOnExchange(RuntimeException ex) {
            this.exchangeExceptionSupplier = () -> ex;
            return this;
        }

        public Builder throwOnGetUserData(RuntimeException ex) {
            this.userDataExceptionSupplier = () -> ex;
            return this;
        }

        public Builder throwOnGetRepositories(RuntimeException ex) {
            this.repositoriesExceptionSupplier = () -> ex;
            return this;
        }

        public MockGithubPort build() {
            return new MockGithubPort(
                accessTokenSupplier,
                userSupplier,
                repositoriesSupplier,
                exchangeExceptionSupplier,
                userDataExceptionSupplier,
                repositoriesExceptionSupplier
            );
        }
    }
}
