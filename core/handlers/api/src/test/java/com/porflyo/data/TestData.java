package com.porflyo.data;

import java.net.URI;
import java.time.Instant;
import java.util.List;
import java.util.Map;

import com.porflyo.model.ids.ProviderUserId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.provider.ProviderRepo;
import com.porflyo.model.provider.ProviderUser;
import com.porflyo.model.user.ProviderAccount;
import com.porflyo.model.user.User;
import com.porflyo.model.user.UserClaims;
import com.porflyo.model.user.UserSession;



/**
 * Test data for Porflyo application.
 * <p>
 * This class provides static instances of various domain models and constants
 * used throughout the application for testing purposes.
 * </p>
 */
public final class TestData {

    private TestData() {}
    
    public static final String DEFAULT_OAUTH_CODE = "test-auth-code-1234567890";
    public static final String DEFAULT_ACCESS_TOKEN = "ghp_test_token_1234567890";
    public static final String DEFAULT_JWT_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.test.token";
    public static final String DEFAULT_LOGIN_URL = "https://github.com/login/oauth/authorize?client_id=test-client-id&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback&scope=user%3Aemail%2Cread%3Auser%2Cpublic_repo&response_type=code";


    // Default values for ConfigurationPort
    public static final String DEFAULT_PROVIDER_NAME = "GitHub";
    public static final String DEFAULT_CLIENT_ID = "test-client-id";
    public static final String DEFAULT_CLIENT_SECRET = "test-client-secret";
    public static final String DEFAULT_REDIRECT_URI = "http://localhost:3000/auth/callback";
    public static final String DEFAULT_SCOPE = "user:email,read:user,public_repo";
    public static final String DEFAULT_JWT_SECRET = "test-jwt-secret-key-that-is-long-enough-for-hs256-algorithm-requirements";
    public static final String DEFAULT_FRONTEND_URL = "http://localhost:3000";
    public static final long DEFAULT_JWT_EXPIRATION = 3600L;
    public static final String DEFAULT_USER_AGENT = "TestUserAgent/1.0";

    public static final String DEFAULT_GITHUB_ID = "12345";
    public static final String DEFAULT_GITHUB_NAME = "Test User";
    public static final String DEFAULT_GITHUB_EMAIL = "test@example.com";
    public static final String DEFAULT_GITHUB_AVATAR_URL = "https://avatars.githubusercontent.com/u/12345";


    public static final ProviderUser DEFAULT_GITHUB_USER = new ProviderUser(
        new ProviderUserId(DEFAULT_GITHUB_ID),
        DEFAULT_GITHUB_ID,
        DEFAULT_GITHUB_NAME,
        DEFAULT_GITHUB_EMAIL,
        DEFAULT_GITHUB_AVATAR_URL
    );

    public static final UserId DEFAULT_USER_ID = new UserId("12345");
    public static final ProviderUserId DEFAULT_PROVIDER_USER_ID = new ProviderUserId("12345");


    public static final ProviderAccount DEFAULT_PROVIDER_ACCOUNT = new ProviderAccount(
        ProviderAccount.Provider.GITHUB,
        DEFAULT_PROVIDER_USER_ID,
        DEFAULT_GITHUB_NAME,
        URI.create(DEFAULT_GITHUB_AVATAR_URL),
        DEFAULT_ACCESS_TOKEN
    );

    public static final User DEFAULT_USER = new User(
        DEFAULT_USER_ID,
        DEFAULT_PROVIDER_ACCOUNT,
        DEFAULT_GITHUB_NAME,
        DEFAULT_GITHUB_EMAIL,
        "Test Description",
        DEFAULT_GITHUB_AVATAR_URL,
        Map.of("github", "https://github.com/testuser")
    );

    public static final ProviderRepo REPO_1 = new ProviderRepo(
        "project-alpha",
        "My first repo",
        "https://github.com/testuser/project-alpha",
        null,
        null,
        0,
        0,
        null
    );

    public static final ProviderRepo REPO_2 = new ProviderRepo(
        "project-beta",
        "Second repo",
        "https://github.com/testuser/project-beta",
        null,
        null,
        0,
        0,
        null
    );

    public static final List<ProviderRepo> DEFAULT_REPOS = List.of(REPO_1, REPO_2);

    public static final UserClaims DEFAULT_CLAIMS = new UserClaims(
        "12345",
        Instant.now(),
        Instant.now().plusSeconds(3600)
    );

    public static final UserSession DEFAULT_USER_SESSION = new UserSession(
        DEFAULT_JWT_TOKEN,
        DEFAULT_USER
    );
}
