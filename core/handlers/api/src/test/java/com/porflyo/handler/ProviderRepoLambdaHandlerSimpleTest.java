package com.porflyo.handler;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.provider.ProviderRepo;
import com.porflyo.model.user.UserClaims;
import com.porflyo.ports.input.AuthUseCase;
import com.porflyo.ports.input.ProviderUseCase;

import io.micronaut.json.JsonMapper;

@ExtendWith(MockitoExtension.class)
@DisplayName("Provider Repo Lambda Handler Tests")
class ProviderRepoLambdaHandlerSimpleTest {

    @Mock
    private ProviderUseCase providerUseCase;

    @Mock
    private AuthUseCase authUseCase;

    @Mock
    private JsonMapper jsonMapper;

    private ProviderRepoLambdaHandler handler;

    @BeforeEach
    void setUp() {
        handler = new ProviderRepoLambdaHandler(providerUseCase, authUseCase, jsonMapper);
    }

    @Test
    void should_returnUserRepos_when_validSessionCookie() throws Exception {
        // given
        String sessionCookie = "valid-session-token";
        String userId = "user-123";
        UserClaims userClaims = new UserClaims(userId, Instant.now(), Instant.now().plusSeconds(3600));
        
        ProviderRepo repo1 = new ProviderRepo("repo1", "Test Repo 1", "https://github.com/user/repo1");
        ProviderRepo repo2 = new ProviderRepo("repo2", "Test Repo 2", "https://github.com/user/repo2");
        List<ProviderRepo> repos = List.of(repo1, repo2);
        
        String expectedJson = "[{\"name\":\"repo1\",\"description\":\"Test Repo 1\"},{\"name\":\"repo2\",\"description\":\"Test Repo 2\"}]";
        
        APIGatewayV2HTTPEvent event = createEventWithCookie("session", sessionCookie);
        
        given(authUseCase.extractClaims(sessionCookie)).willReturn(userClaims);
        given(providerUseCase.getUserRepos(new UserId(userId))).willReturn(repos);
        given(jsonMapper.writeValueAsString(repos)).willReturn(expectedJson);

        // when
        APIGatewayV2HTTPResponse response = handler.handleUserRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo(expectedJson);
        then(authUseCase).should().extractClaims(sessionCookie);
        then(providerUseCase).should().getUserRepos(new UserId(userId));
        then(jsonMapper).should().writeValueAsString(repos);
    }

    @Test
    void should_returnUnauthorized_when_noCookiePresent() {
        // given
        APIGatewayV2HTTPEvent event = createEventWithoutCookie();

        // when
        APIGatewayV2HTTPResponse response = handler.handleUserRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(401);
        assertThat(response.getBody()).isEqualTo("{\"error\": \"Unauthorized: Invalid session\"}");
    }

    @Test
    void should_returnUnauthorized_when_invalidSessionCookie() {
        // given
        String invalidCookie = "invalid-session-token";
        APIGatewayV2HTTPEvent event = createEventWithCookie("session", invalidCookie);
        
        given(authUseCase.extractClaims(invalidCookie)).willReturn(null);

        // when
        APIGatewayV2HTTPResponse response = handler.handleUserRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(401);
        assertThat(response.getBody()).isEqualTo("{\"error\": \"Unauthorized: Invalid session\"}");
        then(authUseCase).should().extractClaims(invalidCookie);
    }

    private APIGatewayV2HTTPEvent createEventWithCookie(String cookieName, String cookieValue) {
        APIGatewayV2HTTPEvent event = new APIGatewayV2HTTPEvent();
        event.setHeaders(Map.of("Cookie", cookieName + "=" + cookieValue));
        return event;
    }

    private APIGatewayV2HTTPEvent createEventWithoutCookie() {
        APIGatewayV2HTTPEvent event = new APIGatewayV2HTTPEvent();
        // No headers set, which will cause extractCookieValue to return null
        return event;
    }
}
