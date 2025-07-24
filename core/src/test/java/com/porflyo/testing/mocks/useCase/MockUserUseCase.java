package com.porflyo.testing.mocks.useCase;

import com.porflyo.application.ports.input.UserUseCase;
import com.porflyo.domain.model.GithubUser;
import com.porflyo.testing.data.TestData;

import java.util.function.Function;

/**
 * A mock implementation of the {@link UserUseCase} interface for testing purposes.
 * <p>
 * This record provides configurable function for user data retrieval operations,
 * allowing tests to override behavior as needed. Default values are provided via the builder.
 * </p>
 *
 * <p>
 * Usage example:
 * <pre>
 *     MockUserUseCase userUseCase = MockUserUseCase.builder()
 *         .getUserData(token -> TestData.DEFAULT_USER)
 *         .build();
 * </pre>
 * </p>
 *
 * @param getUserDataFunction Function that handles user data retrieval with access token parameter.
 */
public record MockUserUseCase(
        Function<String, GithubUser> getUserDataFunction
) implements UserUseCase {

    public static Builder builder() {
        return new Builder();
    }

    public static MockUserUseCase withDefaults() {
        return builder().build();
    }

    @Override
    public GithubUser getUserData(String accessToken) {
        return getUserDataFunction.apply(accessToken);
    }

    /**
     * Builder for creating MockUserUseCase instances with custom behavior.
     */
    public static class Builder {
        private Function<String, GithubUser> getUserDataFunction = token -> TestData.DEFAULT_USER;

        /**
         * Sets a custom user to return for user data requests.
         *
         * @param user the user to return
         * @return this builder instance
         */
        public Builder getUserData(GithubUser user) {
            this.getUserDataFunction = token -> user;
            return this;
        }

        /**
         * Sets a custom function for handling user data requests.
         *
         * @param function the function to use
         * @return this builder instance
         */
        public Builder getUserDataFunction(Function<String, GithubUser> function) {
            this.getUserDataFunction = function;
            return this;
        }

        /**
         * Sets the user data request to throw an exception.
         *
         * @param exception the exception to throw
         * @return this builder instance
         */
        public Builder getUserDataThrows(RuntimeException exception) {
            this.getUserDataFunction = token -> { throw exception; };
            return this;
        }

        /**
         * Builds the MockUserUseCase instance.
         *
         * @return the configured MockUserUseCase
         */
        public MockUserUseCase build() {
            return new MockUserUseCase(getUserDataFunction);
        }
    }
}
