package com.porflyo.domain.exceptions.user;

import com.porflyo.domain.exceptions.shared.DomainException;

public abstract class UserException extends DomainException {
    protected UserException(int httpStatus, String code, String message) {
        super(httpStatus, code, message);
    }
}