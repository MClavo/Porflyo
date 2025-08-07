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
    
) {}