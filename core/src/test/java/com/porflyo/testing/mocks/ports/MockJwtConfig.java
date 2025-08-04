package com.porflyo.testing.mocks.ports;

import com.porflyo.application.configuration.JwtConfig;
import com.porflyo.testing.data.TestData;

/**
 * Mock para JwtConfig, igual que el record original, con builder y valores por defecto para tests.
 */
public record MockJwtConfig(
    String secret,
    long expiration

) {
    public static Builder builder() {
        return new Builder();
    }

    public static JwtConfig withDefaults() {
        return builder().build();
    }

    public static class Builder {
        private String secret = TestData.DEFAULT_JWT_SECRET;
        private long expiration = TestData.DEFAULT_JWT_EXPIRATION;

        public Builder secret(String secret) {
            this.secret = secret;
            return this;
        }

        public Builder expiration(long expiration) {
            this.expiration = expiration;
            return this;
        }

        public JwtConfig build() {
            return new JwtConfig(secret, expiration);
        }
    }
}
