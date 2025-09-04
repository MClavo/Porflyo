package com.porflyo.handler;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.mock;

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
import com.porflyo.mapper.PublicUserDtoMapper;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.user.User;
import com.porflyo.model.user.UserClaims;
import com.porflyo.ports.input.AuthUseCase;
import com.porflyo.ports.input.UserUseCase;

import io.micronaut.json.JsonMapper;

@ExtendWith(MockitoExtension.class)
@DisplayName("User Lambda Handler Tests")
class UserLambdaHandlerSimpleTest {

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

    private User user = TestData.DEFAULT_USER;
    private PublicUserDto userDto = HandlerTestData.DEFAULT_PUBLIC_USER_DTO;

    private APIGatewayV2HTTPEvent event;
    private APIGatewayV2HTTPEvent.RequestContext requestContext;
    private APIGatewayV2HTTPEvent.RequestContext.Http http;

    @BeforeEach
    void setUp() {
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
        
        setupGetRequest();
        setupUserFoundScenario(user, userDto, expectedJson);

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
        setupGetRequest();
        given(userUseCase.findById(new UserId(USER_ID))).willReturn(Optional.empty());

        // when
        APIGatewayV2HTTPResponse response = handler.handleUserRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(404);
        assertThat(response.getBody()).isEqualTo("{\"error\": \"User not found\"}");
    }

    @Test
    void should_deleteUserSuccessfully_when_validDeleteRequest() {
        // given
        setupDeleteRequest();

        // when
        APIGatewayV2HTTPResponse response = handler.handleUserRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(204);
        then(userUseCase).should().delete(new UserId(USER_ID));
    }
    
    private void setupGetRequest() {
        given(http.getMethod()).willReturn("GET");
    }
    
    private void setupDeleteRequest() {
        given(http.getMethod()).willReturn("DELETE");
    }
    
    private void setupUserFoundScenario(User user, PublicUserDto userDto, String expectedJson) throws Exception {
        given(userUseCase.findById(new UserId(USER_ID))).willReturn(Optional.of(user));
        given(publicUserDtoMapper.toDto(user)).willReturn(userDto);
        given(jsonMapper.writeValueAsString(userDto)).willReturn(expectedJson);
    }
}
