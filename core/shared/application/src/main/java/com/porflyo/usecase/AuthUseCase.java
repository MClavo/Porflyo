package com.porflyo.usecase;

import java.net.URI;
import java.util.Collections;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.porflyo.configuration.JwtConfig;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.provider.ProviderUser;
import com.porflyo.model.user.ProviderAccount;
import com.porflyo.model.user.User;
import com.porflyo.model.user.UserClaims;
import com.porflyo.model.user.UserSession;
import com.porflyo.ports.JwtPort;
import com.porflyo.ports.MediaRepository;
import com.porflyo.ports.ProviderPort;
import com.porflyo.ports.QuotaRepository;
import com.porflyo.ports.UserRepository;

import jakarta.inject.Inject;


public class AuthUseCase {
    private static final Logger log = LoggerFactory.getLogger(AuthUseCase.class);
    private final UserRepository userRepository;
    private final MediaRepository mediaRepository;
    private final QuotaRepository quotaRepository;

    private final JwtConfig jwtConfig;
    private final ProviderPort authProvider;
    private final JwtPort jwt;

    @Inject
    public AuthUseCase(
            ProviderPort providerPort,
            JwtPort jwtPort,
            JwtConfig jwtConfig,
            UserRepository userRepository,
            MediaRepository mediaRepository,
            QuotaRepository quotaRepository
            ) {

        this.authProvider = providerPort;
        this.jwt = jwtPort;
        this.jwtConfig = jwtConfig;
        this.userRepository = userRepository;
        this.mediaRepository = mediaRepository;
        this.quotaRepository = quotaRepository;
    }


    // ────────────────────────── Implementation ──────────────────────────

    public void verifyTokenOrThrow(String token) {
        jwt.verifyTokenOrThrow(token);
    }

    public UserClaims extractClaims(String token) {
        return jwt.extractClaims(token);
    }

    public String buildOAuthLoginUrl() {
        return authProvider.buildAuthorizationUrl();
    }

    public UserSession handleOAuthCallback(String code) {
       try {
            // Exchange the code for an access token and fetch user data
            String accessToken = authProvider.exchangeCodeForAccessToken(code);
            ProviderUser providerUser = authProvider.getUserData(accessToken);

            User user = generateUserFromProviderAccount(providerUser, accessToken);

            // Save or update new user in the repository
            user = saveOrUpdateUser(user);

            UserClaims claims = new UserClaims(
                user.id().value(),
                jwtConfig.expiration()
            );

            String jwtToken = jwt.generateToken(claims);


            log.debug("User session created for User ID: {}", user.id().value());

            return new UserSession(jwtToken, user);
            
        } catch (Exception e) {
            log.error("Failed to handle OAuth callback: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to handle OAuth callback", e);
        }
    }


    // ────────────────────────── Helpers ──────────────────────────

    private User generateUserFromProviderAccount(ProviderUser providerUser, String accessToken) {
        
        ProviderAccount providerAccount = new ProviderAccount(
            ProviderAccount.resolveProvider(authProvider.getProviderName()),
            providerUser.id(),
            providerUser.name(),
            URI.create(providerUser.avatar_url()),
            accessToken
        );

        UserId id = UserId.newKsuid();
        String profileImageKey = "u/" + id.value() + ".webp";

        return new User(
            id,
            providerAccount,
            providerUser.name(),
            providerUser.email(),
            "",                             // Empty description
            profileImageKey,
            Collections.emptyMap()
        );
    }

    private User saveOrUpdateUser(User user) {
        // Check if user already exists by provider ID
        User existingUser = userRepository.findByProviderId(
                user.provider().providerUserId())
            .orElse(null);

            log.debug("Existing user: {}", existingUser != null ? existingUser.id().value() : "none");
        // Save new user or patch provider account if user already exists
        if (existingUser != null) {
            return updateProviderAccount(existingUser, user); // Update provider account if necessary

        } else {
            saveNewUser(user); // Save new user
            return user;
        }
    }

    private void saveNewUser(User user) {
        mediaRepository.putFromUrl(user.profileImage(), user.provider().providerAvatarUrl());
        userRepository.save(user);
        quotaRepository.create(user.id());

        log.debug("Successfully saved new user: {}", user.id().value());
    }

    private User updateProviderAccount(User existingUser, User newUser) {
        log.debug("Existing provider: {}, New provider: {}",
            existingUser.provider().providerUserId().value(),
            newUser.provider().providerUserId().value());
        if(existingUser.provider().equals(newUser.provider())) 
            return existingUser;

        log.debug("Updating provider account for user: {}", existingUser.id().value());

        return userRepository.patchProviderAccount(existingUser.id(), newUser.provider());
    }

}
