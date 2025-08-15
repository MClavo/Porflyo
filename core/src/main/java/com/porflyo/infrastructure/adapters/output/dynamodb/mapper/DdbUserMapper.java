package com.porflyo.infrastructure.adapters.output.dynamodb.mapper;

import static com.porflyo.infrastructure.adapters.output.dynamodb.common.DdbKeys.USER_PK_PREFIX;
import static com.porflyo.infrastructure.adapters.output.dynamodb.common.DdbKeys.USER_SK_PREFIX;
import static com.porflyo.infrastructure.adapters.output.dynamodb.common.DdbKeys.idFrom;
import static com.porflyo.infrastructure.adapters.output.dynamodb.common.DdbKeys.pk;

import java.net.URI;
import java.util.Map;

import com.porflyo.application.dto.UserPatchDto;
import com.porflyo.domain.model.ids.ProviderUserId;
import com.porflyo.domain.model.ids.UserId;
import com.porflyo.domain.model.user.ProviderAccount;
import com.porflyo.domain.model.user.User;
import com.porflyo.infrastructure.adapters.output.dynamodb.Item.DdbUserItem;
import com.porflyo.infrastructure.adapters.output.dynamodb.common.DataCompressor;

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
                dto.setDescription(compressedDescription);

            } catch (Exception e) {
                throw new RuntimeException("Failed to compress user description", e);
            }
        }

        dto.setProfileImage(u.profileImage());
        dto.setSocials(u.socials());
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
            
            return new User(
                    new UserId(idFrom(USER_PK_PREFIX, d.getPK())),
                    providerAccount,
                    d.getName(),
                    d.getEmail(),
                    description,
                    d.getProfileImage(),
                    d.getSocials()
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
        DdbUserItem patchDto = new DdbUserItem();
        String pk = pk(USER_PK_PREFIX, id.value());
        String sk = USER_SK_PREFIX;

        patchDto.setPK(pk);
        patchDto.setSK(sk);
        
        patchDto.setName(patch.name().orElse(null));

        try {
            byte[] compressedDescription = patch.description().isPresent()
                ? dataCompressor.compress(patch.description().get())
                : null;
            patchDto.setDescription(compressedDescription);

        } catch (Exception e) {
            throw new RuntimeException("Failed to compress user description", e);
        }

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
