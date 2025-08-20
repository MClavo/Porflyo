package com.porflyo.exceptions.user;

import com.porflyo.exceptions.shared.DomainException;

public abstract class UserException extends DomainException {
    protected UserException(int httpStatus, String code, String message) {
        super(httpStatus, code, message);
    }
}