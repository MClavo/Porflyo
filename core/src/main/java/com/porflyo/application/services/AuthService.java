package com.porflyo.application.services;

import java.net.URI;
import java.util.Collections;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.porflyo.application.configuration.JwtConfig;
import com.porflyo.application.ports.input.AuthUseCase;
import com.porflyo.application.ports.output.JwtPort;
import com.porflyo.application.ports.output.MediaRepository;
import com.porflyo.application.ports.output.ProviderPort;
import com.porflyo.application.ports.output.UserRepository;
import com.porflyo.domain.model.ids.UserId;
import com.porflyo.domain.model.provider.ProviderUser;
import com.porflyo.domain.model.user.ProviderAccount;
import com.porflyo.domain.model.user.User;
import com.porflyo.domain.model.user.UserClaims;
import com.porflyo.domain.model.user.UserSession;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;


@Singleton
public class AuthService implements AuthUseCase {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository userRepository;
    private final MediaRepository mediaRepository;

    private final JwtConfig jwtConfig;
    private final ProviderPort authProvider;
    private final JwtPort jwt;

    @Inject
    public AuthService(
            ProviderPort providerPort,
            JwtPort jwtPort,
            JwtConfig jwtConfig,
            UserRepository userRepository,
            MediaRepository mediaRepository) {

        this.authProvider = providerPort;
        this.jwt = jwtPort;
        this.jwtConfig = jwtConfig;
        this.userRepository = userRepository;
        this.mediaRepository = mediaRepository;
    }


    // ────────────────────────── Implementation ──────────────────────────

    @Override
    public String buildOAuthLoginUrl() {
        return authProvider.buildAuthorizationUrl();
    }

    @Override
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

        log.debug("Successfully saved new user: {}", user.id().value());
    }

    private User updateProviderAccount(User existingUser, User newUser) {
        if(existingUser.provider().equals(newUser.provider())) 
            return existingUser;

        log.debug("Updating provider account for user: {}", existingUser.id().value());

        return userRepository.patchProviderAccount(existingUser.id(), newUser.provider());
    }

}
