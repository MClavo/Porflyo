package com.porflyo.infrastructure.adapters.input.lambda.api.dto;

import java.net.URI;
import java.util.Map;

import com.porflyo.domain.model.user.ProviderAccount;
import com.porflyo.domain.model.user.User;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record PublicUserDto(
    String name,
    String email,
    String description,
    String profileImage,
    String providerUserName,
    URI providerAvatarUrl,
    Map<String, String> socials
    
) {
    public static PublicUserDto from(User user) {
        ProviderAccount account = user.provider();
        return new PublicUserDto(
            user.name(),
            user.email(),
            user.description(),
            user.profileImage(),
            account.providerUserName(),
            account.providerAvatarUrl(),
            user.socials()
        );
    }
}