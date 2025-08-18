package com.porflyo.infrastructure.adapters.output.github.exception;


public class TransientGithubException extends RuntimeException {
    public TransientGithubException(String message) {
        super(message);
    }
    public TransientGithubException(String message, Throwable cause) {
        super(message, cause);
    }
}