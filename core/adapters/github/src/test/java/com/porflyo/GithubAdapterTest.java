package com.porflyo;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.equalTo;
import static com.github.tomakehurst.wiremock.client.WireMock.getRequestedFor;
import static com.github.tomakehurst.wiremock.client.WireMock.matching;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathEqualTo;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;

import com.github.tomakehurst.wiremock.client.WireMock;
import com.github.tomakehurst.wiremock.junit5.WireMockExtension;
import com.porflyo.exception.GithubAuthenticationException;
import com.porflyo.model.provider.ProviderRepo;
import com.porflyo.model.provider.ProviderUser;
import com.porflyo.ports.output.ProviderPort;

import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import io.micronaut.test.support.TestPropertyProvider;
import jakarta.inject.Inject;

@MicronautTest
@DisplayName("GithubAdapter (integration with WireMock)")
class GithubAdapterTest implements TestPropertyProvider {

    // WireMock JUnit 5 Extension
    @RegisterExtension
    static WireMockExtension wireMock = WireMockExtension.newInstance()
        .options(wireMockConfig().port(8089)) 
        .build();

    @Inject
    ProviderPort providerPort;

    @Override
    public Map<String, String> getProperties() {
        String baseUrl = wireMock.baseUrl();
        
        return Map.of(
            "oauth.provider-name", "github",
            "oauth.client-id", "test-client-id",
            "oauth.client-secret", "test-client-secret", 
            "oauth.redirect-uri", "http://localhost:8080/callback",
            "oauth.scope", "repo",
            "oauth.user-agent", "test-agent",
            "github.api.base-url", baseUrl,
            "github.api.oauth-base-url", baseUrl
        );
    }

    @BeforeEach
    void setUp() {
        wireMock.resetAll();
    }

    @Test
    @DisplayName("should return mapped domain user when 200 OK")
    void should_return_mapped_domain_user_when_200() {
        // given
        wireMock.stubFor(WireMock.get(urlPathEqualTo("/user"))
            .withHeader("Authorization", equalTo("Bearer user-token"))
            .withHeader("Accept", equalTo("application/vnd.github+json"))
            .withHeader("X-GitHub-Api-Version", equalTo("2022-11-28"))
            .willReturn(aResponse()
                .withStatus(200)
                .withHeader("Content-Type", "application/json")
                .withBody("""
                    {
                    "id": 12345,
                    "login": "TEST_LOGIN",
                    "name": "test user",
                    "email": "test@example.com",
                    "avatar_url": "https://avatars.githubusercontent.com/u/1?v=4"
                    }
                """)));

        // when
        ProviderUser u = providerPort.getUserData("user-token");

        // then
        assertThat(u.login()).isEqualTo("TEST_LOGIN");
        assertThat(u.name()).isEqualTo("test user");
        assertThat(u.email()).isEqualTo("test@example.com");
        assertThat(u.avatar_url()).contains("https://");
    }


    @Test
    @DisplayName("should return repos when GitHub responds 200")
    void should_return_repos_when_200() {
        // given
        wireMock.stubFor(WireMock.get(urlPathEqualTo("/user/repos"))
            .withHeader("Authorization", equalTo("Bearer fake-token-123"))
            .willReturn(aResponse()
                .withStatus(200)
                .withHeader("Content-Type", "application/json")
                .withBody("""
                    [
                      {"id": 1, "name": "alpha", "description": "test1"},
                      {"id": 2, "name": "beta",  "description": "test2"}
                    ]
                """)));

        // when
        List<ProviderRepo> repos = providerPort.getUserRepos("fake-token-123");

        // then
        assertThat(repos).hasSize(2);
        assertThat(repos.get(0).name()).isEqualTo("alpha");
        assertThat(repos.get(0).description()).isEqualTo("test1");
        assertThat(repos.get(1).name()).isEqualTo("beta");
        assertThat(repos.get(1).description()).isEqualTo("test2");

        // verify header & endpoint
        wireMock.verify(getRequestedFor(urlPathEqualTo("/user/repos"))
            .withHeader("Authorization", matching("(?i)Bearer\\s+fake-token-123|token\\s+fake-token-123")));
    }

    @Test
    @DisplayName("should post correct form body and headers and return token when exchanging code")
    void should_post_correct_form_and_return_token_when_exchanging_code() {
        // given
        wireMock.stubFor(WireMock.post(WireMock.urlEqualTo("/login/oauth/access_token"))
            .withHeader("Content-Type", equalTo("application/x-www-form-urlencoded"))
            .withHeader("Accept", equalTo("application/json"))
            .withHeader("User-Agent", equalTo("test-agent"))
            .withRequestBody(WireMock.containing("client_id=test-client-id"))
            .withRequestBody(WireMock.containing("client_secret=test-client-secret"))
            .withRequestBody(WireMock.containing("code=abc123"))
            .withRequestBody(WireMock.containing("redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fcallback"))
            .willReturn(aResponse()
                .withStatus(200)
                .withHeader("Content-Type", "application/json")
                .withBody("{\"access_token\":\"atk-1\",\"token_type\":\"bearer\"}")));

        // when
        String token = providerPort.exchangeCodeForAccessToken("abc123");

        // then
        assertThat(token).isEqualTo("atk-1");

        wireMock.verify(WireMock.postRequestedFor(urlPathEqualTo("/login/oauth/access_token"))
            .withHeader("User-Agent", equalTo("test-agent")));
    }

    @Test
    @DisplayName("should map 400 OAuth error to GithubAuthenticationException when exchanging code")
    void should_map_400_oauth_error_to_auth_exception_when_exchanging_code() {
        // given
        wireMock.stubFor(WireMock.post(WireMock.urlEqualTo("/login/oauth/access_token"))
            .willReturn(aResponse()
                .withStatus(400)
                .withHeader("Content-Type", "application/json")
                .withBody("{\"error\":\"bad_verification_code\"}")));

        // when / then
        assertThatThrownBy(() -> providerPort.exchangeCodeForAccessToken("bad-code"))
            .isInstanceOf(GithubAuthenticationException.class)
            .hasMessageContaining("Failed to exchange");
    }


    @Test
    @DisplayName("should throw domain exception when GitHub responds 401")
    void should_throw_when_401() {
        // given
        wireMock.stubFor(WireMock.get(urlPathEqualTo("/user/repos"))
            .willReturn(aResponse()
                .withStatus(401)
                .withHeader("Content-Type", "application/json")
                .withBody("{\"message\":\"Bad credentials\"}")));

        // when / then
        assertThatThrownBy(() -> providerPort.getUserRepos("bad-token"))
            .isInstanceOf(GithubAuthenticationException.class) 
            .hasMessageContaining("401");
    }

    @Test
    @DisplayName("should throw parse exception when JSON is invalid")
    void should_throw_parse_exception_when_invalid_json() {
        // given
        wireMock.stubFor(WireMock.get(urlPathEqualTo("/user/repos"))
            .willReturn(aResponse()
                .withStatus(200)
                .withHeader("Content-Type", "application/json")
                .withBody("{ not-json: oops }")));

        // when / then
        assertThatThrownBy(() -> providerPort.getUserRepos("token"))
            .isInstanceOf(RuntimeException.class) 
            .hasMessageContaining("Failed to parse GitHub API response");
    }

    @Test
    @DisplayName("should send exact query params and required headers when fetching user repos")
    void should_send_query_and_headers_when_fetching_user_repos() {
        // given
        wireMock.stubFor(WireMock.get(urlPathEqualTo("/user/repos"))
            .withQueryParam("sort", equalTo("updated"))
            .withQueryParam("direction", equalTo("desc"))
            .withQueryParam("per_page", equalTo("100"))
            .withHeader("Authorization", equalTo("Bearer token-1"))
            .withHeader("Accept", equalTo("application/vnd.github+json"))
            .withHeader("X-GitHub-Api-Version", equalTo("2022-11-28"))
            .willReturn(aResponse()
                .withStatus(200)
                .withHeader("Content-Type", "application/json")
                .withBody("[]")));

        // when
        List<ProviderRepo> repos = providerPort.getUserRepos("token-1");

        // then
        assertThat(repos).isEmpty();

        // verify
        wireMock.verify(getRequestedFor(urlPathEqualTo("/user/repos"))
            .withQueryParam("sort", equalTo("updated"))
            .withQueryParam("direction", equalTo("desc"))
            .withQueryParam("per_page", equalTo("100"))
            .withHeader("Authorization", equalTo("Bearer token-1"))
            .withHeader("Accept", equalTo("application/vnd.github+json"))
            .withHeader("X-GitHub-Api-Version", equalTo("2022-11-28")));
    }


    @Test
    @DisplayName("should map 403 rate limit to GithubAuthenticationException when fetching user repos")
    void should_map_403_rate_limit_to_auth_exception_when_fetching_user_repos() {
        // given
        wireMock.stubFor(WireMock.get(urlPathEqualTo("/user/repos"))
            .willReturn(aResponse()
                .withStatus(403)
                .withHeader("Content-Type", "application/json")
                .withHeader("X-RateLimit-Remaining", "0")
                .withBody("{\"message\":\"API rate limit exceeded\"}")));

        // when / then
        assertThatThrownBy(() -> providerPort.getUserRepos("token"))
            .isInstanceOf(GithubAuthenticationException.class)
            .hasMessageContaining("403")
            .hasMessageContaining("rate limit");
    }
}
