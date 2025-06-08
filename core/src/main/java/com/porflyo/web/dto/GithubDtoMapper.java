package com.porflyo.web.dto;

import com.porflyo.domain.model.GithubUser;
import com.porflyo.domain.model.GithubRepo;

import java.util.List;
import java.util.stream.Collectors;

public class GithubDtoMapper {

    public static GithubUserDTO toDto(GithubUser user) {
        return new GithubUserDTO(user.getName(), user.getEmail(), user.getAvatar_url());
    }

    public static GithubRepoDTO toDto(GithubRepo repo) {
        return new GithubRepoDTO(repo.getName(), repo.getDescription(), repo.getHtml_url());
    }

    public static List<GithubRepoDTO> toDtoList(List<GithubRepo> repos) {
        return repos.stream().map(GithubDtoMapper::toDto).collect(Collectors.toList());
    }
}
