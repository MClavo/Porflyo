package com.porflyo;

import java.io.IOException;
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

import com.porflyo.configuration.GithubConfig;
import com.porflyo.configuration.ProviderOAuthConfig;
import com.porflyo.dto.GithubAccessTokenResponseDto;
import com.porflyo.dto.GithubUserResponseDto;
import com.porflyo.exception.GithubApiException;
import com.porflyo.exception.GithubAuthenticationException;
import com.porflyo.exception.GithubConfigurationException;
import com.porflyo.exception.TransientGithubException;
import com.porflyo.mapper.GithubDtoMapper;
import com.porflyo.model.provider.ProviderRepo;
import com.porflyo.model.provider.ProviderUser;
import com.porflyo.ports.ProviderPort;

import io.micronaut.json.JsonMapper;
import io.micronaut.retry.annotation.Retryable;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
@Retryable(
    attempts = "3",
    delay = "300ms",
    multiplier = "2",
    maxDelay = "2s",
    includes = { TransientGithubException.class }
)
public class GithubAdapter implements ProviderPort {
    
    private static final Logger log = LoggerFactory.getLogger(GithubAdapter.class);
    private final JsonMapper mapper;
    private final HttpClient httpClient;
    private final ProviderOAuthConfig oauthConfig;
    private final GithubConfig githubConfig;
    
    // HTTP Constants
    private static final int HTTP_TIMEOUT_SECONDS = 30;
    private static final int HTTP_SUCCESS_MIN = 200;
    private static final int HTTP_SUCCESS_MAX = 299;
    
    private static final String TOKEN_URL_PATH = "/login/oauth/access_token";
    private static final String USER_URL_PATH = "/user";
    private static final String REPOS_URL_PATH = "/user/repos?sort=updated&direction=desc&per_page=100";

    private String TOKEN_URL;
    private String USER_URL;
    private String REPOS_URL;

    @Inject
    public GithubAdapter(ProviderOAuthConfig oauthConfig, JsonMapper mapper, GithubConfig githubConfig) {
        this.oauthConfig = validateNotNull(oauthConfig, "GithubOAuthConfig cannot be null");
        this.mapper = validateNotNull(mapper, "JsonMapper cannot be null");
        this.githubConfig = validateNotNull(githubConfig, "GithubConfig cannot be null");
        this.httpClient = createConfiguredHttpClient();

        this.TOKEN_URL = githubConfig.oauthBaseUrl() + TOKEN_URL_PATH;
        this.USER_URL = githubConfig.baseUrl() + USER_URL_PATH;
        this.REPOS_URL = githubConfig.baseUrl() + REPOS_URL_PATH;
    }


    // ────────────────────────── Implementation ──────────────────────────
    
    @Override
    public String getProviderName() {
        return "GitHub";
    }

    @Override
    public String buildAuthorizationUrl(){
        String clientId = oauthConfig.clientId();
        String redirectUri = oauthConfig.redirectUri();
        String scope = oauthConfig.scope();

        String loginUrl = String.format(
            "%s/login/oauth/authorize?client_id=%s&redirect_uri=%s&scope=%s&response_type=code",
            githubConfig.oauthBaseUrl(),
            URLEncoder.encode(clientId, StandardCharsets.UTF_8),
            URLEncoder.encode(redirectUri, StandardCharsets.UTF_8),
            URLEncoder.encode(scope, StandardCharsets.UTF_8)
        );

        return loginUrl;
    }

    @Override
    public String exchangeCodeForAccessToken(String code) {        
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
            log.debug("Successfully exchanged code for access token: {}, url: {}", dto.access_token(), request.toString());
            return dto.access_token();

        } catch (GithubConfigurationException | GithubAuthenticationException e) {
            // Re-throw specific exceptions without wrapping
            throw e;
        } catch (Exception e) {
            log.error("Error exchanging code for access token", e);
            throw new GithubAuthenticationException("Failed to exchange GitHub code", 400, e);
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
            ProviderRepo[] providerRepoArray = send(request, ProviderRepo[].class);

            log.debug("Successfully fetched {} repositories", providerRepoArray.length);
            return List.of(providerRepoArray);

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
        log.debug("Building token request for code: {}, client_id: {}, client_secret: {}, redirect_uri: {}", code, clientId, clientSecret, redirectUri);
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
            .header("User-Agent", oauthConfig.userAgent())
            .timeout(Duration.ofSeconds(HTTP_TIMEOUT_SECONDS))
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
        try {
            log.debug("Sending HTTP request: {}, Headers: {}", request.toString(), request.headers());
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            String ct = response.headers().firstValue("Content-Type").orElse("?");
            String preview = response.body() == null ? "null" : response.body().substring(0, Math.min(200, response.body().length()));
            log.debug("GitHub token exchange -> status={}, content-type={}, body[0..200]={}", 
          response.statusCode(), ct, preview);
            validateResponse(response, request); 
            
            return parseResponse(response, clazz);
         
        } catch (IOException e) {
            // Transitory fail -> retry
            throw new TransientGithubException("Transient network error calling GitHub", e);
        }
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
        int status = response.statusCode();
        if (status >= HTTP_SUCCESS_MIN && status <= HTTP_SUCCESS_MAX) {
            return; // Success, no validation needed
        }

        log.error("HTTP request failed with status code: {} and body: {}", response.statusCode(), response.body());
        
        String uri = request.uri().toString();

        // Authentication/Authorization: 401/403 on any endpoint
        // not retry
        if (status == 401 || status == 403) {
            throw new GithubAuthenticationException(
                "GitHub authentication failed with status code: " + status + ". Response: " + response.body(),
                status,
                null
            );
        }

        // 5xx -> transient -> retry
        if (status >= 500 && status <= 599) {
            throw new TransientGithubException(
                "GitHub transient error " + status + " for " + uri + ". Body: " + response.body()
            );
        }


        // Handle general API errors
        throw new GithubApiException(
            "GitHub API request failed. Response: " + response.body(),
            status
        );
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
            return mapper.readValue(response.body().getBytes(StandardCharsets.UTF_8), clazz);
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
