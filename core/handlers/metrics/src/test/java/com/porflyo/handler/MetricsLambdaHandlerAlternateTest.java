package com.porflyo.handler;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
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
import com.porflyo.dto.EnhancedPortfolioMetricsBundle;
import com.porflyo.dto.EnhancedPortfolioMetricsSnapshot;
import com.porflyo.dto.response.BootstrapResponseDto;
import com.porflyo.dto.response.MonthResponseDto;
import com.porflyo.dto.response.TodayResponseDto;
import com.porflyo.mapper.BootstrapResponseMapper;
import com.porflyo.mapper.MonthResponseMapper;
import com.porflyo.mapper.TodayResponseMapper;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.user.UserClaims;
import com.porflyo.usecase.AuthUseCase;
import com.porflyo.usecase.MetricsUseCase;

import io.micronaut.json.JsonMapper;

@ExtendWith(MockitoExtension.class)
@DisplayName("Metrics Lambda Handler Simple Tests")
class MetricsLambdaHandlerSimpleTest {

    @Mock
    private JsonMapper jsonMapper;
    @Mock
    private BootstrapResponseMapper bootstrapMapper;
    @Mock
    private TodayResponseMapper todayMapper;
    @Mock
    private MonthResponseMapper monthMapper;
    @Mock
    private MetricsUseCase metricsUseCase;
    @Mock
    private AuthUseCase authUseCase;

    private MetricsLambdaHandler handler;

    private final String USER_ID = "user-123";
    private final String SESSION_TOKEN = "session-token";

    private APIGatewayV2HTTPEvent event;
    private APIGatewayV2HTTPEvent.RequestContext requestContext;
    private APIGatewayV2HTTPEvent.RequestContext.Http http;

    @BeforeEach
    void setUp() {
        handler = new MetricsLambdaHandler(
            jsonMapper, bootstrapMapper, todayMapper, monthMapper, 
            metricsUseCase, authUseCase
        );
        
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
        given(event.getQueryStringParameters()).willReturn(Map.of(
            "portfolioId", "test-portfolio",
            "months", "3"
        ));
        given(event.getRawPath()).willReturn("/metrics/bootstrap");
    }
    
    private void setupAuthMocks() {
        UserClaims claims = mock(UserClaims.class);
        given(claims.getSub()).willReturn(USER_ID);
        given(authUseCase.extractClaims(SESSION_TOKEN)).willReturn(claims);
    }

    @Test
    @DisplayName("should_processBootstrapRequest_successfully")
    void should_processBootstrapRequest_successfully() throws Exception {
        // given
        String expectedJson = "{\"success\": true}";
        BootstrapResponseDto responseDto = mock(BootstrapResponseDto.class);
        EnhancedPortfolioMetricsBundle bundle = mock(EnhancedPortfolioMetricsBundle.class);
        
        given(http.getMethod()).willReturn("GET");
        given(metricsUseCase.getPortfolioMetricsWithSlots(any(PortfolioId.class), any(Integer.class)))
            .willReturn(bundle);
        given(bootstrapMapper.map(any(), any())).willReturn(responseDto);
        given(jsonMapper.writeValueAsString(responseDto)).willReturn(expectedJson);

        // when
        APIGatewayV2HTTPResponse response = handler.handleMetricsRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo(expectedJson);
        assertThat(response.getHeaders().get("Content-Type")).isEqualTo("application/json");
    }

    @Test
    @DisplayName("should_processTodayRequest_successfully")
    void should_processTodayRequest_successfully() throws Exception {
        // given
        String expectedJson = "{\"success\": true}";
        TodayResponseDto responseDto = mock(TodayResponseDto.class);
        EnhancedPortfolioMetricsSnapshot snapshot = mock(EnhancedPortfolioMetricsSnapshot.class);
        
        given(http.getMethod()).willReturn("GET");
        given(event.getRawPath()).willReturn("/metrics/today");
        given(metricsUseCase.getTodayMetricsWithDetails(any(PortfolioId.class)))
            .willReturn(snapshot);
        given(todayMapper.map(any())).willReturn(responseDto);
        given(jsonMapper.writeValueAsString(responseDto)).willReturn(expectedJson);

        // when
        APIGatewayV2HTTPResponse response = handler.handleMetricsRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo(expectedJson);
    }

    @Test
    @DisplayName("should_return401_when_authenticationFails")
    void should_return401_when_authenticationFails() {
        // given
        given(http.getMethod()).willReturn("GET");
        given(authUseCase.extractClaims(SESSION_TOKEN))
            .willThrow(new RuntimeException("Invalid token"));

        // when
        APIGatewayV2HTTPResponse response = handler.handleMetricsRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(500);
        assertThat(response.getBody()).contains("Internal server error");
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
}