package com.porflyo.infrastructure.adapters.output.github;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.porflyo.application.ports.output.ConfigurationPort;
import com.porflyo.application.ports.output.GithubPort;
import com.porflyo.domain.model.GithubRepo;
import com.porflyo.domain.model.GithubUser;
import com.porflyo.infrastructure.adapters.output.github.dto.GithubAccessTokenResponseDto;
import com.porflyo.infrastructure.adapters.output.github.dto.GithubRepoResponseDto;
import com.porflyo.infrastructure.adapters.output.github.dto.GithubUserResponseDto;
import com.porflyo.infrastructure.adapters.output.github.mapper.GithubDtoMapper;

import io.micronaut.json.JsonMapper;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
public class GithubAdapter implements GithubPort {
    
    private static final String TOKEN_URL = "https://github.com/login/oauth/access_token";
    private static final String USER_URL = "https://api.github.com/user";
    private static final String REPOS_URL = "https://api.github.com/user/repos?sort=updated&direction=desc&per_page=100";
    
    private static final Logger log = LoggerFactory.getLogger(GithubAdapter.class);
    private final ConfigurationPort config;
    private final JsonMapper jsonMapper;
    private final HttpClient httpClient;

    @Inject
    public GithubAdapter(ConfigurationPort config, JsonMapper jsonMapper) {
        this.config = config;
        this.jsonMapper = jsonMapper;
        this.httpClient = HttpClient.newHttpClient();
    }

    // Package-private constructor for testing
    GithubAdapter(ConfigurationPort config, JsonMapper jsonMapper, HttpClient httpClient) {
        this.config = config;
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
        
        String clientId = config.getOAuthClientId();
        String clientSecret = config.getOAuthClientSecret();
        String redirectUri = config.getOAuthRedirectUri();
        
        if (clientId == null || clientId.trim().isEmpty() || clientId.equals("your-github-client-id")) {
            log.error("Invalid OAuth client ID: {}", clientId);
            throw new IllegalArgumentException("OAuth client ID is not properly configured");
        }
        
        if (clientSecret == null || clientSecret.trim().isEmpty() || clientSecret.equals("your-github-client-secret")) {
            log.error("Invalid OAuth client secret (showing first 4 chars): {}", 
                clientSecret != null && clientSecret.length() > 4 ? clientSecret.substring(0, 4) + "..." : "null");
            throw new IllegalArgumentException("OAuth client secret is not properly configured");
        }
        
        if (redirectUri == null || redirectUri.trim().isEmpty()) {
            log.error("Invalid OAuth redirect URI: {}", redirectUri);
            throw new IllegalArgumentException("OAuth redirect URI is not properly configured");
        }
        
        log.debug("OAuth Configuration - Client ID: {}, Redirect URI: {}, Code: {}", clientId, redirectUri, code);
        
        try {
            // Prepare the request body as URL-encoded form data with proper encoding
            String formData = String.format(
                "client_id=%s&client_secret=%s&code=%s&redirect_uri=%s",
                URLEncoder.encode(clientId, StandardCharsets.UTF_8),
                URLEncoder.encode(clientSecret, StandardCharsets.UTF_8),
                URLEncoder.encode(code, StandardCharsets.UTF_8),
                URLEncoder.encode(redirectUri, StandardCharsets.UTF_8)
            );

            log.debug("Request URL: {}", TOKEN_URL);
            log.debug("Form data: client_id={}&client_secret=[REDACTED]&code={}&redirect_uri={}", 
                URLEncoder.encode(clientId, StandardCharsets.UTF_8),
                URLEncoder.encode(code, StandardCharsets.UTF_8),
                URLEncoder.encode(redirectUri, StandardCharsets.UTF_8));

            // Build the HTTP request
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(TOKEN_URL))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .header("Accept", "application/json")
                .header("User-Agent", config.getUserAgent())
                .POST(HttpRequest.BodyPublishers.ofString(formData))
                .timeout(Duration.ofSeconds(30))
                .build();

            // Send the request and get the response
            GithubAccessTokenResponseDto dto = send(request, GithubAccessTokenResponseDto.class);
            log.debug("Successfully exchanged code for access token");
            return dto.access_token();

        } catch (Exception e) {
            log.error("Error exchanging code for access token", e);
            throw new RuntimeException("Failed to exchange GitHub code", e);
        }
    }

    @Override
    public GithubUser getUserData(String accessToken) {
        log.debug("Fetching user data from GitHub API using native HTTP client");
        try {
            HttpRequest request = buildGetRequest(USER_URL, accessToken);
            GithubUserResponseDto dto = send(request, GithubUserResponseDto.class);

            log.debug("Successfully fetched user info");
            return GithubDtoMapper.toDomain(dto);

        } catch (Exception e) {
            log.error("Error fetching user info", e);
            throw new RuntimeException("Failed to fetch GitHub user data", e);
        }
    }

    @Override
    public List<GithubRepo> getUserRepos(String accessToken) {
        log.debug("Fetching user repositories from GitHub API using native HTTP client");
        try {
            HttpRequest request = buildGetRequest(REPOS_URL, accessToken);
            GithubRepoResponseDto[] dtoArray = send(request, GithubRepoResponseDto[].class);

            log.debug("Successfully fetched {} repositories", dtoArray.length);
            return GithubDtoMapper.toDomainList(dtoArray);

        } catch (Exception e) {
            log.error("Error fetching user repositories", e);
            throw new RuntimeException("Failed to fetch GitHub repositories", e);
        }
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
        
        // Check if the response was successful
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            log.error("HTTP request failed with status code: {} and body: {}", response.statusCode(), response.body());
            
            // For OAuth token endpoint, provide more specific error information
            if (request.uri().toString().contains("oauth/access_token")) {
                log.error("OAuth token exchange failed. This could be due to:");
                log.error("1. Invalid or expired authorization code");
                log.error("2. Incorrect OAuth client configuration");
                log.error("3. Mismatched redirect URI");
                log.error("4. Invalid client credentials");
                log.error("Request URI: {}", request.uri());
                log.error("Request headers: {}", request.headers().map());
            }
            
            throw new RuntimeException("HTTP request failed with status code: " + response.statusCode() + " and body: " + response.body());
        }
        
        try {
            return jsonMapper.readValue(response.body().getBytes(StandardCharsets.UTF_8), clazz);
        } catch (Exception e) {
            log.error("Failed to parse JSON response. Status code: {}, Response body: {}", response.statusCode(), response.body());
            throw new RuntimeException("Failed to parse JSON response: " + e.getMessage() + ". Response body: " + response.body(), e);
        }
    }
}
