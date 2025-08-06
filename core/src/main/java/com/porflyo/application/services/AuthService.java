package com.porflyo.application.services;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Collections;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.porflyo.application.configuration.ProviderOAuthConfig;
import com.porflyo.application.configuration.JwtConfig;
import com.porflyo.application.ports.input.AuthUseCase;
import com.porflyo.application.ports.output.ProviderPort;
import com.porflyo.application.ports.output.JwtPort;
import com.porflyo.application.ports.output.UserRepository;
import com.porflyo.domain.model.provider.ProviderUser;
import com.porflyo.domain.model.shared.EntityId;
import com.porflyo.domain.model.user.ProviderAccount;
import com.porflyo.domain.model.user.User;
import com.porflyo.domain.model.user.UserClaims;
import com.porflyo.domain.model.user.UserSession;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

/**
 * Service responsible for handling authentication logic using GitHub OAuth.
 * <p>
 * This service provides methods to build the GitHub OAuth login URL and handle the OAuth callback,
 * exchanging the authorization code for an access token, retrieving user data, and generating a JWT token for session management.
 * </p>
 *
 * <p>
 * Dependencies:
 * <ul>
 *   <li>{@link ConfigurationPort} - Provides configuration values such as OAuth client ID, redirect URI, scope, and JWT expiration.</li>
 *   <li>{@link ProviderPort} - Handles communication with GitHub for exchanging codes and fetching user data.</li>
 *   <li>{@link JwtPort} - Responsible for generating JWT tokens based on user claims.</li>
 * </ul>
 * </p>
 *
 * <p>
 * Main methods:
 * <ul>
 *   <li>{@link #buildOAuthLoginUrl()} - Constructs the GitHub OAuth login URL with required parameters.</li>
 *   <li>{@link #handleOAuthCallback(String)} - Handles the OAuth callback by exchanging the code for an access token, retrieving user data, and generating a JWT token.</li>
 * </ul>
 * </p>
 *
 * <p>
 * This class is annotated with {@code @Singleton} to ensure a single instance is used throughout the application.
 * </p>
 */
@Singleton
public class AuthService implements AuthUseCase {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository userRepository;

    private final ProviderOAuthConfig oauthconfig;
    private final JwtConfig jwtConfig;
    private final ProviderPort github;
    private final JwtPort jwt;

    @Inject
    public AuthService(ProviderPort githubPort, JwtPort jwtPort, ProviderOAuthConfig Oauthconfig, JwtConfig jwtConfig, UserRepository userRepository) {
        this.github = githubPort;
        this.jwt = jwtPort;
        this.oauthconfig = Oauthconfig;
        this.jwtConfig = jwtConfig;
        this.userRepository = userRepository;
    }

    @Override
    public String buildOAuthLoginUrl() {
        String clientId = oauthconfig.clientId();
        String redirectUri = oauthconfig.redirectUri();
        String scope = oauthconfig.scope();

        String loginUrl = String.format(
            "https://github.com/login/oauth/authorize?client_id=%s&redirect_uri=%s&scope=%s&response_type=code",
            URLEncoder.encode(clientId, StandardCharsets.UTF_8),
            URLEncoder.encode(redirectUri, StandardCharsets.UTF_8),
            URLEncoder.encode(scope, StandardCharsets.UTF_8)
        );

        return loginUrl;
    }

    @Override
    public UserSession handleOAuthCallback(String code) {
       try {
            // Exchange the code for an access token and fetch user data
            String accessToken = github.exchangeCodeForAccessToken(code);
            ProviderUser githubUser = github.getUserData(accessToken);

            User user = createUserFromGithubUser(githubUser, accessToken);

            // Save or update new user in the repository
            user = saveOrUpdateUser(user);

            UserClaims claims = new UserClaims(
                user.id().value(),
                jwtConfig.expiration()
            );

            String jwtToken = jwt.generateToken(claims);


            log.debug("User session created: JWT: {}, User ID: {}", jwtToken, user.id().value());

            return new UserSession(jwtToken, user);
            
        } catch (Exception e) {
            // Handle exceptions appropriately, e.g., log error, rethrow, etc.
            throw new RuntimeException("Failed to handle OAuth callback", e);
        }
    }

    private User createUserFromGithubUser(ProviderUser githubUser, String accessToken) {
        
        ProviderAccount githubAccount = new ProviderAccount(
            githubUser.id(),
            githubUser.name(),
            URI.create(githubUser.avatar_url()),
            accessToken
        );

        EntityId id = EntityId.newKsuid();


        return new User(
            id,
            githubAccount,
            githubUser.name(),
            githubUser.email(),
            "",                             // Empty description
            URI.create(githubUser.avatar_url()),
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
            user = updateProviderAccount(existingUser, user); // Update provider account if necessary

        } else {
            userRepository.save(user);
        }

        return user;
    }

    private User updateProviderAccount(User existingUser, User newUser) {
        log.debug("THIS HAS BEEN CALLED");
        if(existingUser.provider().equals(newUser.provider())) 
            return existingUser;

        log.debug("Updating provider account for user: {}", existingUser.id().value());

        return userRepository.patchProviderAccount(existingUser.id(), newUser.provider());
    }

}
