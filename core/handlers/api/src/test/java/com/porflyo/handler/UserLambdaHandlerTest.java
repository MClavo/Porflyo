package com.porflyo.handler;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.BDDMockito.willThrow;
import static org.mockito.Mockito.mock;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.data.HandlerTestData;
import com.porflyo.data.TestData;
import com.porflyo.dto.PublicUserDto;
import com.porflyo.dto.UserPatchDto;
import com.porflyo.mapper.PublicUserDtoMapper;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.user.User;
import com.porflyo.model.user.UserClaims;
import com.porflyo.ports.input.AuthUseCase;
import com.porflyo.ports.input.UserUseCase;

import io.micronaut.core.type.Argument;
import io.micronaut.json.JsonMapper;
@ExtendWith(MockitoExtension.class)
@DisplayName("User Lambda Handler Tests")
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

    private final String USER_ID = "user-123";
    private final String SESSION_TOKEN = "session-token";
    private final String INVALID_JSON = "invalid-json";

    private User user = TestData.DEFAULT_USER;
    private PublicUserDto userDto = HandlerTestData.DEFAULT_PUBLIC_USER_DTO;

    private APIGatewayV2HTTPEvent event;
    private APIGatewayV2HTTPEvent.RequestContext requestContext;
    private APIGatewayV2HTTPEvent.RequestContext.Http http;

    @BeforeEach
    void setUp() {
    // initialize mocks manually to avoid starting Micronaut context during tests
    jsonMapper = mock(JsonMapper.class);
    publicUserDtoMapper = mock(PublicUserDtoMapper.class);
    userUseCase = mock(UserUseCase.class);
    authUseCase = mock(AuthUseCase.class);

    handler = new UserLambdaHandler(jsonMapper, publicUserDtoMapper, userUseCase, authUseCase);
        setupEventMocks();
        setupAuthMocks();
    }
    
    private void setupEventMocks() {
        event = mock(APIGatewayV2HTTPEvent.class);
        requestContext = mock(APIGatewayV2HTTPEvent.RequestContext.class);
        http = mock(APIGatewayV2HTTPEvent.RequestContext.Http.class);
        
        given(event.getRequestContext()).willReturn(requestContext);
        given(requestContext.getHttp()).willReturn(http);
        given(event.getHeaders()).willReturn(Map.of("Cookie", "session=" + SESSION_TOKEN));
    }
    
    private void setupAuthMocks() {
        UserClaims claims = mock(UserClaims.class);
        given(claims.getSub()).willReturn(USER_ID);
        given(authUseCase.extractClaims(SESSION_TOKEN)).willReturn(claims);
    }

    @Test
    void should_returnUserData_when_getUserRequest() throws Exception {
        // given
        String expectedJson = "{\"name\":\"Test User\",\"email\":\"test@example.com\"}";
        
        given(http.getMethod()).willReturn("GET");
        given(userUseCase.findById(new UserId(USER_ID))).willReturn(Optional.of(user));
        given(publicUserDtoMapper.toDto(user)).willReturn(userDto);
        given(jsonMapper.writeValueAsString(userDto)).willReturn(expectedJson);

        // when
        APIGatewayV2HTTPResponse response = handler.handleUserRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo(expectedJson);
        then(userUseCase).should().findById(new UserId(USER_ID));
        then(publicUserDtoMapper).should().toDto(user);
    }

    @Test
    void should_returnNotFound_when_userDoesNotExist() {
        // given
        given(http.getMethod()).willReturn("GET");
        given(userUseCase.findById(new UserId(USER_ID))).willReturn(Optional.empty());

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
        String requestBody = "{\"name\":\"Updated Name\",\"email\":\"updated@example.com\"}";
        String expectedJson = "{\"name\":\"Updated Name\",\"email\":\"updated@example.com\"}";
        
        Map<String, Object> attributes = Map.of(
            "name", "Updated Name",
            "email", "updated@example.com"
        );
        
        given(http.getMethod()).willReturn("PATCH");
        given(event.getBody()).willReturn(requestBody);
        given(jsonMapper.readValue(eq(requestBody), any(Argument.class))).willReturn(attributes);
        given(userUseCase.patch(eq(new UserId(USER_ID)), any(UserPatchDto.class))).willReturn(user);
        given(publicUserDtoMapper.toDto(user)).willReturn(userDto);
        given(jsonMapper.writeValueAsString(userDto)).willReturn(expectedJson);

        // when
        APIGatewayV2HTTPResponse response = handler.handleUserRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo(expectedJson);
        then(userUseCase).should().patch(eq(new UserId(USER_ID)), any(UserPatchDto.class));
    }

    @Test
    void should_deleteUserSuccessfully_when_validDeleteRequest() {
        // given
        given(http.getMethod()).willReturn("DELETE");

        // when
        APIGatewayV2HTTPResponse response = handler.handleUserRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(204);
        then(userUseCase).should().delete(new UserId(USER_ID));
    }

    @Test
    void should_returnInternalServerError_when_jsonSerializationFails() throws Exception {
        // given
        given(http.getMethod()).willReturn("GET");
        given(userUseCase.findById(new UserId(USER_ID))).willReturn(Optional.of(user));
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
        given(http.getMethod()).willReturn("PATCH");
        given(event.getBody()).willReturn(INVALID_JSON);
        given(jsonMapper.readValue(eq(INVALID_JSON), any(Argument.class)))
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
        given(http.getMethod()).willReturn("DELETE");
        willThrow(new RuntimeException("Delete failed")).given(userUseCase).delete(new UserId(USER_ID));

        // when
        APIGatewayV2HTTPResponse response = handler.handleUserRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(500);
        assertThat(response.getBody()).isEqualTo("{\"error\": \"Internal Server Error\"}");
    }
}
