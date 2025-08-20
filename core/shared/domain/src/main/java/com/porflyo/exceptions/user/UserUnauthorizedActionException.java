package com.porflyo.exceptions.user;

import com.porflyo.model.ids.UserId;

public final class UserUnauthorizedActionException extends UserException {
    private final UserId userId;
    private final String action;

    public UserUnauthorizedActionException(UserId userId, String action) {
        super(403, "user_unauthorized", "User " + userId.value() + " is not allowed to " + action);
        this.userId = userId; this.action = action;
    }
    public UserId userId() { return userId; }
    public String action() { return action; }
}
