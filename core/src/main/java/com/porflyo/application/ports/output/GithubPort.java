package com.porflyo.application.ports.output;

import java.util.List;

import com.porflyo.domain.model.GithubRepo;
import com.porflyo.domain.model.GithubUser;

/**
 * GithubPort interface defines the operations related to GitHub API interactions,
 * including user authentication and data retrieval.
 */
public interface GithubPort {

    /**
     * Exchanges OAuth code for access token
     * 
     * @param code OAuth authorization code
     * @return GitHub access token
     */
    String exchangeCodeForAccessToken(String code);

    /**
     * Retrieves user data from GitHub using the provided access token.
     *
     * @param accessToken The access token for GitHub API.
     * @return The GitHub user data.
     */
    GithubUser getUserData(String accessToken);
    
    /**
     * Retrieves a list of repositories for the authenticated user.
     *
     * @param accessToken The access token for GitHub API.
     * @return A list of GitHub repositories.
     */
    List<GithubRepo> getUserRepositories(String accessToken);
    
}
