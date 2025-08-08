package com.porflyo.infrastructure.adapters.output.github.mapper;

import com.porflyo.domain.model.provider.ProviderRepo;
import com.porflyo.domain.model.provider.ProviderUser;
import com.porflyo.infrastructure.adapters.output.github.dto.GithubRepoResponseDto;
import com.porflyo.infrastructure.adapters.output.github.dto.GithubUserResponseDto;

import java.util.List;
import java.util.stream.Collectors;


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
            dto.login(),
            dto.id(),
            dto.name(),
            dto.email(),
            dto.avatar_url()
        );
    }

    /**
     * Maps a {@link GithubRepoResponseDto} object to a {@link ProviderRepo} domain model.
     *
     * @param dto the GitHub repository response DTO
     * @return the corresponding GitHub repository domain model
     */
    public static ProviderRepo toDomain(GithubRepoResponseDto dto) {
        return new ProviderRepo(
            dto.name(),
            dto.description(),
            dto.html_url()
        );
    }

    /**
     * Maps an array of {@link GithubRepoResponseDto} objects to a list of {@link ProviderRepo} domain models.
     *
     * @param dtoArray the array of GitHub repository response DTOs
     * @return the corresponding list of GitHub repository domain models
     */
    public static List<ProviderRepo> toDomainList(GithubRepoResponseDto[] dtoArray) {
        return List.of(dtoArray).stream()
                .map(GithubDtoMapper::toDomain)
                .collect(Collectors.toList());
    }
}
