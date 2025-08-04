package com.porflyo.testing.mocks.input;

import com.porflyo.application.ports.input.AuthUseCase;
import com.porflyo.domain.model.UserSession;
import com.porflyo.testing.data.TestData;

import java.util.function.Function;
import java.util.function.Supplier;

/**
 * A mock implementation of the {@link AuthUseCase} interface for testing purposes.
 * <p>
 * This record provides configurable suppliers for authentication operations,
 * allowing tests to override behavior as needed. Default values are provided via the builder.
 * </p>
 *
 * <p>
 * Usage example:
 * <pre>
 *     MockAuthUseCase authUseCase = MockAuthUseCase.builder()
 *         .buildOAuthLoginUrl("https://custom-oauth-url.com")
 *         .handleOAuthCallback(code -> TestData.DEFAULT_USER_SESSION)
 *         .build();
 * </pre>
 * </p>
 *
 * @param buildOAuthLoginUrlSupplier    Supplier for the OAuth login URL.
 * @param handleOAuthCallbackFunction   Function that handles OAuth callback with code parameter.
 */
public record MockAuthUseCase(
        Supplier<String> buildOAuthLoginUrlSupplier,
        Function<String, UserSession> handleOAuthCallbackFunction
) implements AuthUseCase {

    public static Builder builder() {
        return new Builder();
    }

    public static MockAuthUseCase withDefaults() {
        return builder().build();
    }

    @Override
    public String buildOAuthLoginUrl() {
        return buildOAuthLoginUrlSupplier.get();
    }

    @Override
    public UserSession handleOAuthCallback(String code) {
        return handleOAuthCallbackFunction.apply(code);
    }

    /**
     * Builder for creating MockAuthUseCase instances with custom behavior.
     */
    public static class Builder {
        private Supplier<String> buildOAuthLoginUrlSupplier = () -> TestData.DEFAULT_LOGIN_URL;
        private Function<String, UserSession> handleOAuthCallbackFunction = code -> TestData.DEFAULT_USER_SESSION;

        /**
         * Sets a custom OAuth login URL.
         *
         * @param loginUrl the OAuth login URL to return
         * @return this builder instance
         */
        public Builder buildOAuthLoginUrl(String loginUrl) {
            this.buildOAuthLoginUrlSupplier = () -> loginUrl;
            return this;
        }

        /**
         * Sets a custom supplier for the OAuth login URL.
         *
         * @param supplier the supplier to use
         * @return this builder instance
         */
        public Builder buildOAuthLoginUrlSupplier(Supplier<String> supplier) {
            this.buildOAuthLoginUrlSupplier = supplier;
            return this;
        }

        /**
         * Sets a custom user session to return for OAuth callback.
         *
         * @param userSession the user session to return
         * @return this builder instance
         */
        public Builder handleOAuthCallback(UserSession userSession) {
            this.handleOAuthCallbackFunction = code -> userSession;
            return this;
        }

        /**
         * Sets a custom function for handling OAuth callback.
         *
         * @param function the function to use
         * @return this builder instance
         */
        public Builder handleOAuthCallbackFunction(Function<String, UserSession> function) {
            this.handleOAuthCallbackFunction = function;
            return this;
        }

        /**
         * Sets the OAuth callback to throw an exception.
         *
         * @param exception the exception to throw
         * @return this builder instance
         */
        public Builder handleOAuthCallbackThrows(RuntimeException exception) {
            this.handleOAuthCallbackFunction = code -> { throw exception; };
            return this;
        }

        /**
         * Sets the OAuth login URL to throw an exception.
         *
         * @param exception the exception to throw
         * @return this builder instance
         */
        public Builder buildOAuthLoginUrlThrows(RuntimeException exception) {
            this.buildOAuthLoginUrlSupplier = () -> { throw exception; };
            return this;
        }

        /**
         * Builds the MockAuthUseCase instance.
         *
         * @return the configured MockAuthUseCase
         */
        public MockAuthUseCase build() {
            return new MockAuthUseCase(buildOAuthLoginUrlSupplier, handleOAuthCallbackFunction);
        }
    }
}
