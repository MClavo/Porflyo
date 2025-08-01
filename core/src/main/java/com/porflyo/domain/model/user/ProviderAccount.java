package com.porflyo.domain.model.user;

import java.net.URI;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotBlank;

/**
 * External provider information (GitHub for now).
 * <p>
 *  Contains the public profile data plus an access token
 *  used exclusively by the backend to call the provider’s API.
 */
@Serdeable
@Introspected
public record ProviderAccount(
    @NotBlank String providerUserId,
    @NotBlank String providerUserName,
    @NotBlank URI providerAvatarUrl,
    @NotBlank String ProviderAccessToken          // stored but never exposed to frontend
) { }
