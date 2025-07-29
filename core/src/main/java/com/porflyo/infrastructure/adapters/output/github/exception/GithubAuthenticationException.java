package com.porflyo.infrastructure.adapters.output.github.exception;

/**
 * Exception thrown when GitHub authentication fails.
 * This includes OAuth token exchange failures and invalid credentials.
 */
public class GithubAuthenticationException extends RuntimeException {
    
    public GithubAuthenticationException(String message) {
        super(message);
    }
    
    public GithubAuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}
