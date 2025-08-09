package com.porflyo.domain.model.user;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Represents a user session with authentication details and associated GitHub
 * user information.
 */
@Serdeable
@Introspected
public record UserSession(String jwtToken, User user) {}