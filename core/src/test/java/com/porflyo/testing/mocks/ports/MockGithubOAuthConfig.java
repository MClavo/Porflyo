package com.porflyo.testing.mocks.ports;

import com.porflyo.application.configuration.ProviderOAuthConfig;
import com.porflyo.testing.data.TestData;

/**
 * Mock para GithubOAuthConfig, igual que el record original, con builder y valores por defecto para tests.
 */
public record MockGithubOAuthConfig(
    String clientId,
    String clientSecret,
    String redirectUri,
    String scope,
    String userAgent

) {
    public static Builder builder() {
        return new Builder();
    }

    public static ProviderOAuthConfig withDefaults() {
        return builder().build();
    }

    public static class Builder {
        private String clientId = TestData.DEFAULT_CLIENT_ID;
        private String clientSecret = TestData.DEFAULT_CLIENT_SECRET;
        private String redirectUri = TestData.DEFAULT_REDIRECT_URI;
        private String scope = TestData.DEFAULT_SCOPE;
        private String userAgent = TestData.DEFAULT_USER_AGENT;

        public Builder clientId(String clientId) {
            this.clientId = clientId;
            return this;
        }
        public Builder clientSecret(String clientSecret) {
            this.clientSecret = clientSecret;
            return this;
        }
        public Builder redirectUri(String redirectUri) {
            this.redirectUri = redirectUri;
            return this;
        }
        public Builder scope(String scope) {
            this.scope = scope;
            return this;
        }
        public Builder userAgent(String userAgent) {
            this.userAgent = userAgent;
            return this;
        }
        public ProviderOAuthConfig build() {
            return new ProviderOAuthConfig(clientId, clientSecret, redirectUri, scope, userAgent);
        }
    }
}
