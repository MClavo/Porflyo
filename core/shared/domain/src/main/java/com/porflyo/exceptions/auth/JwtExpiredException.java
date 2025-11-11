package com.porflyo.exceptions.auth;

public final class JwtExpiredException extends AuthException {
    public JwtExpiredException() { super(401, "jwt_expired", "JWT has expired"); }
}
