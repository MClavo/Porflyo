package com.porflyo.testing;

import java.time.Instant;
import java.util.List;

import com.porflyo.domain.model.GithubLoginClaims;
import com.porflyo.domain.model.GithubRepo;
import com.porflyo.domain.model.GithubUser;



/**
 * Utility class providing default test data for unit tests.
 * <p>
 * This class contains constant values and objects commonly used in tests,
 * such as default configuration parameters, sample GitHub user and repository data,
 * and default JWT claims.
 * </p>
 * <p>
 * The class is final and has a private constructor to prevent instantiation.
 * </p>
 *
 * <ul>
 *   <li>{@code DEFAULT_CLIENT_ID}, {@code DEFAULT_CLIENT_SECRET}, {@code DEFAULT_REDIRECT_URI}, {@code DEFAULT_SCOPE}:
 *       Default OAuth configuration values.</li>
 *   <li>{@code DEFAULT_JWT_SECRET}, {@code DEFAULT_JWT_EXPIRATION}:
 *       Default JWT secret and expiration time.</li>
 *   <li>{@code DEFAULT_FRONTEND_URL}:
 *       Default frontend URL for redirection.</li>
 *   <li>{@code DEFAULT_USER}:
 *       A sample {@link GithubUser} instance for testing.</li>
 *   <li>{@code REPO_1}, {@code REPO_2}:
 *       Sample {@link GithubRepo} instances for testing.</li>
 *   <li>{@code DEFAULT_REPOS}:
 *       List containing the default repositories.</li>
 *   <li>{@code DEFAULT_CLAIMS}:
 *       Sample {@link GithubLoginClaims} instance for JWT-related tests.</li>
 * </ul>
 */
public final class TestData {

    private TestData() {}
    
    public static final String DEFAULT_CODE = "test-auth-code-1234567890";
    public static final String DEFAULT_ACCESS_TOKEN = "ghp_test_token_1234567890";
    public static final String DEFAULT_JWT_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.test.token";


    // Default values for ConfigurationPort
    public static final String DEFAULT_CLIENT_ID = "test-client-id";
    public static final String DEFAULT_CLIENT_SECRET = "test-client-secret";
    public static final String DEFAULT_REDIRECT_URI = "http://localhost:3000/auth/callback";
    public static final String DEFAULT_SCOPE = "user:email,read:user,public_repo";
    public static final String DEFAULT_JWT_SECRET = "test-jwt-secret-key";
    public static final String DEFAULT_FRONTEND_URL = "http://localhost:3000";
    public static final long DEFAULT_JWT_EXPIRATION = 3600L;

    public static final GithubUser DEFAULT_USER = new GithubUser(
        "testuser",
        "12345",
        "Test User",
        "test@example.com",
        "https://avatars.githubusercontent.com/u/12345"
    );

    public static final GithubRepo REPO_1 = new GithubRepo(
        "project-alpha",
        "My first repo",
        "https://github.com/testuser/project-alpha"
    );

    public static final GithubRepo REPO_2 = new GithubRepo(
        "project-beta",
        "Second repo",
        "https://github.com/testuser/project-beta"
    );

    public static final List<GithubRepo> DEFAULT_REPOS = List.of(REPO_1, REPO_2);

    public static final GithubLoginClaims DEFAULT_CLAIMS = new GithubLoginClaims(
        "12345",
        Instant.now(),
        Instant.now().plusSeconds(3600),
        TestData.DEFAULT_ACCESS_TOKEN
    );
}
