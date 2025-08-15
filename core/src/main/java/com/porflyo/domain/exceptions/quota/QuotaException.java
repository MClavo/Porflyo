package com.porflyo.domain.exceptions.quota;

import com.porflyo.domain.exceptions.shared.DomainException;

public abstract class QuotaException extends DomainException {
    protected QuotaException(int httpStatus, String code, String message) {
        super(httpStatus, code, message);
    }
}