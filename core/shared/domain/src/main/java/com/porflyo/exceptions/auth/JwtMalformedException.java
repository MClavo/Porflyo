package com.porflyo.exceptions.auth;

public final class JwtMalformedException extends AuthException {
    public JwtMalformedException(String detail) { super(401, "jwt_malformed", detail); }
}
