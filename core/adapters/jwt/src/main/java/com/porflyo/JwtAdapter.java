package com.porflyo;

import java.text.ParseException;
import java.time.Instant;
import java.util.Date;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.porflyo.configuration.JwtConfig;
import com.porflyo.exceptions.auth.AuthException;
import com.porflyo.exceptions.auth.JwtExpiredException;
import com.porflyo.exceptions.auth.JwtGenerationException;
import com.porflyo.exceptions.auth.JwtInvalidIssuerException;
import com.porflyo.exceptions.auth.JwtInvalidSignatureException;
import com.porflyo.exceptions.auth.JwtMalformedException;
import com.porflyo.exceptions.auth.JwtVerificationException;
import com.porflyo.model.user.UserClaims;
import com.porflyo.ports.JwtPort;

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


    // ────────────────────────── Generate ──────────────────────────

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
            throw new JwtGenerationException(e.getMessage(), e);
        }
    }
    

    // ────────────────────────── Verify ──────────────────────────
    public void verifyTokenOrThrow(String token) {
        try {
            SignedJWT jwt = SignedJWT.parse(token);

            // Firm
            JWSVerifier verifier = new MACVerifier(jwtConfig.secret());
            if (!jwt.verify(verifier)) 
                throw new JwtInvalidSignatureException();

            // Claims
            JWTClaimsSet c = jwt.getJWTClaimsSet();

            // Issuer
            String iss = c.getIssuer();
            if (!ISSUER.equals(iss)) 
                throw new JwtInvalidIssuerException(ISSUER);

            // Expiration
            Date exp = c.getExpirationTime();
            if (exp != null && exp.before(new Date())) 
                throw new JwtExpiredException();

        } catch (ParseException pe) {
            // malformed token/base64/structure
            throw new JwtMalformedException("Token is malformed: " + pe.getMessage());
        
        } catch (JOSEException je) {
            throw new JwtVerificationException("Signature verification failed: " + je.getMessage(), je);
        }
    }

    @Override
    public UserClaims extractClaims(String token) {
        try {

            verifyTokenOrThrow(token);

            // Extract claims
            SignedJWT jwt = SignedJWT.parse(token);
            JWTClaimsSet claims = jwt.getJWTClaimsSet();
            
            String sub = claims.getSubject();
            Instant iat = claims.getIssueTime().toInstant();
            Instant exp = claims.getExpirationTime().toInstant();

            if (sub == null || iat == null || exp == null) {
                throw new JwtMalformedException("Missing required claims (sub/iat/exp)");
            }

            return new UserClaims(sub, iat, exp);

        } catch (AuthException ae) {
             throw ae;

        } catch (Exception e) {
            throw new JwtMalformedException("Invalid JWT claims: " + e.getMessage());
        }
    }
}