package com.porflyo.handler;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.BDDMockito.willThrow;

import java.io.IOException;
import java.net.URI;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.dto.PublicUserDto;
import com.porflyo.dto.UserPatchDto;
import com.porflyo.mapper.PublicUserDtoMapper;
import com.porflyo.model.ids.ProviderUserId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.user.ProviderAccount;
import com.porflyo.model.user.User;
import com.porflyo.model.user.UserClaims;
import com.porflyo.ports.input.AuthUseCase;
import com.porflyo.ports.input.UserUseCase;

import io.micronaut.core.type.Argument;
import io.micronaut.json.JsonMapper;

@ExtendWith(MockitoExtension.class)
class UserLambdaHandlerTest {

    @Mock
    private JsonMapper jsonMapper;

    @Mock
    private PublicUserDtoMapper publicUserDtoMapper;

    @Mock
    private UserUseCase userUseCase;

    @Mock
    private AuthUseCase authUseCase;

    private UserLambdaHandler handler;

    @BeforeEach
    void setUp() {
        handler = new UserLambdaHandler(jsonMapper, publicUserDtoMapper, userUseCase, authUseCase);
    }

    @Test
    void should_returnUserData_when_getUserRequest() throws Exception {
        // given
        String userId = "user-123";
        String sessionCookie = "valid-session-token";
        UserClaims userClaims = new UserClaims(userId, Instant.now(), Instant.now().plusSeconds(3600));
        
        User user = createSampleUser(userId);
        PublicUserDto userDto = createSampleUserDto();
        String expectedJson = "{\"name\":\"Test User\",\"email\":\"test@example.com\"}";
        
        APIGatewayV2HTTPEvent event = createEventWithPathAndCookie("get", sessionCookie);
        
        given(authUseCase.extractClaims(sessionCookie)).willReturn(userClaims);
        given(userUseCase.findById(new UserId(userId))).willReturn(Optional.of(user));
        given(publicUserDtoMapper.toDto(user)).willReturn(userDto);
        given(jsonMapper.writeValueAsString(userDto)).willReturn(expectedJson);

        // when
        APIGatewayV2HTTPResponse response = handler.handleUserRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo(expectedJson);
        then(userUseCase).should().findById(new UserId(userId));
        then(publicUserDtoMapper).should().toDto(user);
    }

    @Test
    void should_returnNotFound_when_userDoesNotExist() {
        // given
        String userId = "user-123";
        String sessionCookie = "valid-session-token";
        UserClaims userClaims = new UserClaims(userId, Instant.now(), Instant.now().plusSeconds(3600));
        
        APIGatewayV2HTTPEvent event = createEventWithPathAndCookie("get", sessionCookie);
        
        given(authUseCase.extractClaims(sessionCookie)).willReturn(userClaims);
        given(userUseCase.findById(new UserId(userId))).willReturn(Optional.empty());

        // when
        APIGatewayV2HTTPResponse response = handler.handleUserRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(404);
        assertThat(response.getBody()).isEqualTo("{\"error\": \"User not found\"}");
    }

    @Test
    @SuppressWarnings("unchecked")
    void should_patchUserSuccessfully_when_validPatchRequest() throws Exception {
        // given
        String userId = "user-123";
        String sessionCookie = "valid-session-token";
        String requestBody = "{\"name\":\"Updated Name\",\"email\":\"updated@example.com\"}";
        
        UserClaims userClaims = new UserClaims(userId, Instant.now(), Instant.now().plusSeconds(3600));
        User updatedUser = createSampleUser(userId);
        PublicUserDto userDto = createSampleUserDto();
        String expectedJson = "{\"name\":\"Updated Name\",\"email\":\"updated@example.com\"}";
        
        Map<String, Object> attributes = Map.of(
            "name", "Updated Name",
            "email", "updated@example.com"
        );
        
        APIGatewayV2HTTPEvent event = createEventWithPathBodyAndCookie("patch", requestBody, sessionCookie);
        
        given(authUseCase.extractClaims(sessionCookie)).willReturn(userClaims);
        given(jsonMapper.readValue(eq(requestBody), any(Argument.class))).willReturn(attributes);
        given(userUseCase.patch(eq(new UserId(userId)), any(UserPatchDto.class))).willReturn(updatedUser);
        given(publicUserDtoMapper.toDto(updatedUser)).willReturn(userDto);
        given(jsonMapper.writeValueAsString(userDto)).willReturn(expectedJson);

        // when
        APIGatewayV2HTTPResponse response = handler.handleUserRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo(expectedJson);
        then(userUseCase).should().patch(eq(new UserId(userId)), any(UserPatchDto.class));
    }

    @Test
    void should_deleteUserSuccessfully_when_validDeleteRequest() {
        // given
        String userId = "user-123";
        String sessionCookie = "valid-session-token";
        UserClaims userClaims = new UserClaims(userId, Instant.now(), Instant.now().plusSeconds(3600));
        
        APIGatewayV2HTTPEvent event = createEventWithPathAndCookie("delete", sessionCookie);
        
        given(authUseCase.extractClaims(sessionCookie)).willReturn(userClaims);

        // when
        APIGatewayV2HTTPResponse response = handler.handleUserRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(204);
        then(userUseCase).should().delete(new UserId(userId));
    }

    @Test
    void should_returnNotFound_when_invalidPath() {
        // given
        String userId = "user-123";
        String sessionCookie = "valid-session-token";
        UserClaims userClaims = new UserClaims(userId, Instant.now(), Instant.now().plusSeconds(3600));
        
        APIGatewayV2HTTPEvent event = createEventWithPathAndCookie("invalid", sessionCookie);
        
        given(authUseCase.extractClaims(sessionCookie)).willReturn(userClaims);

        // when
        APIGatewayV2HTTPResponse response = handler.handleUserRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(404);
        assertThat(response.getBody()).isEqualTo("{\"error\": \"Not Found\"}");
    }

    @Test
    void should_returnInternalServerError_when_jsonSerializationFails() throws Exception {
        // given
        String userId = "user-123";
        String sessionCookie = "valid-session-token";
        UserClaims userClaims = new UserClaims(userId, Instant.now(), Instant.now().plusSeconds(3600));
        
        User user = createSampleUser(userId);
        PublicUserDto userDto = createSampleUserDto();
        
        APIGatewayV2HTTPEvent event = createEventWithPathAndCookie("get", sessionCookie);
        
        given(authUseCase.extractClaims(sessionCookie)).willReturn(userClaims);
        given(userUseCase.findById(new UserId(userId))).willReturn(Optional.of(user));
        given(publicUserDtoMapper.toDto(user)).willReturn(userDto);
        given(jsonMapper.writeValueAsString(userDto)).willThrow(new IOException("Serialization error"));

        // when
        APIGatewayV2HTTPResponse response = handler.handleUserRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(500);
        assertThat(response.getBody()).isEqualTo("{\"error\": \"Internal Server Error\"}");
    }

    @Test
    @SuppressWarnings("unchecked")
    void should_returnBadRequest_when_patchBodyIsInvalid() throws Exception {
        // given
        String userId = "user-123";
        String sessionCookie = "valid-session-token";
        String invalidBody = "invalid-json";
        
        UserClaims userClaims = new UserClaims(userId, Instant.now(), Instant.now().plusSeconds(3600));
        
        APIGatewayV2HTTPEvent event = createEventWithPathBodyAndCookie("patch", invalidBody, sessionCookie);
        
        given(authUseCase.extractClaims(sessionCookie)).willReturn(userClaims);
        given(jsonMapper.readValue(eq(invalidBody), any(Argument.class)))
                .willThrow(new IOException("JSON parsing error"));

        // when
        APIGatewayV2HTTPResponse response = handler.handleUserRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(400);
        assertThat(response.getBody()).isEqualTo("{\"error\": \"Bad Request\"}");
    }

    @Test
    void should_returnInternalServerError_when_deleteUserFails() {
        // given
        String userId = "user-123";
        String sessionCookie = "valid-session-token";
        UserClaims userClaims = new UserClaims(userId, Instant.now(), Instant.now().plusSeconds(3600));
        
        APIGatewayV2HTTPEvent event = createEventWithPathAndCookie("delete", sessionCookie);
        
        given(authUseCase.extractClaims(sessionCookie)).willReturn(userClaims);
        willThrow(new RuntimeException("Delete failed")).given(userUseCase).delete(new UserId(userId));

        // when
        APIGatewayV2HTTPResponse response = handler.handleUserRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(500);
        assertThat(response.getBody()).isEqualTo("{\"error\": \"Internal Server Error\"}");
    }

    private User createSampleUser(String userId) {
        ProviderAccount providerAccount = new ProviderAccount(
                ProviderAccount.Provider.GITHUB,
                new ProviderUserId("123"),
                "testuser",
                URI.create("https://github.com/testuser/avatar.jpg"),
                "access-token"
        );
        
        return new User(
                new UserId(userId),
                providerAccount,
                "Test User",
                "test@example.com", 
                "Test description",
                "profile-image.jpg",
                Map.of("twitter", "testuser")
        );
    }

    private PublicUserDto createSampleUserDto() {
        return new PublicUserDto(
                "Test User",
                "test@example.com",
                "Test description",
                URI.create("https://example.com/profile.jpg"),
                "profile-image.jpg",
                "testuser",
                URI.create("https://github.com/testuser/avatar.jpg"),
                Map.of("twitter", "testuser")
        );
    }

    private APIGatewayV2HTTPEvent createEventWithPathAndCookie(String pathSegment, String sessionCookie) {
        APIGatewayV2HTTPEvent event = new APIGatewayV2HTTPEvent();
        event.setRawPath("/api/user/" + pathSegment);
        event.setHeaders(Map.of("Cookie", "session=" + sessionCookie));
        return event;
    }

    private APIGatewayV2HTTPEvent createEventWithPathBodyAndCookie(String pathSegment, String body, String sessionCookie) {
        APIGatewayV2HTTPEvent event = createEventWithPathAndCookie(pathSegment, sessionCookie);
        event.setBody(body);
        return event;
    }
}
