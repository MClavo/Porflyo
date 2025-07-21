package com.porflyo.domain.model;

import java.time.Instant;

/**
 * UserSessionClaims represents the claims associated with GitHub OAuth login.
 * It contains information such as the user ID (sub), issued at time (iat)
 * and expiration time (exp)
 */
public class GithubLoginClaims {

    private final String sub;       // Subject - User ID
    private final Instant iat;      // Issued At
    private final Instant exp;      // Expiration

    // If needs support for multiple devices or sessions:
    //private final String sessionId;   // Session ID for session management
    
    // If needs an inmediate logout or session invalidation:
    //private final String jti;         // JWT ID - unique token identifier

    // CRITICAL: DELETE THIS FIELD WHEN PERSISTENCE IS IMPLEMENTED
    private final String accessToken;   // Access Token
    

    /*
     * Constructor with all fields for testing purposes.
     * @param sub The subject (user ID)
     * @param iat The issued at time
     * @param exp The expiration time
     * @param accessToken The access token
     */
    protected GithubLoginClaims(String sub, Instant iat, Instant exp, String accessToken) {
        this.sub = sub;
        this.iat = iat;
        this.exp = exp;
        this.accessToken = accessToken;
    }

    // Constructor with subject and expiration, iat is set to now
    public GithubLoginClaims(String sub, Instant exp) {
        this(sub, Instant.now(), exp, null);
    }

    // Constructor with subject only, iat is set to now, exp and accessToken are null
    public GithubLoginClaims(String sub) {
        this(sub, Instant.now(), null, null);
    }

    // CRITICAL: DELETE THIS METHOD WHEN PERSISTENCE IS IMPLEMENTED
    public GithubLoginClaims(String sub, String accessToken) {
        this(sub, Instant.now(), Instant.now().plusSeconds(3600), accessToken);
    }

    
    public String getSub() {
        return sub;
    }

    public Instant getIat() {
        return iat;
    }

    public Instant getExp() {
        return exp;
    }

    public String getAccessToken() {
        return accessToken;
    }
}
