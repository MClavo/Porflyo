package com.porflyo.infrastructure.adapters.output.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

import javax.crypto.SecretKey;

import com.porflyo.application.ports.output.ConfigurationPort;
import com.porflyo.application.ports.output.JwtPort;
import com.porflyo.domain.model.GithubLoginClaims;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
public class JwtAdapter implements JwtPort {

    // Generate a secret key for signing the JWT
    private final ConfigurationPort config;
    private final static String ISSUER = "Porflyo";

    private final SecretKey KEY;

    @Inject
    public JwtAdapter(ConfigurationPort configurationPort) {
        this.config = configurationPort;
        KEY = Keys.hmacShaKeyFor(config.getJWTSecret().getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Creates a JWT parser with the correct key and algorithm verification
     */
    private JwtParser createParser() {
        return Jwts.parser()
            .verifyWith(KEY)
            .requireIssuer(ISSUER)
            .build();
    }

    @Override
    public String generateToken(GithubLoginClaims claims) {
        try {
            String token = Jwts.builder()
                .issuer(ISSUER)
                .subject(claims.getSub())
                .issuedAt(Date.from(claims.getIat()))
                .expiration(Date.from(claims.getExp()))
                // CRITICAL: REMOVE "access_token" when persistence is implemented
                .claim("access_token", claims.getAccessToken())
                .signWith(KEY, Jwts.SIG.HS256)
                .compact();
            
            return token;

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate JWT token", e);
        }

    }

    @Override
    public boolean validateToken(String token) {
        try {
            createParser().parseSignedClaims(token);
            return true;

        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public GithubLoginClaims extractClaims(String token) {
        try {
            Claims claims = createParser()
                .parseSignedClaims(token)
                .getPayload();
            
            String sub = claims.getSubject();
            Instant iat = claims.getIssuedAt().toInstant();
            Instant exp = claims.getExpiration().toInstant();

            // CRITICAL: REMOVE "access_token" when persistence is implemented
            String accessToken = claims.get("access_token", String.class);
            
            return new GithubLoginClaims(sub, iat, exp, accessToken);

        } catch (Exception e) {
            throw new RuntimeException("Invalid JWT token", e);
        }
    }
}