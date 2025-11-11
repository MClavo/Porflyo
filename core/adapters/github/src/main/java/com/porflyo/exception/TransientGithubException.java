package com.porflyo.exception;


public class TransientGithubException extends RuntimeException {
    public TransientGithubException(String message) {
        super(message);
    }
    public TransientGithubException(String message, Throwable cause) {
        super(message, cause);
    }
}