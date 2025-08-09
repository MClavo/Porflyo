package com.porflyo.domain.model.user;

import java.time.Instant;

/**
 * UserSessionClaims represents the claims associated with GitHub OAuth login.
 * It contains information such as the user ID (sub), issued at time (iat),
 * expiration time (exp)
 */
public class UserClaims {
    
    private final String sub;           // Subject - User ID
    private final Instant iat;          // Issued At
    private final Instant exp;          // Expiration
    
    // If needs support for multiple devices or sessions:
    //private final String sessionId;   // Session ID for session management
    
    // If needs an inmediate logout or session invalidation:
    //private final String jti;         // JWT ID - unique token identifier
    
    /*
    * Constructor with all fields for testing purposes.
    * @param sub The subject (user ID)
    * @param iat The issued at time
    * @param exp The expiration time
    */
    public UserClaims(String sub, Instant iat, Instant exp) {
        this.sub = sub;
        this.iat = iat;
        this.exp = exp;
    }
    
    /*
    * Constructor with subject and expiration, iat is set to now
    * @param sub The subject (user ID)
    * @param tokenLifetime The token lifetime in seconds
    * 
    * @returns A GithubLoginClaims object with the provided subject and expiration,
    */
    public UserClaims(String sub, long tokenLifetime) {
        this.sub = sub;
        this.iat = Instant.now();
        this.exp = iat.plusSeconds(tokenLifetime);
    }
    
    public String getSub() { return sub; }

    public Instant getIat() { return iat; }

    public Instant getExp() { return exp; }
}
