package com.porflyo.application.dto;

import java.util.Map;
import java.util.Optional;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Data Transfer Object for patching user information.
 */
@Serdeable
@Introspected
public record UserPatchDto(
    Optional<String> name,
    Optional<String> email,
    Optional<String> description,
    Optional<String> avatarUrl,
    Optional<Map<String, String>> socials
) {}