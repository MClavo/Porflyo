package com.porflyo.infrastructure.adapters.output.github.mapper;

import com.porflyo.domain.model.GithubRepo;
import com.porflyo.domain.model.GithubUser;
import com.porflyo.infrastructure.adapters.output.github.dto.GithubRepoResponseDto;
import com.porflyo.infrastructure.adapters.output.github.dto.GithubUserResponseDto;

import java.util.List;
import java.util.stream.Collectors;


/**
 * Mapper class for converting GitHub API response DTOs to domain model objects.
 * <p>
 * Provides static methods to map {@link GithubUserResponseDto} and {@link GithubRepoResponseDto}
 * objects to their corresponding domain representations: {@link GithubUser} and {@link GithubRepo}.
 * </p>
 */
public class GithubDtoMapper {

    /**
     * Maps a {@link GithubUserResponseDto} object to a {@link GithubUser} domain model.
     *
     * @param dto the GitHub user response DTO
     * @return the corresponding GitHub user domain model
     */
    public static GithubUser toDomain(GithubUserResponseDto dto) {
        return new GithubUser(
            dto.login(),
            dto.id(),
            dto.name(),
            dto.email(),
            dto.avatar_url()
        );
    }

    /**
     * Maps a {@link GithubRepoResponseDto} object to a {@link GithubRepo} domain model.
     *
     * @param dto the GitHub repository response DTO
     * @return the corresponding GitHub repository domain model
     */
    public static GithubRepo toDomain(GithubRepoResponseDto dto) {
        return new GithubRepo(
            dto.name(),
            dto.description(),
            dto.html_url()
        );
    }

    /**
     * Maps an array of {@link GithubRepoResponseDto} objects to a list of {@link GithubRepo} domain models.
     *
     * @param dtoArray the array of GitHub repository response DTOs
     * @return the corresponding list of GitHub repository domain models
     */
    public static List<GithubRepo> toDomainList(GithubRepoResponseDto[] dtoArray) {
        return List.of(dtoArray).stream()
                .map(GithubDtoMapper::toDomain)
                .collect(Collectors.toList());
    }
}
