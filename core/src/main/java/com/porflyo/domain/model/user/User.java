package com.porflyo.domain.model.user;

import java.util.Map;

import com.porflyo.domain.model.ids.UserId;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Serdeable
@Introspected
public record User(
        @NotNull @Valid UserId id,
        @NotNull @Valid ProviderAccount provider,
        @NotBlank String name,
        @Email String email,
        String description,
        String profileImage,
        Map<@NotBlank String, String> socials // {key: social platform, value: URL or handle}
) {}