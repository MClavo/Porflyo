package com.porflyo.application.ports.input;

import com.porflyo.domain.model.GithubUser;

/**
 * UserUseCase interface defines the operations related to user management,
 * specifically for retrieving user data from GitHub.
 */
public interface UserUseCase {

    /**
     * Retrieves user data from GitHub using the provided access token.
     *
     * @param accessToken The access token for GitHub API.
     * @return The GitHub user data.
     */
    GithubUser getUserData(String accessToken);
    
}