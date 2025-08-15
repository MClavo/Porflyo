package com.porflyo.domain.exceptions.user;

import com.porflyo.domain.model.ids.UserId;

public final class InvalidUserStateException extends UserException {
    private final UserId userId;
    private final String reason;

    public InvalidUserStateException(UserId userId, String reason) {
        super(409, "user_invalid_state", "Invalid user state for " + userId.value() + ": " + reason);
        this.userId = userId; this.reason = reason;
    }
    public UserId userId() { return userId; }
    public String reason() { return reason; }
}