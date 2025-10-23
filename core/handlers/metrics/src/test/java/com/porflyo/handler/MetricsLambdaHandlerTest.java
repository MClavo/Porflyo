package com.porflyo.handler;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;

import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.mapper.BootstrapResponseMapper;
import com.porflyo.mapper.MonthResponseMapper;
import com.porflyo.mapper.TodayResponseMapper;
import com.porflyo.model.user.UserClaims;
import com.porflyo.usecase.AuthUseCase;
import com.porflyo.usecase.MetricsUseCase;

import io.micronaut.json.JsonMapper;

@ExtendWith(MockitoExtension.class)
@DisplayName("Metrics Lambda Handler Basic Tests")
class MetricsLambdaHandlerTest {

    @Mock private JsonMapper jsonMapper;
    @Mock private BootstrapResponseMapper bootstrapMapper;
    @Mock private TodayResponseMapper todayMapper;
    @Mock private MonthResponseMapper monthMapper;
    @Mock private MetricsUseCase metricsUseCase;
    @Mock private AuthUseCase authUseCase;

    private MetricsLambdaHandler handler;

    private final String USER_ID = "user-123";
    private final String SESSION_TOKEN = "session-token";

    private APIGatewayV2HTTPEvent event;
    private APIGatewayV2HTTPEvent.RequestContext requestContext;
    private APIGatewayV2HTTPEvent.RequestContext.Http http;

    @BeforeEach
    void setUp() {
        handler = new MetricsLambdaHandler(jsonMapper, bootstrapMapper, todayMapper, monthMapper, metricsUseCase);

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
        given(event.getQueryStringParameters()).willReturn(Map.of("portfolioId", "test-portfolio", "months", "3"));
        given(event.getRawPath()).willReturn("/metrics/bootstrap");
    }

    private void setupAuthMocks() {
        UserClaims claims = mock(UserClaims.class);
        given(claims.getSub()).willReturn(USER_ID);
        given(authUseCase.extractClaims(SESSION_TOKEN)).willReturn(claims);
    }

    @Test
    @DisplayName("should_create_handler_successfully")
    void should_create_handler_successfully() {
        // then
        assertThat(handler).isNotNull();
    }

    @Test
    @DisplayName("should_return405_when_methodNotAllowed")
    void should_return405_when_methodNotAllowed() {
        // given
        given(http.getMethod()).willReturn("POST");

        // when
        APIGatewayV2HTTPResponse response = handler.handleMetricsRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(405);
        assertThat(response.getBody()).contains("Method not allowed");
    }

    @Test
    @DisplayName("should_return404_when_unknownEndpoint")
    void should_return404_when_unknownEndpoint() {
        // given
        given(http.getMethod()).willReturn("GET");
        given(event.getRawPath()).willReturn("/metrics/unknown");

        // when
        APIGatewayV2HTTPResponse response = handler.handleMetricsRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(404);
        assertThat(response.getBody()).contains("Metrics endpoint not found");
    }

    @Test
    @DisplayName("should_handle_bootstrapEndpoint_routing")
    void should_handle_bootstrapEndpoint_routing() {
        // given
        given(http.getMethod()).willReturn("GET");
        given(event.getRawPath()).willReturn("/metrics/bootstrap");

        // when
        APIGatewayV2HTTPResponse response = handler.handleMetricsRequest(event);

        // then - Should attempt to process, not return 404
        assertThat(response.getStatusCode()).isNotEqualTo(404);
    }

    @Test
    @DisplayName("should_handle_todayEndpoint_routing")
    void should_handle_todayEndpoint_routing() {
        // given
        given(http.getMethod()).willReturn("GET");
        given(event.getRawPath()).willReturn("/metrics/today");

        // when
        APIGatewayV2HTTPResponse response = handler.handleMetricsRequest(event);

        // then - Should attempt to process, not return 404
        assertThat(response.getStatusCode()).isNotEqualTo(404);
    }

    @Test
    @DisplayName("should_handle_monthEndpoint_routing")
    void should_handle_monthEndpoint_routing() {
        // given
        given(http.getMethod()).willReturn("GET");
        given(event.getRawPath()).willReturn("/metrics/month");

        // when
        APIGatewayV2HTTPResponse response = handler.handleMetricsRequest(event);

        // then - Should attempt to process, not return 404
        assertThat(response.getStatusCode()).isNotEqualTo(404);
    }
}