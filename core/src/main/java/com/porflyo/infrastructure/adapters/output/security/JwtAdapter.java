package com.porflyo.infrastructure.adapters.output.security;

import java.time.Instant;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.porflyo.application.configuration.JwtConfig;
import com.porflyo.application.ports.output.JwtPort;
import com.porflyo.domain.model.UserClaims;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
public class JwtAdapter implements JwtPort {

    private final JwtConfig jwtConfig;
    private final static String ISSUER = "Porflyo";

    @Inject
    public JwtAdapter(JwtConfig jwtConfig) {
        this.jwtConfig = jwtConfig;
    }

    @Override
    public String generateToken(UserClaims claims) {
        try {
            JWSSigner signer = new MACSigner(jwtConfig.secret());

            // Create JWT claims set
            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .issuer(ISSUER)
                .subject(claims.getSub())
                .issueTime(java.util.Date.from(claims.getIat()))
                .expirationTime(java.util.Date.from(claims.getExp()))
                .build();

            // Create signed JWT with HS 256 algorithm
            SignedJWT signedJWT = new SignedJWT(
                new JWSHeader(JWSAlgorithm.HS256),
                claimsSet
            );

            signedJWT.sign(signer);

            return signedJWT.serialize();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate JWT token", e);
        }
    }

    @Override
    public boolean validateToken(String token) {
        try {
            // Parse the signed JWT
            SignedJWT signedJWT = SignedJWT.parse(token);

            // Create HMAC verifier
            JWSVerifier verifier = new MACVerifier(jwtConfig.secret());

            // Verify the signature
            if (!signedJWT.verify(verifier)) {
                return false;
            }

            // Check issuer
            JWTClaimsSet claims = signedJWT.getJWTClaimsSet();
            if (!ISSUER.equals(claims.getIssuer())) {
                return false;
            }

            // Check expiration
            if (claims.getExpirationTime() != null && 
                claims.getExpirationTime().before(new java.util.Date())) {
                return false;
            }

            return true;

        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public UserClaims extractClaims(String token) {
        try {

            SignedJWT signedJWT = SignedJWT.parse(token);
            JWSVerifier verifier = new MACVerifier(jwtConfig.secret());

            if (!signedJWT.verify(verifier)) {
                throw new RuntimeException("Invalid JWT signature");
            }

            // Extract claims
            JWTClaimsSet claims = signedJWT.getJWTClaimsSet();
            
            String sub = claims.getSubject();
            Instant iat = claims.getIssueTime().toInstant();
            Instant exp = claims.getExpirationTime().toInstant();

            return new UserClaims(sub, iat, exp);

        } catch (Exception e) {
            throw new RuntimeException("Invalid JWT token", e);
        }
    }
}