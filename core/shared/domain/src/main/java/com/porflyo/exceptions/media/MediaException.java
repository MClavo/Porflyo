package com.porflyo.exceptions.media;

import com.porflyo.exceptions.shared.DomainException;

public abstract class MediaException extends DomainException {
    protected MediaException(int httpStatus, String code, String message) {
        super(httpStatus, code, message);
    }
}