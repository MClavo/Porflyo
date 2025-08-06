package com.porflyo.infrastructure.adapters.output.dynamodb.dto;

import java.util.Map;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Raw representation of the User item as stored in DynamoDB.
 * <p>
 * All fields are simple types or maps – no domain logic.
 * </p>
 */
@Getter
@Setter
@Serdeable
@Introspected
@NoArgsConstructor
@AllArgsConstructor
public class DynamoDbUserDto {
    private String pk;
    private String sk;
    private String name;
    private String email;
    private String description;
    private String avatarUrl;
    private Map<String, String> socials; // Map<platform, url>
    private String providerUserId;
    private String providerUserName;
    private String providerAvatarUrl;
    private String providerAccessToken;
}
