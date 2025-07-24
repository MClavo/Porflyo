package com.porflyo.infrastructure.adapters.output.github;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
        try {
            // Prepare the request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("client_id", config.getOAuthClientId());
            requestBody.put("client_secret", config.getOAuthClientSecret());
            requestBody.put("code", code);

            String form = jsonMapper.writeValueAsString(requestBody);

            // Build the HTTP request
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(TOKEN_URL))
                .header("redirect_uri", config.getOAuthRedirectUri())
                .header("Accept", "application/vnd.github+json")
                .header("X-GitHub-Api-Version", "2022-11-28")
                .POST(HttpRequest.BodyPublishers.ofString(form))
                .build();

            // Send the request and get the response
            GithubAccessTokenResponseDto dto = send(request, GithubAccessTokenResponseDto.class);
            return dto.access_token();

        } catch (Exception e) {
            throw new RuntimeException("Failed to exchange GitHub code", e);
        }
    }

    @Override
    public GithubUser getUserData(String accessToken) {
        try {
            HttpRequest request = buildGetRequest(USER_URL, accessToken);
            GithubUserResponseDto dto = send(request, GithubUserResponseDto.class);

            return GithubDtoMapper.toDomain(dto);

        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch GitHub user data", e);
        }
    }

    @Override
    public List<GithubRepo> getUserRepos(String accessToken) {
        try {
            HttpRequest request = buildGetRequest(REPOS_URL, accessToken);
            GithubRepoResponseDto[] dtoArray = send(request, GithubRepoResponseDto[].class);

            return GithubDtoMapper.toDomainList(dtoArray);

        } catch (Exception e) {
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
        return jsonMapper.readValue(response.body().getBytes(StandardCharsets.UTF_8), clazz);
    }
}
