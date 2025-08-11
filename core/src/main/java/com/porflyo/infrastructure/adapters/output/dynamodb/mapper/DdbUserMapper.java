package com.porflyo.infrastructure.adapters.output.dynamodb.mapper;

import static com.porflyo.infrastructure.adapters.output.dynamodb.common.DdbKeys.SK_PREFIX_USER;
import static com.porflyo.infrastructure.adapters.output.dynamodb.common.DdbKeys.PK_PREFIX_USER;
import static software.amazon.awssdk.services.dynamodb.model.AttributeValue.fromS;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import com.porflyo.application.dto.UserPatchDto;
import com.porflyo.domain.model.ids.ProviderUserId;
import com.porflyo.domain.model.ids.UserId;
import com.porflyo.domain.model.user.ProviderAccount;
import com.porflyo.domain.model.user.User;
import com.porflyo.infrastructure.adapters.output.dynamodb.Item.DdbUserItem;

import io.micronaut.core.annotation.NonNull;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

/**
 * Converts between domain {@link User} and low-level Dynamo representations.
 * <p>
 * Contains NO infrastructure code besides the mapping itself.
 * </p>
 */
public final class DdbUserMapper {

    private DdbUserMapper() {}

    /** ----------- Domain → DTO → Dynamo Map ----------- */
    public static DdbUserItem toDto(User u) {
        DdbUserItem dto = new DdbUserItem();
        dto.setPK(DdbUserItem.pkOf(u.id().value()));
        dto.setSK(SK_PREFIX_USER);
        dto.setUserId(u.id().value());
        dto.setName(u.name());
        dto.setEmail(u.email());
        dto.setDescription(u.description());
        dto.setProfileImage(u.profileImage());
        dto.setSocials(u.socials());
        dto.setProviderUserId(u.provider().providerUserId().value());
        dto.setProviderUserName(u.provider().providerUserName());
        dto.setProviderAvatarUrl(u.provider().providerAvatarUrl() != null ? u.provider().providerAvatarUrl().toString() : null);
        dto.setProviderAccessToken(u.provider().providerAccessToken());
        return dto;
    }

    /** Converts a {@link DdbUserItem} to a DynamoDB item map. */
    public static Map<String, AttributeValue> toItem(DdbUserItem dUsr) {
        Map<String, AttributeValue> map = new HashMap<>();
        map.put("PK", fromS(dUsr.getPK()));
        map.put("SK", fromS(dUsr.getSK()));
        map.put("name", fromS(dUsr.getName()));
        map.put("email", fromS(dUsr.getEmail()));

        if (dUsr.getDescription() != null)
            map.put("description", fromS(dUsr.getDescription()));

        if (dUsr.getProfileImage() != null)
            map.put("profileImage", fromS(dUsr.getProfileImage()));

        if (dUsr.getSocials() != null && !dUsr.getSocials().isEmpty()) {
            map.put("socials", AttributeValue.fromM(dUsr.getSocials().entrySet().stream()
                    .collect(Collectors.toMap(Map.Entry::getKey, e -> fromS(e.getValue())))));
        }

        map.put("providerUserId", fromS(dUsr.getProviderUserId()));
        map.put("providerUserName", fromS(dUsr.getProviderUserName()));

        if (dUsr.getProviderAvatarUrl() != null)
            map.put("providerAvatarUrl", fromS(dUsr.getProviderAvatarUrl()));

        map.put("providerAccessToken", fromS(dUsr.getProviderAccessToken()));
        return map;
    }

    /** ----------- Dynamo Map → DTO → Domain ----------- */
    public static DdbUserItem fromItem(Map<String, AttributeValue> item) {
        Map<String, String> socials = item.containsKey("socials") ? item.get("socials").m().entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue().s())) : Map.of();

        DdbUserItem dto = new DdbUserItem();
        dto.setPK(item.get("PK").s());
        dto.setSK(item.get("SK").s());
        dto.setName(item.get("name").s());
        dto.setEmail(item.get("email").s());
        dto.setDescription(item.getOrDefault("description", fromS("")).s());
        dto.setProfileImage(item.getOrDefault("profileImage", fromS("")).s());
        dto.setSocials(socials);
        dto.setProviderUserId(item.get("providerUserId").s());
        dto.setProviderUserName(item.get("providerUserName").s());
        dto.setProviderAvatarUrl(item.getOrDefault("providerAvatarUrl", fromS("")).s());
        dto.setProviderAccessToken(item.get("providerAccessToken").s());
        return dto;
    }

    /** Converts a {@link DdbUserItem} to a domain {@link User}. */
    public static User toDomain(DdbUserItem d) {
        ProviderAccount providerAccount = new ProviderAccount(ProviderAccount.Provider.GITHUB,
                new ProviderUserId(d.getProviderUserId()), d.getProviderUserName(),
                d.getProviderAvatarUrl() != null ? URI.create(d.getProviderAvatarUrl()) : null,
                d.getProviderAccessToken());

        return new User(
                new UserId(d.getPK().replace(PK_PREFIX_USER, "")),
                providerAccount,
                d.getName(),
                d.getEmail(),
                d.getDescription(),
                d.getProfileImage(),
                d.getSocials()
        );
    }

    /**
     * Creates a DynamoUserDto with null fields except the ones specified on the
     * Map<String, Object> Used for patching user attributes.
     */
    public static DdbUserItem PatchToDto(@NonNull UserId id, UserPatchDto patch) {
        DdbUserItem patchDto = new DdbUserItem();
        String pk = DdbUserItem.pkOf(id.value());
        String sk = SK_PREFIX_USER;

        patchDto.setPK(pk);
        patchDto.setSK(sk);

        patchDto.setName(patch.name().orElse(null));
        patchDto.setDescription(patch.description().orElse(null));
        patchDto.setProfileImage(patch.avatarUrl().orElse(null));

        if (patch.socials().isPresent()) 
            patchDto.setSocials(patch.socials().get());
        else 
            patchDto.setSocials(Map.of());
        

        // Provider-related fields are not included in UserPatchDto, so they remain null
        patchDto.setProviderUserId(null);
        patchDto.setProviderUserName(null);
        patchDto.setProviderAvatarUrl(null);
        patchDto.setProviderAccessToken(null);

        return patchDto;
    }

    public static DdbUserItem providerToPatch(@NonNull UserId id, ProviderAccount providerAccount) {
        if (providerAccount.providerUserId() == null)
            throw new IllegalArgumentException("Provider account must have a user ID");

        DdbUserItem patchDto = new DdbUserItem();
        patchDto.setPK(PK_PREFIX_USER + id.value());
        patchDto.setSK(SK_PREFIX_USER);
        patchDto.setProviderUserId(providerAccount.providerUserId().value());
        patchDto.setProviderUserName(providerAccount.providerUserName());
        patchDto.setProviderAvatarUrl(
                providerAccount.providerAvatarUrl() != null ? providerAccount.providerAvatarUrl().toString() : null);
        patchDto.setProviderAccessToken(providerAccount.providerAccessToken());

        return patchDto;
    }
}
