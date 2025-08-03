package com.porflyo.domain.model;

import java.time.Instant;

import lombok.Getter;

/**
 * UserSessionClaims represents the claims associated with GitHub OAuth login.
 * It contains information such as the user ID (sub), issued at time (iat),
 * expiration time (exp), and access token
 */
@Getter
public class GithubLoginClaims {

    private final String sub;           // Subject - User ID
    private final Instant iat;          // Issued At
    private final Instant exp;          // Expiration
    private final String accessToken;   // GitHub Access Token

    // If needs support for multiple devices or sessions:
    //private final String sessionId;   // Session ID for session management
    
    // If needs an inmediate logout or session invalidation:
    //private final String jti;         // JWT ID - unique token identifier

    /*
     * Constructor with all fields for testing purposes.
     * @param sub The subject (user ID)
     * @param iat The issued at time
     * @param exp The expiration time
     * @param accessToken The GitHub access token
     */
    public GithubLoginClaims(String sub, Instant iat, Instant exp, String accessToken) {
        this.sub = sub;
        this.iat = iat;
        this.exp = exp;
        this.accessToken = accessToken;
    }

    /*
     * Constructor with subject and expiration, iat is set to now
     * @param sub The subject (user ID)
     * @param tokenLifetime The token lifetime in seconds
     * @param accessToken The GitHub access token
     * 
     * @returns A GithubLoginClaims object with the provided subject and expiration,
     */
    public GithubLoginClaims(String sub, long tokenLifetime, String accessToken) {
        this.sub = sub;
        this.iat = Instant.now();
        this.exp = iat.plusSeconds(tokenLifetime);
        this.accessToken = accessToken;
    }
}
