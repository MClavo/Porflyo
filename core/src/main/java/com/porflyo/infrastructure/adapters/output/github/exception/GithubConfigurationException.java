package com.porflyo.infrastructure.adapters.output.github.exception;

/**
 * Exception thrown when GitHub configuration is invalid or missing.
 * This includes missing OAuth credentials, invalid URLs, and configuration validation errors.
 */
public class GithubConfigurationException extends RuntimeException {
    
    public GithubConfigurationException(String message) {
        super(message);
    }
    
    public GithubConfigurationException(String message, Throwable cause) {
        super(message, cause);
    }
}
