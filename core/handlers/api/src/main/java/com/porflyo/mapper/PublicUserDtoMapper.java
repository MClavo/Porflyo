package com.porflyo.mapper;

import java.net.URI;

import com.porflyo.dto.PublicUserDto;
import com.porflyo.model.user.ProviderAccount;
import com.porflyo.model.user.User;
import com.porflyo.usecase.MediaUseCase;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;


@Singleton
public final class PublicUserDtoMapper {

    private final MediaUseCase mediaService;

    @Inject
    public PublicUserDtoMapper(MediaUseCase mediaService) {
        this.mediaService = mediaService;
    }

    /**
     * Converts a User domain model to a PublicUserDto.
     *
     * @param user The User domain model to convert.
     * @return A PublicUserDto representation of the user.
     */
    public PublicUserDto toDto(User user) {
        ProviderAccount account = user.provider();
        String profileImage = user.profileImage(); 

        // Some adapters may change how the profile image URL is resolved
        URI publicUrl = URI.create(mediaService.resolveUrl(profileImage));

        return new PublicUserDto(
            user.name(),
            user.email(),
            user.description(),
            publicUrl,
            profileImage,
            account.providerUserName(),
            account.providerAvatarUrl(),
            user.socials()
        );
    }
}