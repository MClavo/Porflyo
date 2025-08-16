package com.porflyo.domain.exceptions.auth;

public final class JwtVerificationException extends AuthException {
    public JwtVerificationException(String detail, Throwable cause) {
        super(401, "jwt_verification_failed", detail);
        initCause(cause);
    }
}
