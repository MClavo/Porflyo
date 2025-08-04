package com.porflyo.infrastructure.adapters.input.lambda.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.porflyo.application.ports.input.UserUseCase;
import com.porflyo.application.ports.output.JwtPort;
import com.porflyo.domain.model.UserClaims;
import com.porflyo.domain.model.shared.EntityId;
import com.porflyo.domain.model.user.User;
import com.porflyo.infrastructure.adapters.input.lambda.api.dto.PublicUserDto;
import com.porflyo.testing.data.TestData;

import io.micronaut.core.type.Argument;
import io.micronaut.json.JsonMapper;

class UserLambdaHandlerTest {

    @Mock
    private UserUseCase userService;
    @Mock
    private JwtPort jwtService;
    @Mock
    private UserClaims claims;
    private JsonMapper jsonMapper;
    private UserLambdaHandler handler;

    // Shared test data
    private final String cookie = TestData.DEFAULT_JWT_TOKEN;
    private final EntityId userId = TestData.DEFAULT_USER.id();
    private final User user = TestData.DEFAULT_USER;
    private final PublicUserDto dto = PublicUserDto.from(TestData.DEFAULT_USER);

    @BeforeEach
    void setUp() {
        userService = mock(UserUseCase.class);
        jwtService = mock(JwtPort.class);
        claims = mock(UserClaims.class);
        jsonMapper = mock(JsonMapper.class);
        handler = new UserLambdaHandler(jsonMapper, userService, jwtService);
        
        // Configure the claims mock to return the expected userId
        when(claims.getSub()).thenReturn(userId.value());
    }

    @Nested
    @DisplayName("handleUserRequest")
    class HandleUserRequest {

        @Test
        @DisplayName("should return 200 OK when user is found")
        void shouldReturnUser() throws Exception {
            var request = new APIGatewayV2HTTPEvent();
            Map<String, String> headers = new HashMap<>();
            headers.put("Cookie", "session=" + cookie);
            request.setHeaders(headers);
            request.setRawPath("/api/user/get");

            when(jwtService.extractClaims(cookie)).thenReturn(claims);
            when(userService.findById(userId)).thenReturn(Optional.of(user));
            when(jsonMapper.writeValueAsString(dto)).thenReturn("{\"name\":\"Test User\"}");


            var response = handler.handleUserRequest(request);

            assertEquals(200, response.getStatusCode());
            assertTrue(response.getBody().contains("Test User"));
        }

        @Test
        @DisplayName("should return 204 No Content when user is deleted")
        void shouldDeleteUser() {
            var request = new APIGatewayV2HTTPEvent();
            Map<String, String> headers = new HashMap<>();
            headers.put("Cookie", "session=" + cookie);
            request.setHeaders(headers);
            request.setRawPath("/api/user/delete");

            when(jwtService.extractClaims(cookie)).thenReturn(claims);

            var response = handler.handleUserRequest(request);

            verify(userService).delete(userId);
            assertEquals(204, response.getStatusCode());
        }

        @Test
        @DisplayName("should return 400 if patch throws exception")
        void shouldReturnBadRequestOnPatchError() throws Exception {
            var body = "{\"description\":\"updated\"}";
            var request = new APIGatewayV2HTTPEvent();
            Map<String, String> headers = new HashMap<>();
            headers.put("Cookie", "session=" + cookie);
            request.setHeaders(headers);
            request.setRawPath("/api/user/patch");
            request.setBody(body);

            when(jwtService.extractClaims(cookie)).thenReturn(claims);
            when(jsonMapper.readValue(eq(body), any(Argument.class)))
                .thenThrow(new RuntimeException("parse error"));

            var response = handler.handleUserRequest(request);

            assertEquals(400, response.getStatusCode());
        }

        @Test
        @DisplayName("should return 404 for invalid path")
        void shouldReturnNotFoundForInvalidPath() {
            var request = new APIGatewayV2HTTPEvent();
            Map<String, String> headers = new HashMap<>();
            headers.put("Cookie", "session=" + cookie);
            request.setHeaders(headers);
            request.setRawPath("/api/user/invalid");

            when(jwtService.extractClaims(cookie)).thenReturn(claims);

            var response = handler.handleUserRequest(request);

            assertEquals(404, response.getStatusCode());
        }
    }
}
