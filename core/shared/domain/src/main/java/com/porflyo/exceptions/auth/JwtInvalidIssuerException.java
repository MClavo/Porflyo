package com.porflyo.exceptions.auth;

public final class JwtInvalidIssuerException extends AuthException {
    public JwtInvalidIssuerException(String issuer) {
        super(401, "jwt_invalid_issuer",  issuer);
    }
}
