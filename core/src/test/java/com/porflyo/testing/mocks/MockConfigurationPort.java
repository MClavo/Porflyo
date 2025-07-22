package com.porflyo.testing.mocks;

import com.porflyo.application.ports.output.ConfigurationPort;
import com.porflyo.testing.TestData;

import java.util.function.Supplier;

/**
 * A mock implementation of the {@link ConfigurationPort} interface for testing purposes.
 * <p>
 * This record provides configurable suppliers for all configuration properties,
 * allowing tests to override values as needed. Default values are provided via the builder.
 * </p>
 *
 * <p>
 * Usage example:
 * <pre>
 *     MockConfigurationPort config = MockConfigurationPort.builder()
 *         .oAuthClientId("custom-client-id")
 *         .jwtSecret("custom-secret")
 *         .build();
 * </pre>
 * </p>
 *
 * <p>
 * The {@link Builder} inner class allows fluent construction with custom or default values.
 * </p>
 *
 * @param oAuthClientId         Supplier for the OAuth client ID.
 * @param oAuthClientSecret     Supplier for the OAuth client secret.
 * @param oAuthRedirectUri      Supplier for the OAuth redirect URI.
 * @param oAuthScope            Supplier for the OAuth scope.
 * @param jwtSecret             Supplier for the JWT secret key.
 * @param frontendUrl           Supplier for the frontend URL.
 * @param jwtExpirationSeconds  Supplier for the JWT expiration time in seconds.
 */
public record MockConfigurationPort(
        Supplier<String> oAuthClientId,
        Supplier<String> oAuthClientSecret,
        Supplier<String> oAuthRedirectUri,
        Supplier<String> oAuthScope,
        Supplier<String> jwtSecret,
        Supplier<String> frontendUrl,
        Supplier<Long> jwtExpirationSeconds
) implements ConfigurationPort {

    public static Builder builder() {
        return new Builder();
    }

    public static MockConfigurationPort withDefaults() {
        return builder().build();
    }

    @Override public String getOAuthClientId()         { return oAuthClientId.get(); }
    @Override public String getOAuthClientSecret()     { return oAuthClientSecret.get(); }
    @Override public String getOAuthRedirectUri()      { return oAuthRedirectUri.get(); }
    @Override public String getOAuthScope()            { return oAuthScope.get(); }
    @Override public String getJWTSecret()             { return jwtSecret.get(); }
    @Override public String getFrontendUrl()           { return frontendUrl.get(); }
    @Override public long getJwtExpirationSeconds()    { return jwtExpirationSeconds.get(); }

    public static class Builder {
        private Supplier<String> oAuthClientId = () -> TestData.DEFAULT_CLIENT_ID;
        private Supplier<String> oAuthClientSecret = () -> TestData.DEFAULT_CLIENT_SECRET;
        private Supplier<String> oAuthRedirectUri = () -> TestData.DEFAULT_REDIRECT_URI;
        private Supplier<String> oAuthScope = () -> TestData.DEFAULT_SCOPE;
        private Supplier<String> jwtSecret = () -> TestData.DEFAULT_JWT_SECRET;
        private Supplier<String> frontendUrl = () -> TestData.DEFAULT_FRONTEND_URL;
        private Supplier<Long> jwtExpirationSeconds = () -> TestData.DEFAULT_JWT_EXPIRATION;

        public Builder oAuthClientId(String value) {
            this.oAuthClientId = () -> value;
            return this;
        }

        public Builder oAuthClientSecret(String value) {
            this.oAuthClientSecret = () -> value;
            return this;
        }

        public Builder oAuthRedirectUri(String value) {
            this.oAuthRedirectUri = () -> value;
            return this;
        }

        public Builder oAuthScope(String value) {
            this.oAuthScope = () -> value;
            return this;
        }

        public Builder jwtSecret(String value) {
            this.jwtSecret = () -> value;
            return this;
        }

        public Builder frontendUrl(String value) {
            this.frontendUrl = () -> value;
            return this;
        }

        public Builder jwtExpirationSeconds(long value) {
            this.jwtExpirationSeconds = () -> value;
            return this;
        }

        public MockConfigurationPort build() {
            return new MockConfigurationPort(
                    oAuthClientId,
                    oAuthClientSecret,
                    oAuthRedirectUri,
                    oAuthScope,
                    jwtSecret,
                    frontendUrl,
                    jwtExpirationSeconds
            );
        }
    }
}
