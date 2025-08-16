package com.porflyo.domain.exceptions.auth;

public final class JwtGenerationException extends AuthException {
    public JwtGenerationException(String detail, Throwable cause) {
        super(500, "jwt_generation_failed", "Failed to generate JWT token: " + detail);
        initCause(cause);
    }
}
