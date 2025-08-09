package com.porflyo.domain.model.provider;

import com.porflyo.domain.model.ids.ProviderUserId;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Represents a Provider user with basic profile information.
 *
 */
@Serdeable
@Introspected
public record ProviderUser(
    ProviderUserId id, 
    String login, 
    String name, 
    String email, 
    String avatar_url
) {}
