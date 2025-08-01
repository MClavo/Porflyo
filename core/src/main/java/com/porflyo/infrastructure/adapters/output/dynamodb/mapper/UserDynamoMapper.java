package com.porflyo.infrastructure.adapters.output.dynamodb.mapper;

import static software.amazon.awssdk.services.dynamodb.model.AttributeValue.fromS;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

import com.porflyo.domain.model.user.User;
import com.porflyo.infrastructure.adapters.output.dynamodb.dto.DynamoUserDto;

import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

/**
 * Converts between domain {@link User} and low-level Dynamo representations.
 * <p>Contains NO infrastructure code besides the mapping itself.</p>
 */
public final class UserDynamoMapper {

    private UserDynamoMapper() { }

    /** ----------- Domain → DTO → Dynamo Map ----------- */
    public static DynamoUserDto toDto(User u) {
        return new DynamoUserDto(
                pk(u.id().value()),
                "PROFILE",
                u.name(),
                u.email(),
                u.description(),
                u.provider().providerUserId(),
                u.provider().providerUserName(),
                u.avatarUrl() != null ? u.avatarUrl().toString() : null,
                u.provider().providerAccessToken(),
                u.avatarUrl() != null ? u.avatarUrl().toString() : null,
                u.socials()
        );
    }

    /** Converts a {@link DynamoUserDto} to a DynamoDB item map. */
    public static Map<String, AttributeValue> toItem(DynamoUserDto d) {
        Map<String, AttributeValue> m = new HashMap<>();
        m.put("PK", fromS(d.pk()));
        m.put("SK", fromS(d.sk()));
        m.put("name", fromS(d.name()));
        m.put("email", fromS(d.email()));
        if (d.description() != null)      m.put("description", fromS(d.description()));
        if (d.avatarUrl() != null)        m.put("avatarUrl",  fromS(d.avatarUrl()));
        m.put("providerUserId",   fromS(d.providerUserId()));
        m.put("providerUserName", fromS(d.providerUserName()));
        m.put("accessToken",      fromS(d.providerAccessToken()));
        if (d.socials() != null && !d.socials().isEmpty()) {
            m.put("socials", AttributeValue.fromM(
                    d.socials().entrySet().stream()
                      .collect(java.util.stream.Collectors.toMap(
                          Map.Entry::getKey,
                          e -> fromS(e.getValue())
                      ))));
        }
        return m;
    }

    /** ----------- Dynamo Map → DTO → Domain ----------- */
    public static DynamoUserDto fromItem(Map<String, AttributeValue> item) {
        return new DynamoUserDto(
                item.get("PK").s(),
                item.get("SK").s(),
                item.get("name").s(),
                item.get("email").s(),
                item.getOrDefault("description", fromS("")).s(),
                item.get("providerUserId").s(),
                item.get("providerUserName").s(),
                item.getOrDefault("providerAvatarUrl", fromS("")).s(),
                item.get("providerAccessToken").s(),
                item.getOrDefault("avatarUrl", fromS("")).s(),
                item.containsKey("socials")
                    ? item.get("socials").m().entrySet().stream()
                          .collect(java.util.stream.Collectors.toMap(
                              Map.Entry::getKey,
                              e -> e.getValue().s()))
                    : Map.of()
        );
    }

    /** Converts a {@link DynamoUserDto} to a domain {@link User}. */
    public static User toDomain(DynamoUserDto d) {
        return new User(
                com.porflyo.domain.model.shared.EntityId.newKsuid(), // id value already in PK, we parse next line
                new com.porflyo.domain.model.user.ProviderAccount(
                        d.providerUserId(),
                        d.providerUserName(),
                        URI.create(d.providerAvatarUrl()),
                        d.providerAccessToken()
                ),
                d.name(),
                d.email(),
                d.description(),
                d.avatarUrl() != null && !d.avatarUrl().isBlank() ? URI.create(d.avatarUrl()) : null,
                d.socials()
        );
    }

    /* ----------- Helpers ----------- */
    private static String pk(String rawId) { return "USER#" + rawId; }
}
