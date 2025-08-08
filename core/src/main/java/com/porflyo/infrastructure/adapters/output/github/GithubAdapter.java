package com.porflyo.infrastructure.adapters.output.github;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.porflyo.application.configuration.ProviderOAuthConfig;
import com.porflyo.application.ports.output.ProviderPort;
import com.porflyo.domain.model.provider.ProviderRepo;
import com.porflyo.domain.model.provider.ProviderUser;
import com.porflyo.infrastructure.adapters.output.github.dto.GithubAccessTokenResponseDto;
import com.porflyo.infrastructure.adapters.output.github.dto.GithubRepoResponseDto;
import com.porflyo.infrastructure.adapters.output.github.dto.GithubUserResponseDto;
import com.porflyo.infrastructure.adapters.output.github.exception.GithubApiException;
import com.porflyo.infrastructure.adapters.output.github.exception.GithubAuthenticationException;
import com.porflyo.infrastructure.adapters.output.github.exception.GithubConfigurationException;
import com.porflyo.infrastructure.adapters.output.github.mapper.GithubDtoMapper;

import io.micronaut.json.JsonMapper;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
public class GithubAdapter implements ProviderPort {
    
    private static final String TOKEN_URL = "https://github.com/login/oauth/access_token";
    private static final String USER_URL = "https://api.github.com/user";
    private static final String REPOS_URL = "https://api.github.com/user/repos?sort=updated&direction=desc&per_page=100";
    
    // HTTP Constants
    private static final int HTTP_TIMEOUT_SECONDS = 30;
    private static final int HTTP_SUCCESS_MIN = 200;
    private static final int HTTP_SUCCESS_MAX = 299;
    
    private static final Logger log = LoggerFactory.getLogger(GithubAdapter.class);
    private final JsonMapper jsonMapper;
    private final HttpClient httpClient;
    private final ProviderOAuthConfig oauthConfig;

    @Inject
    public GithubAdapter(ProviderOAuthConfig oauthConfig, JsonMapper jsonMapper) {
        this.oauthConfig = validateNotNull(oauthConfig, "GithubOAuthConfig cannot be null");
        this.jsonMapper = validateNotNull(jsonMapper, "JsonMapper cannot be null");
        this.httpClient = createConfiguredHttpClient();
    }

    // Package-private constructor for testing
    GithubAdapter(ProviderOAuthConfig oauthConfig, JsonMapper jsonMapper, HttpClient httpClient) {
        this.oauthConfig = oauthConfig;
        this.jsonMapper = jsonMapper;
        this.httpClient = httpClient;
    }

    @Override
    public String exchangeCodeForAccessToken(String code) {
        log.debug("Exchanging OAuth code for access token using native HTTP client");
        
        // Validate inputs before making the request
        if (code == null || code.trim().isEmpty()) {
            throw new IllegalArgumentException("OAuth code cannot be null or empty");
        }
        String clientId = oauthConfig.clientId();
        String clientSecret = oauthConfig.clientSecret();
        String redirectUri = oauthConfig.redirectUri();

        try {
            validateOAuthParameters(code, clientId, clientSecret, redirectUri);
            
            HttpRequest request = buildTokenRequest(code, clientId, clientSecret, redirectUri);

            // Send the request and get the response
            GithubAccessTokenResponseDto dto = send(request, GithubAccessTokenResponseDto.class);
            log.debug("Successfully exchanged code for access token");
            return dto.access_token();

        } catch (GithubConfigurationException | GithubAuthenticationException e) {
            // Re-throw specific exceptions without wrapping
            throw e;
        } catch (Exception e) {
            log.error("Error exchanging code for access token", e);
            throw new GithubAuthenticationException("Failed to exchange GitHub code", e);
        }
    }

    @Override
    public ProviderUser getUserData(String accessToken) {
        log.debug("Fetching user data from GitHub API using native HTTP client");
        try {
            HttpRequest request = buildGetRequest(USER_URL, accessToken);
            GithubUserResponseDto dto = send(request, GithubUserResponseDto.class);

            log.debug("Successfully fetched user info");
            return GithubDtoMapper.toDomain(dto);

        } catch (GithubApiException | GithubAuthenticationException e) {
            // Re-throw specific exceptions without wrapping
            throw e;
        } catch (Exception e) {
            log.error("Error fetching user info", e);
            throw new GithubApiException("Failed to fetch GitHub user data", 0, e);
        }
    }

    @Override
    public List<ProviderRepo> getUserRepos(String accessToken) {
        log.debug("Fetching user repositories from GitHub API using native HTTP client");
        try {
            HttpRequest request = buildGetRequest(REPOS_URL, accessToken);
            GithubRepoResponseDto[] dtoArray = send(request, GithubRepoResponseDto[].class);

            log.debug("Successfully fetched {} repositories", dtoArray.length);
            return GithubDtoMapper.toDomainList(dtoArray);

        } catch (GithubApiException | GithubAuthenticationException e) {
            // Re-throw specific exceptions without wrapping
            throw e;

        } catch (Exception e) {
            log.error("Error fetching user repositories", e);
            throw new GithubApiException("Failed to fetch GitHub repositories", 0, e);
        }
    }


    /**
     * Builds an HTTP POST request for exchanging the OAuth code for an access token.
     *
     * @param code          The OAuth code received from GitHub
     * @param clientId      The GitHub OAuth client ID
     * @param clientSecret  The GitHub OAuth client secret
     * @param redirectUri   The GitHub OAuth redirect URI
     * @return              The constructed HTTP request
     */
    private HttpRequest buildTokenRequest(String code, String clientId, String clientSecret, String redirectUri) {
        // Prepare the request body as URL-encoded form data with proper encoding
        String formData = String.format(
            "client_id=%s&client_secret=%s&code=%s&redirect_uri=%s",
            URLEncoder.encode(clientId, StandardCharsets.UTF_8),
            URLEncoder.encode(clientSecret, StandardCharsets.UTF_8),
            URLEncoder.encode(code, StandardCharsets.UTF_8),
            URLEncoder.encode(redirectUri, StandardCharsets.UTF_8)
        );
        
        log.debug("Request URL: {}", TOKEN_URL);
        log.debug("OAuth token request prepared for client_id: {}", 
            URLEncoder.encode(clientId, StandardCharsets.UTF_8));

        // Build the HTTP request
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(TOKEN_URL))
            .header("Content-Type", "application/x-www-form-urlencoded")
            .header("Accept", "application/json")
            .header("User-Agent", oauthConfig.userAgent())
            .POST(HttpRequest.BodyPublishers.ofString(formData))
            .timeout(Duration.ofSeconds(HTTP_TIMEOUT_SECONDS))
            .build();
        return request;
    }


    /*
     * Validates the required OAuth parameters for GitHub authentication.
     *
     * @throws GithubConfigurationException if any of the parameters are invalid or not properly configured
     */
    private void validateOAuthParameters(String code, String clientId, String clientSecret, String redirectUri) {
        if (clientId == null || clientId.trim().isEmpty() || clientId.equals("your-github-client-id")) {
            log.error("Invalid OAuth client ID configuration");
            throw new GithubConfigurationException("OAuth client ID is not properly configured");
        }
        
        if (clientSecret == null || clientSecret.trim().isEmpty() || clientSecret.equals("your-github-client-secret")) {
            log.error("Invalid OAuth client secret configuration");
            throw new GithubConfigurationException("OAuth client secret is not properly configured");
        }
        
        if (redirectUri == null || redirectUri.trim().isEmpty()) {
            log.error("Invalid OAuth redirect URI configuration");
            throw new GithubConfigurationException("OAuth redirect URI is not properly configured");
        }
        
        log.debug("OAuth Configuration validated - Client ID: {}, Redirect URI: {}", clientId, redirectUri);
    }

    
    /**
     * Builds an HTTP GET request for the specified URL with the provided GitHub authentication token.
     * <p>
     * The request includes the following headers:
     * <ul>
     *   <li><b>Authorization:</b> Bearer token for GitHub API authentication</li>
     *   <li><b>Accept:</b> application/vnd.github+json to specify the GitHub API media type</li>
     *   <li><b>X-GitHub-Api-Version:</b> 2022-11-28 to specify the API version</li>
     * </ul>
     *
     * @param url   the target URL for the GET request
     * @param token the GitHub API authentication token
     * @return      a configured {@link HttpRequest} instance for the GET operation
     */
    private HttpRequest buildGetRequest(String url, String token) {
        return HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Authorization", "Bearer " + token)
            .header("Accept", "application/vnd.github+json")
            .header("X-GitHub-Api-Version", "2022-11-28")
            .GET()
            .build();
    }

    /**
     * Sends an HTTP request and maps the response to the specified class type.
     *
     * @param request the HTTP request to send
     * @param clazz   the class type to map the response to
     * @return       the mapped response object
     * @throws Exception if an error occurs while sending the request or mapping the response
     */
    private <T> T send(HttpRequest request, Class<T> clazz) throws Exception {
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        validateResponse(response, request);
        return parseResponse(response, clazz);
    }

    /**
     * Validates the HTTP response status code.
     *
     * @param response the HTTP response to validate
     * @param request  the original request (for error context)
     * @throws GithubApiException if the response indicates an error
     * @throws GithubAuthenticationException if the response indicates authentication failure
     */
    private void validateResponse(HttpResponse<String> response, HttpRequest request) {
        if (response.statusCode() >= HTTP_SUCCESS_MIN && response.statusCode() <= HTTP_SUCCESS_MAX) {
            return; // Success, no validation needed
        }

        log.error("HTTP request failed with status code: {} and body: {}", response.statusCode(), response.body());

        // Handle OAuth-specific errors
        if (request.uri().toString().contains("oauth/access_token")) {
            logOAuthErrorDetails(request);
            throw new GithubAuthenticationException(
                "OAuth token exchange failed with status code: " + response.statusCode() + 
                ". Response: " + response.body()
            );
        }

        // Handle general API errors
        throw new GithubApiException(
            "GitHub API request failed. Response: " + response.body(),
            response.statusCode()
        );
    }

    /**
     * Logs detailed error information for OAuth failures.
     *
     * @param request the failed OAuth request
     */
    private void logOAuthErrorDetails(HttpRequest request) {
        log.error("OAuth token exchange failed. This could be due to:");
        log.error("1. Invalid or expired authorization code");
        log.error("2. Incorrect OAuth client configuration");
        log.error("3. Mismatched redirect URI");
        log.error("4. Invalid client credentials");
        log.error("Request URI: {}", request.uri());
        // Note: Intentionally not logging headers as they may contain sensitive information
    }

    /**
     * Parses the HTTP response body to the specified class type.
     *
     * @param response the HTTP response to parse
     * @param clazz    the target class type
     * @return the parsed object
     * @throws GithubApiException if parsing fails
     */
    private <T> T parseResponse(HttpResponse<String> response, Class<T> clazz) {
        try {
            return jsonMapper.readValue(response.body().getBytes(StandardCharsets.UTF_8), clazz);
        } catch (Exception e) {
            log.error("Failed to parse JSON response. Status code: {}, Response body: {}", 
                response.statusCode(), response.body());
            throw new GithubApiException(
                "Failed to parse GitHub API response: " + e.getMessage() + 
                ". Response body: " + response.body(),
                response.statusCode(),
                e
            );
        }
    }

    /**
     * Creates a configured HttpClient with proper timeout settings.
     *
     * @return a configured HttpClient instance
     */
    private HttpClient createConfiguredHttpClient() {
        return HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(HTTP_TIMEOUT_SECONDS))
            .build();
    }

    /**
     * Validates that an object is not null.
     *
     * @param object the object to validate
     * @param message the error message if validation fails
     * @return the validated object
     * @throws IllegalArgumentException if the object is null
     */
    private <T> T validateNotNull(T object, String message) {
        if (object == null) {
            throw new IllegalArgumentException(message);
        }
        return object;
    }
}
