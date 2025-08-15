package com.porflyo.domain.exceptions.media;

import com.porflyo.domain.exceptions.shared.DomainException;

public abstract class MediaCountException extends DomainException {
    protected MediaCountException(int httpStatus, String code, String message) {
        super(httpStatus, code, message);
    }
}
