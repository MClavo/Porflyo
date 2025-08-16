package com.porflyo.domain.exceptions.auth;

public final class JwtInvalidSignatureException extends AuthException {
    public JwtInvalidSignatureException() { super(401, "jwt_invalid_signature", "Invalid JWT signature"); }
}