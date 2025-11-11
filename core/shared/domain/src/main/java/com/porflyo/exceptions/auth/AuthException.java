package com.porflyo.exceptions.auth;

import com.porflyo.exceptions.shared.DomainException;

public abstract class AuthException extends DomainException {
    protected AuthException(int httpStatus, String code, String message) {
        super(httpStatus, code, message);
    }
}
