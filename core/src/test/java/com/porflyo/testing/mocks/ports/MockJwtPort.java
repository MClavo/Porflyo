package com.porflyo.testing.mocks.ports;

import java.util.function.Supplier;

import com.porflyo.application.ports.output.JwtPort;
import com.porflyo.domain.model.user.UserClaims;
import com.porflyo.testing.data.TestData;

/**
 * A mock implementation of the {@link JwtPort} interface for testing purposes.
 * <p>
 * This record allows for configurable behavior of JWT operations such as token generation,
 * validation, and claim extraction. It uses {@link Supplier} instances to provide
 * customizable return values or exceptions for each operation, enabling flexible test scenarios.
 * </p>
 *
 * <p>
 * Use the {@link Builder} to configure the desired behavior, or {@link #withDefaults()} for
 * a default instance with standard values.
 * </p>
 *
 * <ul>
 *   <li>{@code generatedTokenSupplier}: Supplies the token string to return from {@code generateToken}.</li>
 *   <li>{@code isTokenValidSupplier}: Supplies the boolean result for {@code validateToken}.</li>
 *   <li>{@code extractedClaimsSupplier}: Supplies the {@link UserClaims} for {@code extractClaims}.</li>
 *   <li>{@code generateExceptionSupplier}: Supplies an exception to throw from {@code generateToken}, or {@code null} for none.</li>
 *   <li>{@code validateExceptionSupplier}: Supplies an exception to throw from {@code validateToken}, or {@code null} for none.</li>
 *   <li>{@code extractExceptionSupplier}: Supplies an exception to throw from {@code extractClaims}, or {@code null} for none.</li>
 * </ul>
 *
 * <p>
 * Example usage:
 * <pre>
 * MockJwtPort mockJwt = MockJwtPort.builder()
 *     .generatedToken("custom.token")
 *     .isTokenValid(false)
 *     .throwOnValidate(new JwtException("Invalid token"))
 *     .build();
 * </pre>
 * </p>
 */
public record MockJwtPort(
    Supplier<String> generatedTokenSupplier,
    Supplier<Boolean> isTokenValidSupplier,
    Supplier<UserClaims> extractedClaimsSupplier,
    Supplier<RuntimeException> generateExceptionSupplier,
    Supplier<RuntimeException> validateExceptionSupplier,
    Supplier<RuntimeException> extractExceptionSupplier
) implements JwtPort {

    public static Builder builder() {
        return new Builder();
    }

    public static MockJwtPort withDefaults() {
        return builder().build();
    }

    @Override
    public String generateToken(UserClaims claims) {
        if (generateExceptionSupplier.get() != null) throw generateExceptionSupplier.get();
        return generatedTokenSupplier.get();
    }

    @Override
    public boolean validateToken(String token) {
        if (validateExceptionSupplier.get() != null) throw validateExceptionSupplier.get();
        return isTokenValidSupplier.get();
    }

    @Override
    public UserClaims extractClaims(String token) {
        if (extractExceptionSupplier.get() != null) throw extractExceptionSupplier.get();
        return extractedClaimsSupplier.get();
    }

    public static class Builder {
        private Supplier<String> generatedTokenSupplier = () -> TestData.DEFAULT_JWT_TOKEN;
        private Supplier<Boolean> isTokenValidSupplier = () -> true;
        private Supplier<UserClaims> extractedClaimsSupplier = () -> TestData.DEFAULT_CLAIMS;

        private Supplier<RuntimeException> generateExceptionSupplier = () -> null;
        private Supplier<RuntimeException> validateExceptionSupplier = () -> null;
        private Supplier<RuntimeException> extractExceptionSupplier = () -> null;

        public Builder generatedToken(String token) {
            this.generatedTokenSupplier = () -> token;
            return this;
        }

        public Builder isTokenValid(boolean valid) {
            this.isTokenValidSupplier = () -> valid;
            return this;
        }

        public Builder extractedClaims(UserClaims claims) {
            this.extractedClaimsSupplier = () -> claims;
            return this;
        }

        public Builder throwOnGenerate(RuntimeException ex) {
            this.generateExceptionSupplier = () -> ex;
            return this;
        }

        public Builder throwOnValidate(RuntimeException ex) {
            this.validateExceptionSupplier = () -> ex;
            return this;
        }

        public Builder throwOnExtract(RuntimeException ex) {
            this.extractExceptionSupplier = () -> ex;
            return this;
        }

        public MockJwtPort build() {
            return new MockJwtPort(
                generatedTokenSupplier,
                isTokenValidSupplier,
                extractedClaimsSupplier,
                generateExceptionSupplier,
                validateExceptionSupplier,
                extractExceptionSupplier
            );
        }
    }
}
