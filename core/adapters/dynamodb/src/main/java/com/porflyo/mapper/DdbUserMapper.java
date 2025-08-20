package com.porflyo.mapper;

import static com.porflyo.common.DdbKeys.USER_PK_PREFIX;
import static com.porflyo.common.DdbKeys.USER_SK_PREFIX;
import static com.porflyo.common.DdbKeys.idFrom;
import static com.porflyo.common.DdbKeys.pk;

import java.net.URI;
import java.util.Map;

import com.porflyo.dto.UserPatchDto;
import com.porflyo.model.ids.ProviderUserId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.user.ProviderAccount;
import com.porflyo.model.user.User;
import com.porflyo.Item.DdbUserItem;
import com.porflyo.common.DataCompressor;

import io.micronaut.core.annotation.NonNull;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

/**
 * Converts between domain {@link User} and low-level Dynamo representations.
 * <p>
 * Contains NO infrastructure code besides the mapping itself.
 * </p>
 */
@Singleton
public final class DdbUserMapper {

    private final DataCompressor dataCompressor;

    @Inject
    public DdbUserMapper(DataCompressor dataCompressor) {
        this.dataCompressor = dataCompressor;
    }

    /** Converts a {@link User} to a Item {@link DdbUserItem}. */
    public DdbUserItem toItem(User u) {
        
        DdbUserItem dto = new DdbUserItem();
        dto.setPK(pk(USER_PK_PREFIX, u.id().value()));
        dto.setSK(USER_SK_PREFIX);
        dto.setUserId(u.id().value());
        dto.setName(u.name());
        dto.setEmail(u.email());

        if(u.description() != null) {
            try {
                byte[] compressedDescription = dataCompressor.compress(u.description());
                byte[] compressedSocials = dataCompressor.compress(u.socials());

                dto.setDescription(compressedDescription);
                dto.setSocials(compressedSocials);

            } catch (Exception e) {
                throw new RuntimeException("Failed to compress user description", e);
            }
        }

        dto.setProfileImage(u.profileImage());
        dto.setProviderUserId(u.provider().providerUserId().value());
        dto.setProviderUserName(u.provider().providerUserName());
        dto.setProviderAvatarUrl(u.provider().providerAvatarUrl() != null ? u.provider().providerAvatarUrl().toString() : null);
        dto.setProviderAccessToken(u.provider().providerAccessToken());
        return dto;
    }



    /** Converts a {@link DdbUserItem} to a domain {@link User}. */
    public User toDomain(DdbUserItem d) {
        ProviderAccount providerAccount = new ProviderAccount(ProviderAccount.Provider.GITHUB,
                new ProviderUserId(
                    d.getProviderUserId()),
                    d.getProviderUserName(),
                    URI.create(d.getProviderAvatarUrl()),
                    d.getProviderAccessToken());

        try {
            String description = dataCompressor.decompress(d.getDescription(), String.class);
            Map<String, String> socials = dataCompressor.decompressMap(d.getSocials(), String.class, String.class);

            return new User(
                    new UserId(idFrom(USER_PK_PREFIX, d.getPK())),
                    providerAccount,
                    d.getName(),
                    d.getEmail(),
                    description,
                    d.getProfileImage(),
                    socials
            );

        } catch (Exception e) {
            throw new RuntimeException("Failed to decompress user description", e);
        }
    }

    /**
     * Creates a DynamoUserDto with null fields except the ones specified on the
     * Map<String, Object> Used for patching user attributes.
     */
    public DdbUserItem patchToItem(@NonNull UserId id, UserPatchDto patch) {
        DdbUserItem userItem = new DdbUserItem();
        String pk = pk(USER_PK_PREFIX, id.value());
        String sk = USER_SK_PREFIX;

        userItem.setPK(pk);
        userItem.setSK(sk);
        
        userItem.setName(patch.name().orElse(null));
        userItem.setEmail(patch.email().orElse(null));

        try {
            byte[] compressedDescription = patch.description().isPresent()
                ? dataCompressor.compress(patch.description().get())
                : null;
            userItem.setDescription(compressedDescription);

        } catch (Exception e) {
            throw new RuntimeException("Failed to compress user description", e);
        }

        try {
            byte[] compressedSocials = patch.socials().isPresent()
                ? dataCompressor.compress(patch.socials().get())
                : null;
            userItem.setSocials(compressedSocials);

        } catch (Exception e) {
            throw new RuntimeException("Failed to compress user socials", e);
        }

        userItem.setProfileImage(patch.avatarUrl().orElse(null));

        // Provider-related fields are not included in UserPatchDto, so they remain null
        userItem.setProviderUserId(null);
        userItem.setProviderUserName(null);
        userItem.setProviderAvatarUrl(null);
        userItem.setProviderAccessToken(null);

        return userItem;
    }

    public DdbUserItem providerToItem(@NonNull UserId id, ProviderAccount providerAccount) {
        if (providerAccount.providerUserId() == null)
            throw new IllegalArgumentException("Provider account must have a user ID");

        DdbUserItem patchDto = new DdbUserItem();
        patchDto.setPK(pk(USER_PK_PREFIX, id.value()));
        patchDto.setSK(USER_SK_PREFIX);
        patchDto.setProviderUserId(providerAccount.providerUserId().value());
        patchDto.setProviderUserName(providerAccount.providerUserName());
        patchDto.setProviderAvatarUrl(
                providerAccount.providerAvatarUrl() != null ? providerAccount.providerAvatarUrl().toString() : null);
        patchDto.setProviderAccessToken(providerAccount.providerAccessToken());

        return patchDto;
    }
}
