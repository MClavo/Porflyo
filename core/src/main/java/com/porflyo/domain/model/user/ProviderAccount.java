package com.porflyo.domain.model.user;

import java.net.URI;

import com.porflyo.domain.model.ids.ProviderUserId;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * External provider information (GitHub for now).
 * <p>
 * Contains the public profile data plus an access token used exclusively by the
 * backend to call the provider’s API.
 */
@Serdeable
@Introspected
public record ProviderAccount(
    @NotNull Provider provider,
    @NotNull ProviderUserId providerUserId,
    @NotBlank String providerUserName,
    URI providerAvatarUrl,
    String providerAccessToken  // stored but never exposed to frontend
) {
    public enum Provider { GITHUB }
}
