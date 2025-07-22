package com.porflyo.application.ports.input;

import java.util.List;

import com.porflyo.domain.model.GithubRepo;

/**
 * RepoUseCase interface defines the operations related to repository management,
 * specifically for retrieving user repositories from GitHub.
 */
public interface RepoUseCase {
    
    /**
     * Retrieves a list of repositories for the authenticated user.
     *
     * @param accessToken The access token for GitHub API.
     * @return A list of GitHub repositories.
     */
    List<GithubRepo> getUserRepos(String accessToken);
}
