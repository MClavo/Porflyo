package com.porflyo.infrastructure.adapters.input.lambda.api.mapper;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import com.porflyo.application.dto.UserPatchDto;

public final class UserPatchDtoMapper {

    public static UserPatchDto toPatch(Map<String, Object> attributes) {
        return new UserPatchDto(
            extractOptionalString(attributes, "name"),
            extractOptionalString(attributes, "description"),
            extractOptionalString(attributes, "avatarUrl"),
            extractOptionalSocials(attributes)
        );
    }

    private static Optional<String> extractOptionalString(Map<String, Object> attributes, String key) {
        return attributes.containsKey(key) ? Optional.of((String) attributes.get(key)) : Optional.empty();
    }

    private static Optional<Map<String, String>> extractOptionalSocials(Map<String, Object> attributes) {
        if (attributes.containsKey("socials") && attributes.get("socials") instanceof Map<?, ?> map) {
            Map<String, String> validatedSocials = new HashMap<>();
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                if (entry.getKey() instanceof String key && entry.getValue() instanceof String value) {
                    validatedSocials.put(key, value);
                }
            }
            if (!validatedSocials.isEmpty()) {
                return Optional.of(validatedSocials);
            }
        }
        return Optional.empty();
    }
}
