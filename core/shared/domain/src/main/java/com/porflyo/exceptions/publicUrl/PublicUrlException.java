package com.porflyo.exceptions.publicUrl;

import com.porflyo.exceptions.shared.DomainException;

public abstract class PublicUrlException extends DomainException {
    protected PublicUrlException(int httpStatus, String code, String message) {
        super(httpStatus, code, message);
    }
}
