package com.porflyo.ports.output;

import java.util.List;

import com.porflyo.model.provider.ProviderRepo;
import com.porflyo.model.provider.ProviderUser;

/**
 * GithubPort interface defines the operations related to GitHub API interactions,
 * including user authentication and data retrieval.
 */
public interface ProviderPort {

    String getProviderName();

    /**
     * Builds the authorization URL for OAuth.
     *
     * @return The authorization URL as a String.
     */
    String buildAuthorizationUrl();

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
    ProviderUser getUserData(String accessToken);
    
    /**
     * Retrieves a list of repositories for the authenticated user.
     *
     * @param accessToken The access token for GitHub API.
     * @return A list of GitHub repositories.
     */
    List<ProviderRepo> getUserRepos(String accessToken);
    
}
