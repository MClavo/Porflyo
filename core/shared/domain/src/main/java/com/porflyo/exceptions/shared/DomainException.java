package com.porflyo.exceptions.shared;

/**
 * Base domain exception with HTTP status and machine-readable code.
 */
public abstract class DomainException extends RuntimeException {
    private final int httpStatus;  // e.g., 409
    private final String code;     // e.g., "slug_taken"

    protected DomainException(int httpStatus, String code, String message) {
        super(message);
        this.httpStatus = httpStatus;
        this.code = code;
    }

    protected DomainException(int httpStatus, String code, String message, Throwable cause) {
        super(message, cause);
        this.httpStatus = httpStatus;
        this.code = code;
    }

    public int httpStatus() { return httpStatus; }
    public String code()     { return code; }
}
