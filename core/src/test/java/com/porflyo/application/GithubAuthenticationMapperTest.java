package com.porflyo.application;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.reactivestreams.Publisher;

import com.porflyo.domain.model.GithubUser;
import com.porflyo.infrastructure.github.GithubApiClient;

import io.micronaut.security.authentication.AuthenticationResponse;
import io.micronaut.security.oauth2.endpoint.token.response.TokenResponse;
import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import reactor.core.publisher.Mono;

@MicronautTest
class GithubAuthenticationMapperTest {

    private GithubApiClient githubApiClient;
    private GithubAuthenticationMapper mapper;

    @BeforeEach
    void setUp() {
        githubApiClient = mock(GithubApiClient.class);
        mapper = new GithubAuthenticationMapper(githubApiClient);
    }

    @Test
    void testSuccessfulAuthenticationResponse() {
        
        /// Simulate the process of creating an AuthenticationResponse
        // Simulate a token response
        String token = "token";
        TokenResponse tokenResponse = mock(TokenResponse.class);
        when(tokenResponse.getAccessToken()).thenReturn(token);

        // Simulate the user returned in the AuthenticationResponse
        GithubUser user = mock(GithubUser.class);
        when(user.getLogin()).thenReturn("user");

        // Simulate the user returned by the GithubApiClient
        when(githubApiClient.getUser("token " + token)).thenReturn(Mono.just(user));

        Publisher<AuthenticationResponse> result = mapper.createAuthenticationResponse(tokenResponse, null);

        // Block the Mono to get the AuthenticationResponse
        // This is necessary because the method returns a Publisher
        // and we need to wait for the asynchronous operation to complete.
        AuthenticationResponse response = Mono.from(result).block();


        /// ASSERTIONS
        assertNotNull(response);
        assertTrue(response.isAuthenticated());

        // Verify that the GithubApiClient's getUser method was called with the correct token
        verify(githubApiClient).getUser("token " + token);
    }
}
