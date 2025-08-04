package com.porflyo.application.ports.input;

import java.util.List;

import com.porflyo.domain.model.GithubRepo;
import com.porflyo.domain.model.shared.EntityId;

/**
 * RepoUseCase interface defines the operations related to repository management,
 * specifically for retrieving user repositories.
 */
public interface RepoUseCase {
    
    /**
     * Retrieves a list of repositories for the authenticated user.
     *
     * @param accessToken The access token for the provider API.
     * @return A list of repositories.
     */
    List<GithubRepo> getUserRepos(String accessToken);
    
    
    
    /**
     * Retrieves a list of repositories for the authenticated user.
     *
     * @param userId The ID of the user whose repositories are to be retrieved.
     * @return A list of repositories.
     */
    List<GithubRepo> getUserRepos(EntityId userId);
}
