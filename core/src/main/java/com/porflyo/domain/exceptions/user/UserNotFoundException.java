package com.porflyo.domain.exceptions.user;

import com.porflyo.domain.model.ids.UserId;

public final class UserNotFoundException extends UserException {
    private final UserId userId;
    public UserNotFoundException(UserId userId) {
        super(404, "user_not_found", "User not found: " + userId.value());
        this.userId = userId;
    }
    public UserId userId() { return userId; }
}