package com.porflyo.mapper;

import com.porflyo.dto.GithubUserResponseDto;
import com.porflyo.model.ids.ProviderUserId;
import com.porflyo.model.provider.ProviderRepo;
import com.porflyo.model.provider.ProviderUser;


/**
 * Mapper class for converting GitHub API response DTOs to domain model objects.
 * <p>
 * Provides static methods to map {@link GithubUserResponseDto} and {@link GithubRepoResponseDto}
 * objects to their corresponding domain representations: {@link ProviderUser} and {@link ProviderRepo}.
 * </p>
 */
public class GithubDtoMapper {

    /**
     * Maps a {@link GithubUserResponseDto} object to a {@link ProviderUser} domain model.
     *
     * @param dto the GitHub user response DTO
     * @return the corresponding GitHub user domain model
     */
    public static ProviderUser toDomain(GithubUserResponseDto dto) {
        return new ProviderUser(
            new ProviderUserId(dto.id()),
            dto.login(),
            dto.name(),
            dto.email(),
            dto.avatar_url()
        );
    }
}
