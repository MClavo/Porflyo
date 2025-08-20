package com.porflyo.exception;

/**
 * Exception thrown when GitHub authentication fails.
 * This includes OAuth token exchange failures and invalid credentials.
 */
public class GithubAuthenticationException extends RuntimeException {
    private final int statusCode;

    public GithubAuthenticationException(String message, int statusCode, Throwable cause) {
        super(message, cause);
        this.statusCode = statusCode;
    }
    
    public GithubAuthenticationException(String message, Throwable cause) {
        super(message, cause);
        this.statusCode = 500; // Default to 500 if not specified
    }

    public int getStatusCode() {
        return statusCode;
    }
}
