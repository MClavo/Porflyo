package com.porflyo.application.dto;

import java.util.Map;
import java.util.Optional;

import com.porflyo.domain.model.ids.UserId;

import io.micronaut.core.annotation.NonNull;

/**
 * Data Transfer Object for patching user information.
 */
public record UserPatchDto(
    @NonNull UserId id,
    Optional<String> name,
    Optional<String> description,
    Optional<String> avatarUrl,
    Optional<Map<String, String>> socials
) {}