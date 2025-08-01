package com.porflyo.testing.mocks.input;

import com.porflyo.application.ports.input.RepoUseCase;
import com.porflyo.domain.model.GithubRepo;
import com.porflyo.testing.data.TestData;

import java.util.List;
import java.util.function.Function;

/**
 * A mock implementation of the {@link RepoUseCase} interface for testing purposes.
 * <p>
 * This record provides configurable function for repository data retrieval operations,
 * allowing tests to override behavior as needed. Default values are provided via the builder.
 * </p>
 *
 * <p>
 * Usage example:
 * <pre>
 *     MockRepoUseCase repoUseCase = MockRepoUseCase.builder()
 *         .getUserRepos(token -> TestData.DEFAULT_REPOS)
 *         .build();
 * </pre>
 * </p>
 *
 * @param getUserReposFunction Function that handles repository data retrieval with access token parameter.
 */
public record MockRepoUseCase(
        Function<String, List<GithubRepo>> getUserReposFunction
) implements RepoUseCase {

    public static Builder builder() {
        return new Builder();
    }

    public static MockRepoUseCase withDefaults() {
        return builder().build();
    }

    @Override
    public List<GithubRepo> getUserRepos(String accessToken) {
        return getUserReposFunction.apply(accessToken);
    }

    /**
     * Builder for creating MockRepoUseCase instances with custom behavior.
     */
    public static class Builder {
        private Function<String, List<GithubRepo>> getUserReposFunction = token -> TestData.DEFAULT_REPOS;

        /**
         * Sets a custom list of repositories to return for repository requests.
         *
         * @param repos the repositories to return
         * @return this builder instance
         */
        public Builder getUserRepos(List<GithubRepo> repos) {
            this.getUserReposFunction = token -> repos;
            return this;
        }

        /**
         * Sets a custom function for handling repository requests.
         *
         * @param function the function to use
         * @return this builder instance
         */
        public Builder getUserReposFunction(Function<String, List<GithubRepo>> function) {
            this.getUserReposFunction = function;
            return this;
        }

        /**
         * Sets the repository request to throw an exception.
         *
         * @param exception the exception to throw
         * @return this builder instance
         */
        public Builder getUserReposThrows(RuntimeException exception) {
            this.getUserReposFunction = token -> { throw exception; };
            return this;
        }

        /**
         * Builds the MockRepoUseCase instance.
         *
         * @return the configured MockRepoUseCase
         */
        public MockRepoUseCase build() {
            return new MockRepoUseCase(getUserReposFunction);
        }
    }
}
