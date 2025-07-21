package com.porflyo.domain.model;

import java.time.Instant;

/**
 * Represents the claims of a user session, including user ID,
 *  issued at time and expiration time
 *
 * @param sub         The subject - User ID.
 * @param iat         The issued at time.
 * @param exp         The expiration time.
 */
public record UserSessionClaims(
    String sub,        // Subject - User ID
    Instant iat,       // Issued At
    Instant exp,       // Expiration

    // CRITICAL: eliminate this field when persistence is implemented
    String accessToken

    // If needs support for multiple devices or sessions:
    //String sessionId,  // Session ID for session management
    
    // If needs an inmediate logout or session invalidation:
    //String jti         // JWT ID - unique token identifier
) { }
