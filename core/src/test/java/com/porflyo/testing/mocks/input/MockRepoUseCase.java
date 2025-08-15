package com.porflyo.testing.mocks.input;

import java.util.List;
import java.util.function.Function;

import com.porflyo.application.ports.input.ProviderUseCase;
import com.porflyo.domain.model.ids.UserId;
import com.porflyo.domain.model.provider.ProviderRepo;
import com.porflyo.testing.data.TestData;

/**
 * A mock implementation of the {@link ProviderUseCase} interface for testing purposes.
 */
public record MockRepoUseCase(
    Function<String, List<ProviderRepo>> getUserReposByToken,
    Function<UserId, List<ProviderRepo>> getUserReposById
) implements ProviderUseCase {

    public static Builder builder() {
        return new Builder();
    }

    public static MockRepoUseCase withDefaults() {
        return builder().build();
    }

    @Override
    public List<ProviderRepo> getUserRepos(String accessToken) {
        return getUserReposByToken.apply(accessToken);
    }

    @Override
    public List<ProviderRepo> getUserRepos(UserId userId) {
        return getUserReposById.apply(userId);
    }

    
    /* Builder for creating mock instances of RepoUseCase */

    public static class Builder {
        private Function<String, List<ProviderRepo>> getUserReposByToken = token -> TestData.DEFAULT_REPOS;
        private Function<UserId, List<ProviderRepo>> getUserReposById = id -> TestData.DEFAULT_REPOS;

        public Builder getUserReposByToken(Function<String, List<ProviderRepo>> function) {
            this.getUserReposByToken = function;
            return this;
        }

        public Builder getUserReposById(Function<UserId, List<ProviderRepo>> function) {
            this.getUserReposById = function;
            return this;
        }

        public Builder getUserRepos(List<ProviderRepo> repos) {
            this.getUserReposByToken = token -> repos;
            this.getUserReposById = id -> repos;
            return this;
        }

        public Builder getUserReposThrows(RuntimeException exception) {
            this.getUserReposByToken = token -> { throw exception; };
            this.getUserReposById = id -> { throw exception; };
            return this;
        }

        public MockRepoUseCase build() {
            return new MockRepoUseCase(getUserReposByToken, getUserReposById);
        }
    }
}
