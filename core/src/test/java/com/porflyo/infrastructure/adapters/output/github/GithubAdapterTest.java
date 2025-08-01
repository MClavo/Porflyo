package com.porflyo.infrastructure.adapters.output.github;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.porflyo.domain.model.GithubRepo;
import com.porflyo.domain.model.GithubUser;
import com.porflyo.infrastructure.adapters.output.github.dto.GithubAccessTokenResponseDto;
import com.porflyo.infrastructure.adapters.output.github.dto.GithubRepoResponseDto;
import com.porflyo.infrastructure.adapters.output.github.dto.GithubUserResponseDto;
import com.porflyo.testing.data.TestData;
import com.porflyo.testing.mocks.ports.MockConfigurationPort;

import io.micronaut.json.JsonMapper;
import io.micronaut.test.extensions.junit5.annotation.MicronautTest;

@MicronautTest
@DisplayName("GithubAdapter Tests")
class GithubAdapterTest {

    private MockConfigurationPort configPort;
    @Mock private JsonMapper jsonMapper;
    @Mock private HttpClient httpClient;
    @Mock private HttpResponse<String> httpResponse;
    
    private GithubAdapter githubAdapter;

    // Sample DTOs for responses using TestData
    private static final GithubAccessTokenResponseDto ACCESS_TOKEN_DTO = 
        new GithubAccessTokenResponseDto(TestData.DEFAULT_ACCESS_TOKEN, "bearer", TestData.DEFAULT_SCOPE);
    
    private static final GithubUserResponseDto USER_DTO = 
        new GithubUserResponseDto(
            TestData.DEFAULT_USER.login(),
            TestData.DEFAULT_USER.id(),
            TestData.DEFAULT_USER.name(),
            TestData.DEFAULT_USER.email(),
            TestData.DEFAULT_USER.avatar_url()
        );
    
    private static final GithubRepoResponseDto[] REPOS_DTO_ARRAY = {
        new GithubRepoResponseDto(
            TestData.REPO_1.name(),
            TestData.REPO_1.description(),
            TestData.REPO_1.html_url()
        ),
        new GithubRepoResponseDto(
            TestData.REPO_2.name(),
            TestData.REPO_2.description(),
            TestData.REPO_2.html_url()
        )
    };

    // JSON responses for HTTP mocking using TestData
    private static final String ACCESS_TOKEN_JSON = String.format(
        """
        {"access_token":"%s","token_type":"bearer","scope":"%s"}""",
        TestData.DEFAULT_ACCESS_TOKEN, TestData.DEFAULT_SCOPE);
    
    private static final String USER_JSON = String.format(
        """
        {"login":"%s","id":"%s","name":"%s","email":"%s","avatar_url":"%s"}""",
        TestData.DEFAULT_USER.login(),
        TestData.DEFAULT_USER.id(),
        TestData.DEFAULT_USER.name(),
        TestData.DEFAULT_USER.email(),
        TestData.DEFAULT_USER.avatar_url());
    
    private static final String REPOS_JSON = String.format(
        """
        [{"name":"%s","description":"%s","html_url":"%s"},{"name":"%s","description":"%s","html_url":"%s"}]""",
        TestData.REPO_1.name(), TestData.REPO_1.description(), TestData.REPO_1.html_url(),
        TestData.REPO_2.name(), TestData.REPO_2.description(), TestData.REPO_2.html_url());

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        configPort = MockConfigurationPort.withDefaults();
        githubAdapter = new GithubAdapter(configPort, jsonMapper, httpClient);
    }

    // Helper methods for common mock setups
    private void mockSuccessfulHttpResponse(String responseBody) throws Exception {
        when(httpClient.send(any(HttpRequest.class), eq(BodyHandlers.ofString()))).thenReturn(httpResponse);
        when(httpResponse.statusCode()).thenReturn(200); // Mock successful status code
        when(httpResponse.body()).thenReturn(responseBody);
    }
    
    private void mockHttpFailure(String errorMessage) throws Exception {
        when(httpClient.send(any(HttpRequest.class), eq(BodyHandlers.ofString())))
            .thenThrow(new RuntimeException(errorMessage));
    }
    
    private void mockJsonSerialization(String result) throws Exception {
        when(jsonMapper.writeValueAsString(any())).thenReturn(result);
    }
    
    private <T> void mockJsonDeserialization(String json, T result, Class<T> clazz) throws Exception {
        when(jsonMapper.readValue(eq(json.getBytes(StandardCharsets.UTF_8)), eq(clazz)))
            .thenReturn(result);
    }

    @Nested
    @DisplayName("Exchange Code for Access Token")
    class ExchangeCodeForAccessTokenTests {

        @Test
        @DisplayName("Should successfully exchange code for access token")
        void shouldExchangeCodeForAccessToken() throws Exception {
            // Given
            String code = TestData.DEFAULT_CODE;
            String requestBodyJson = String.format(
                """
                {"client_id":"%s","client_secret":"%s","code":"%s","redirect_uri":"%s"}""",
                TestData.DEFAULT_CLIENT_ID, TestData.DEFAULT_CLIENT_SECRET, TestData.DEFAULT_CODE, TestData.DEFAULT_REDIRECT_URI);

            // Setup mocks
            mockJsonSerialization(requestBodyJson);
            mockSuccessfulHttpResponse(ACCESS_TOKEN_JSON);
            mockJsonDeserialization(ACCESS_TOKEN_JSON, ACCESS_TOKEN_DTO, GithubAccessTokenResponseDto.class);

            // When
            String accessToken = githubAdapter.exchangeCodeForAccessToken(code);

            // Then
            assertNotNull(accessToken);
            assertEquals(TestData.DEFAULT_ACCESS_TOKEN, accessToken);
            verify(httpClient).send(any(HttpRequest.class), eq(BodyHandlers.ofString()));
        }

        @Test
        @DisplayName("Should throw exception when HTTP request fails")
        void shouldThrowExceptionWhenHttpRequestFails() throws Exception {
            // Given
            mockJsonSerialization("{}");
            mockHttpFailure("Network error");

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class, 
                () -> githubAdapter.exchangeCodeForAccessToken(TestData.DEFAULT_CODE));
            assertEquals("Failed to exchange GitHub code", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when JSON serialization fails")
        void shouldThrowExceptionWhenJsonSerializationFails() throws Exception {
            // Given
            when(jsonMapper.writeValueAsString(any())).thenThrow(new RuntimeException("JSON serialization error"));

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class, 
                () -> githubAdapter.exchangeCodeForAccessToken(TestData.DEFAULT_CODE));
            assertEquals("Failed to exchange GitHub code", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("Get User Data")
    class GetUserDataTests {

        @Test
        @DisplayName("Should successfully fetch user data")
        void shouldFetchUserData() throws Exception {
            // Given
            String accessToken = TestData.DEFAULT_ACCESS_TOKEN;
            
            // Setup mocks
            mockSuccessfulHttpResponse(USER_JSON);
            mockJsonDeserialization(USER_JSON, USER_DTO, GithubUserResponseDto.class);

            // When
            GithubUser user = githubAdapter.getUserData(accessToken);

            // Then
            assertNotNull(user);
            assertEquals(TestData.DEFAULT_USER.login(), user.login());
            assertEquals(TestData.DEFAULT_USER.id(), user.id());
            assertEquals(TestData.DEFAULT_USER.name(), user.name());
            assertEquals(TestData.DEFAULT_USER.email(), user.email());
            assertEquals(TestData.DEFAULT_USER.avatar_url(), user.avatar_url());
            verify(httpClient).send(any(HttpRequest.class), eq(BodyHandlers.ofString()));
        }

        @Test
        @DisplayName("Should throw exception when user data fetch fails")
        void shouldThrowExceptionWhenUserDataFetchFails() throws Exception {
            // Given
            mockHttpFailure("API error");

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class, 
                () -> githubAdapter.getUserData(TestData.DEFAULT_ACCESS_TOKEN));
            assertEquals("Failed to fetch GitHub user data", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("Get User Repositories")
    class GetUserRepositoriesTests {

        @Test
        @DisplayName("Should successfully fetch user repositories")
        void shouldFetchUserRepositories() throws Exception {
            // Given
            String accessToken = TestData.DEFAULT_ACCESS_TOKEN;
            
            // Setup mocks
            mockSuccessfulHttpResponse(REPOS_JSON);
            mockJsonDeserialization(REPOS_JSON, REPOS_DTO_ARRAY, GithubRepoResponseDto[].class);

            // When
            List<GithubRepo> repos = githubAdapter.getUserRepos(accessToken);

            // Then
            assertNotNull(repos);
            assertEquals(2, repos.size());
            
            GithubRepo repo1 = repos.get(0);
            assertEquals(TestData.REPO_1.name(), repo1.name());
            assertEquals(TestData.REPO_1.description(), repo1.description());
            assertEquals(TestData.REPO_1.html_url(), repo1.html_url());
            
            GithubRepo repo2 = repos.get(1);
            assertEquals(TestData.REPO_2.name(), repo2.name());
            assertEquals(TestData.REPO_2.description(), repo2.description());
            assertEquals(TestData.REPO_2.html_url(), repo2.html_url());
            
            verify(httpClient).send(any(HttpRequest.class), eq(BodyHandlers.ofString()));
        }

        @Test
        @DisplayName("Should throw exception when repositories fetch fails")
        void shouldThrowExceptionWhenRepositoriesFetchFails() throws Exception {
            // Given
            mockHttpFailure("API error");

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class, 
                () -> githubAdapter.getUserRepos(TestData.DEFAULT_ACCESS_TOKEN));
            assertEquals("Failed to fetch GitHub repositories", exception.getMessage());
        }
    }
}
