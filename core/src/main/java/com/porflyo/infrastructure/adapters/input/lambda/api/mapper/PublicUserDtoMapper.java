package com.porflyo.infrastructure.adapters.input.lambda.api.mapper;

import java.net.URI;

import com.porflyo.domain.model.user.ProviderAccount;
import com.porflyo.domain.model.user.User;
import com.porflyo.infrastructure.adapters.input.lambda.api.dto.PublicUserDto;
import com.porflyo.infrastructure.adapters.output.s3.S3UrlBuilder;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
public class PublicUserDtoMapper {

    private final S3UrlBuilder urlBuilder;

    @Inject
    public PublicUserDtoMapper(S3UrlBuilder urlBuilder) {
        this.urlBuilder = urlBuilder;
    }

    /**
     * Converts a User domain model to a PublicUserDto.
     *
     * @param user The User domain model to convert.
     * @return A PublicUserDto representation of the user.
     */
    public PublicUserDto toDto(User user) {
        ProviderAccount account = user.provider();
        String profileKey = user.profileImage(); 
        URI publicUrl = urlBuilder.buildPublicUrl(profileKey);

        return new PublicUserDto(
            user.name(),
            user.email(),
            user.description(),
            publicUrl,
            profileKey,
            account.providerUserName(),
            account.providerAvatarUrl(),
            user.socials()
        );
    }
}