package com.porflyo.domain.exceptions.publicUrl;

import com.porflyo.domain.exceptions.shared.DomainException;

public abstract class PublicUrlException extends DomainException {
    protected PublicUrlException(int httpStatus, String code, String message) {
        super(httpStatus, code, message);
    }
}
