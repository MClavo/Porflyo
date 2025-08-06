package com.porflyo.infrastructure.adapters.output.dynamodb.mapper;

import static software.amazon.awssdk.services.dynamodb.model.AttributeValue.fromS;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import com.porflyo.domain.model.shared.EntityId;
import com.porflyo.domain.model.user.ProviderAccount;
import com.porflyo.domain.model.user.User;
import com.porflyo.infrastructure.adapters.output.dynamodb.dto.DynamoDbUserDto;

import io.micronaut.core.annotation.NonNull;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

/**
 * Converts between domain {@link User} and low-level Dynamo representations.
 * <p>
 * Contains NO infrastructure code besides the mapping itself.
 * </p>
 */
public final class DynamoDbUserMapper {

    private DynamoDbUserMapper() {
    }

    /** ----------- Domain → DTO → Dynamo Map ----------- */
    public static DynamoDbUserDto toDto(User u) {
        return new DynamoDbUserDto(
                pk(u.id().value()),
                "PROFILE",
                u.name(),
                u.email(),
                u.description(),
                u.avatarUrl() != null ? u.avatarUrl().toString() : null,
                u.socials(),
                u.provider().providerUserId(),
                u.provider().providerUserName(),
                u.provider().providerAvatarUrl() != null ? u.provider().providerAvatarUrl().toString() : null,
                u.provider().providerAccessToken());
    }

    /** Converts a {@link DynamoDbUserDto} to a DynamoDB item map. */
    public static Map<String, AttributeValue> toItem(DynamoDbUserDto dUsr) {
        Map<String, AttributeValue> map = new HashMap<>();
        map.put("PK", fromS(dUsr.getPk()));
        map.put("SK", fromS(dUsr.getSk()));
        map.put("name", fromS(dUsr.getName()));
        map.put("email", fromS(dUsr.getEmail()));

        if (dUsr.getDescription() != null)
            map.put("description", fromS(dUsr.getDescription()));

        if (dUsr.getAvatarUrl() != null)
            map.put("avatarUrl", fromS(dUsr.getAvatarUrl()));

        if (dUsr.getSocials() != null && !dUsr.getSocials().isEmpty()) {
            map.put("socials", AttributeValue.fromM(
                    dUsr.getSocials().entrySet().stream()
                            .collect(Collectors.toMap(
                                    Map.Entry::getKey,
                                    e -> fromS(e.getValue())))));
        }

        map.put("providerUserId", fromS(dUsr.getProviderUserId()));
        map.put("providerUserName", fromS(dUsr.getProviderUserName()));

        if (dUsr.getProviderAvatarUrl() != null)
            map.put("providerAvatarUrl", fromS(dUsr.getProviderAvatarUrl()));

        map.put("providerAccessToken", fromS(dUsr.getProviderAccessToken()));
        return map;
    }

    /** ----------- Dynamo Map → DTO → Domain ----------- */
    public static DynamoDbUserDto fromItem(Map<String, AttributeValue> item) {
        Map<String, String> socials = item.containsKey("socials")
                ? item.get("socials").m().entrySet().stream()
                        .collect(Collectors.toMap(
                                Map.Entry::getKey,
                                e -> e.getValue().s()))
                : Map.of();

        return new DynamoDbUserDto(
                item.get("PK").s(),
                item.get("SK").s(),
                item.get("name").s(),
                item.get("email").s(),
                item.getOrDefault("description", fromS("")).s(),
                item.getOrDefault("avatarUrl", fromS("")).s(),
                socials,
                item.get("providerUserId").s(),
                item.get("providerUserName").s(),
                item.getOrDefault("providerAvatarUrl", fromS("")).s(),
                item.get("providerAccessToken").s());
    }

    /** Converts a {@link DynamoDbUserDto} to a domain {@link User}. */
    public static User toDomain(DynamoDbUserDto d) {
        return new User(
                new EntityId(d.getPk().replace("USER#", "")),
                new com.porflyo.domain.model.user.ProviderAccount(
                        d.getProviderUserId(),
                        d.getProviderUserName(),
                        URI.create(d.getProviderAvatarUrl()),
                        d.getProviderAccessToken()),
                d.getName(),
                d.getEmail(),
                d.getDescription(),
                d.getAvatarUrl() != null && !d.getAvatarUrl().isBlank() ? URI.create(d.getAvatarUrl()) : null,
                d.getSocials());
    }


    /** Creates a DynamoUserDto with null fields except the ones specified on the Map<String, Object>
     *  Used for patching user attributes.
     */
    public static DynamoDbUserDto createPatchDto(@NonNull EntityId id, Map<String, Object> attrs) {
        DynamoDbUserDto patchDto = new DynamoDbUserDto();
        patchDto.setPk("USER#" + id.value());
        patchDto.setSk("PROFILE");              // Always patching the profile
        patchDto.setName(fetchAttributeValueOrNull(attrs, "name"));
        patchDto.setEmail(fetchAttributeValueOrNull(attrs, "email"));
        patchDto.setDescription(fetchAttributeValueOrNull(attrs, "description"));
        patchDto.setAvatarUrl(fetchAttributeValueOrNull(attrs, "avatarUrl"));

        if (attrs.containsKey("socials") && attrs.get("socials") instanceof Map) {
            @SuppressWarnings("unchecked")  // I promise this is a Map<String, String> :()
            Map<String, String> socials = (Map<String, String>) attrs.get("socials");
            patchDto.setSocials(socials);
        } else {
            patchDto.setSocials(Map.of());
        }
        
        patchDto.setProviderUserId(fetchAttributeValueOrNull(attrs, "providerUserId"));
        patchDto.setProviderUserName(fetchAttributeValueOrNull(attrs, "providerUserName"));
        patchDto.setProviderAvatarUrl(fetchAttributeValueOrNull(attrs, "providerAvatarUrl"));
        patchDto.setProviderAccessToken(fetchAttributeValueOrNull(attrs, "providerAccessToken"));

        return patchDto;
    }

    public static DynamoDbUserDto createPatchDto(@NonNull EntityId id, ProviderAccount providerAccount) {
        if (providerAccount.providerUserId() == null)
            throw new IllegalArgumentException("Provider account must have a user ID");

        DynamoDbUserDto patchDto = new DynamoDbUserDto();
        patchDto.setPk("USER#" + id.value());
        patchDto.setSk("PROFILE");
        patchDto.setProviderUserId(providerAccount.providerUserId());
        patchDto.setProviderUserName(providerAccount.providerUserName());
        patchDto.setProviderAvatarUrl(providerAccount.providerAvatarUrl() != null ? providerAccount.providerAvatarUrl().toString() : null);
        patchDto.setProviderAccessToken(providerAccount.providerAccessToken());

        return patchDto;
    }

    /* ----------- Helpers ----------- */

    private static String fetchAttributeValueOrNull(Map<String, Object> attrs, String key) {
        return attrs.getOrDefault(key, null) != null ? attrs.get(key).toString() : null;
    }
    
    private static String pk(String rawId) {
        return "USER#" + rawId;
    }
}
