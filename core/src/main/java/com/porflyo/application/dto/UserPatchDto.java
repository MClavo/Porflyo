package com.porflyo.application.dto;

import java.util.Map;
import java.util.Optional;

/**
 * Data Transfer Object for patching user information.
 */
public record UserPatchDto(
    Optional<String> name,
    Optional<String> description,
    Optional<String> avatarUrl,
    Optional<Map<String, String>> socials
) {}