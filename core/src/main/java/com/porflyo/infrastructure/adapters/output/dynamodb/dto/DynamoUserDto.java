package com.porflyo.infrastructure.adapters.output.dynamodb.dto;

import java.util.Map;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Raw representation of the User item as stored in DynamoDB.
 * <p>All fields are simple types or maps – no domain logic.</p>
 */
@Serdeable
@Introspected
public record DynamoUserDto(
        String pk,
        String sk,
        String name,
        String email,
        String description,
        String providerUserId,
        String providerUserName,
        String providerAvatarUrl,
        String providerAccessToken,
        String avatarUrl,
        Map<String, String> socials     // Map<platform, url>
) { }
