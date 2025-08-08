package com.porflyo.application.services;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Collections;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.porflyo.application.configuration.JwtConfig;
import com.porflyo.application.configuration.ProviderOAuthConfig;
import com.porflyo.application.ports.input.AuthUseCase;
import com.porflyo.application.ports.output.JwtPort;
import com.porflyo.application.ports.output.MediaRepository;
import com.porflyo.application.ports.output.ProviderPort;
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
    private final MediaRepository mediaRepository;

    private final HttpClient httpClient;

    private final ProviderOAuthConfig oauthConfig;
    private final JwtConfig jwtConfig;
    private final ProviderPort github;
    private final JwtPort jwt;

    @Inject
    public AuthService(
            ProviderPort githubPort,
            JwtPort jwtPort,
            ProviderOAuthConfig Oauthconfig,
            JwtConfig jwtConfig,
            UserRepository userRepository,
            MediaRepository mediaRepository) {

        this.github = githubPort;
        this.jwt = jwtPort;
        this.oauthConfig = Oauthconfig;
        this.jwtConfig = jwtConfig;
        this.userRepository = userRepository;
        this.mediaRepository = mediaRepository;
        this.httpClient = HttpClient.newBuilder()
                                   .version(HttpClient.Version.HTTP_2)
                                   .build();
    }


    // ────────────────────────── Implementation ──────────────────────────

    @Override
    public String buildOAuthLoginUrl() {
        String clientId = oauthConfig.clientId();
        String redirectUri = oauthConfig.redirectUri();
        String scope = oauthConfig.scope();

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


    // ────────────────────────── Helpers ──────────────────────────

    private User createUserFromGithubUser(ProviderUser githubUser, String accessToken) {
        
        ProviderAccount githubAccount = new ProviderAccount(
            githubUser.id(),
            githubUser.name(),
            URI.create(githubUser.avatar_url()),
            accessToken
        );

        EntityId id = EntityId.newKsuid();
        String profileImageKey = "u/" + id.value() + ".webp";

        return new User(
            id,
            githubAccount,
            githubUser.name(),
            githubUser.email(),
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
            user = updateProviderAccount(existingUser, user); // Update provider account if necessary

        } else {
            user = saveNewUser(user); // Save new user
        }

        return user;
    }

    private User saveNewUser(User user) {
        log.debug("Saving new user and downloading profile image from: {}", user.provider().providerAvatarUrl());
        
        // Download and save the provider profile image
        try (InputStream imageStream = downloadImage(user.provider().providerAvatarUrl())) {
            // Save the image to media repository
            mediaRepository.put(user.profileImage(), imageStream);
            log.debug("Successfully saved profile image with key: {}", user.profileImage());
        } catch (Exception e) {
            log.error("Failed to download or save profile image for user: {}", user.id().value(), e);
            // Continue with user creation even if image download fails
        }

        userRepository.save(user);
        log.debug("Successfully saved new user: {}", user.id().value());

        return user;
    }


    // protected to mock in tests
    protected InputStream downloadImage(URI imageUrl) {
        try {
            log.debug("Downloading image from URL: {}", imageUrl);
            
            HttpRequest request = HttpRequest.newBuilder(imageUrl)
                    .GET()
                    .header("User-Agent", "Porflyo/1.0")
                    .build();
                    
            HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
            
            if (response.statusCode() != 200) {
                throw new RuntimeException("Failed to download image, HTTP status: " + response.statusCode());
            }
            
            log.debug("Successfully downloaded image from URL: {}", imageUrl);
            return response.body();
            
        } catch (IOException | InterruptedException e) {
            log.error("Failed to download image from URL: {}", imageUrl, e);
            throw new RuntimeException("Failed to download image from URL: " + imageUrl, e);
        }
    }

    private User updateProviderAccount(User existingUser, User newUser) {
        log.debug("THIS HAS BEEN CALLED");
        if(existingUser.provider().equals(newUser.provider())) 
            return existingUser;

        log.debug("Updating provider account for user: {}", existingUser.id().value());

        return userRepository.patchProviderAccount(existingUser.id(), newUser.provider());
    }

}
