package com.porflyo.domain.exceptions.user;

public final class UserAlreadyExistsException extends UserException {
    private final String principal;
    public UserAlreadyExistsException(String principal) {
        super(409, "user_already_exists", "User already exists: " + principal);
        this.principal = principal;
    }
    public String principal() { return principal; }
}