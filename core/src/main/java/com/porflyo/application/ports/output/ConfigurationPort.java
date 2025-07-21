package com.porflyo.application.ports.output;

/**
 * ConfigurationPort interface defines methods to retrieve configuration settings
 * required for the application, such as OAuth credentials and JWT secrets.
 */
public interface ConfigurationPort {

    /**
     * Retrieves the OAuth client ID for GitHub authentication.
     *
     * @return The OAuth client ID.
     */
    String getOAuthClientId();
    
    /**
     * Retrieves the OAuth client secret for GitHub authentication.
     *
     * @return The OAuth client secret.
     */
    String getOAuthClientSecret();

    /**
     * Retrieves the OAuth redirect URI for GitHub authentication.
     *
     * @return The OAuth redirect URI.
     */
    String getOAuthRedirectUri();

    /**
     * Retrieves the OAuth scope for GitHub authentication.
     *
     * @return The OAuth scope.
     */
    String getOAuthScope();

    /**
     * Retrieves the JWT secret used for signing tokens.
     *
     * @return The JWT secret.
     */
    String getJWTSecret();
    
    /**
     * Retrieves the frontend URL for the application.
     *
     * @return The frontend URL.
     */
    String getFrontendUrl();

    /**
     * Retrieves the JWT expiration time in seconds.
     *
     * @return The JWT expiration time in seconds.
     */
    long getJwtExpirationSeconds();
}
