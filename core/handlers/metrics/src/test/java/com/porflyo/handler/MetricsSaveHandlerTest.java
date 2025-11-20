package com.porflyo.handler;

import static com.porflyo.handler.data.MetricsTestData.ALTERNATIVE_PORTFOLIO_ID;
import static com.porflyo.handler.data.MetricsTestData.EXPECTED_ACTIVE_TIME;
import static com.porflyo.handler.data.MetricsTestData.EXPECTED_CODE_VIEWS;
import static com.porflyo.handler.data.MetricsTestData.EXPECTED_DESKTOP_VIEWS;
import static com.porflyo.handler.data.MetricsTestData.EXPECTED_EMAIL_COPIES;
import static com.porflyo.handler.data.MetricsTestData.EXPECTED_EXPOSURES;
import static com.porflyo.handler.data.MetricsTestData.EXPECTED_LIVE_VIEWS;
import static com.porflyo.handler.data.MetricsTestData.EXPECTED_MOBILE_VIEWS;
import static com.porflyo.handler.data.MetricsTestData.EXPECTED_SCROLL_SCORE;
import static com.porflyo.handler.data.MetricsTestData.EXPECTED_SCROLL_TIME;
import static com.porflyo.handler.data.MetricsTestData.EXPECTED_SOCIAL_CLICKS;
import static com.porflyo.handler.data.MetricsTestData.EXPECTED_VIEW_TIME;
import static com.porflyo.handler.data.MetricsTestData.INVALID_JSON_BODY;
import static com.porflyo.handler.data.MetricsTestData.MISMATCHED_PORTFOLIO_REQUEST_BODY;
import static com.porflyo.handler.data.MetricsTestData.MOBILE_METRICS_REQUEST_BODY;
import static com.porflyo.handler.data.MetricsTestData.VALID_METRICS_REQUEST_BODY;
import static com.porflyo.handler.data.MetricsTestData.VALID_PORTFOLIO_ID;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.dto.HeatmapSnapshot;
import com.porflyo.mapper.MetricsSaveRequestMapper;
import com.porflyo.mapper.MetricsResponseMapper;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.metrics.Engagement;
import com.porflyo.model.metrics.InteractionMetrics;
import com.porflyo.model.metrics.ProjectMetrics;
import com.porflyo.usecase.MetricsUseCase;

import io.micronaut.json.JsonMapper;
import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import jakarta.inject.Inject;

@MicronautTest(environments = "test")
@ExtendWith(MockitoExtension.class)
@DisplayName("Metrics Save Handler Tests")
class MetricsSaveHandlerTest {

    @Inject
    JsonMapper jsonMapper;

    @Inject
    MetricsSaveRequestMapper metricsSaveMapper;

    @Inject
    MetricsResponseMapper metricsResponseMapper;

    private MetricsUseCase metricsUseCase;
    private MetricsLambdaHandler handler;

    @BeforeEach
    void setUp() {
        metricsUseCase = mock(MetricsUseCase.class);
        handler = new MetricsLambdaHandler(jsonMapper, metricsSaveMapper, metricsResponseMapper, metricsUseCase);
    }

    @Test
    @DisplayName("should save metrics successfully when valid request")
    void should_save_metrics_successfully_when_valid_request() {
        // given
        APIGatewayV2HTTPEvent event = createEvent("POST", VALID_PORTFOLIO_ID, VALID_METRICS_REQUEST_BODY);

        // when
        APIGatewayV2HTTPResponse response = handler.handleMetricsRequest(event);

        // then
        assertEquals(200, response.getStatusCode());
        assertTrue(response.getBody().contains("Metrics saved successfully"));

        verify(metricsUseCase, times(1)).saveTodayPortfolioMetrics(
            any(PortfolioId.class),
            any(Engagement.class),
            any(InteractionMetrics.class),
            any(ProjectMetrics.class)
        );

        verify(metricsUseCase, times(1)).saveTodayDetailSlot(
            any(PortfolioId.class),
            any(HeatmapSnapshot.class),
            anyList()
        );
    }

    @Test
    @DisplayName("should map values correctly when saving metrics")
    void should_map_values_correctly_when_saving_metrics() {
        // given
        APIGatewayV2HTTPEvent event = createEvent("POST", VALID_PORTFOLIO_ID, MOBILE_METRICS_REQUEST_BODY);

        // when
        APIGatewayV2HTTPResponse response = handler.handleMetricsRequest(event);

        // then
        assertEquals(200, response.getStatusCode());

        ArgumentCaptor<Engagement> engagementCaptor = ArgumentCaptor.forClass(Engagement.class);
        verify(metricsUseCase).saveTodayPortfolioMetrics(
            any(PortfolioId.class),
            engagementCaptor.capture(),
            any(InteractionMetrics.class),
            any(ProjectMetrics.class)
        );

        Engagement engagement = engagementCaptor.getValue();
        assertEquals(EXPECTED_ACTIVE_TIME, engagement.activeTime());
        assertEquals(EXPECTED_EMAIL_COPIES, engagement.emailCopies());
        assertEquals(EXPECTED_SOCIAL_CLICKS, engagement.socialClicks());
        assertEquals(EXPECTED_DESKTOP_VIEWS, engagement.devices().desktopViews());
        assertEquals(EXPECTED_MOBILE_VIEWS, engagement.devices().mobileTabletViews());

        ArgumentCaptor<InteractionMetrics> scrollCaptor = ArgumentCaptor.forClass(InteractionMetrics.class);
        verify(metricsUseCase).saveTodayPortfolioMetrics(
            any(PortfolioId.class),
            any(Engagement.class),
            scrollCaptor.capture(),
            any(ProjectMetrics.class)
        );

        InteractionMetrics scroll = scrollCaptor.getValue();
        assertEquals(EXPECTED_SCROLL_SCORE, scroll.scoreTotal());
        assertEquals(EXPECTED_SCROLL_TIME, scroll.scrollTimeTotal());

        ArgumentCaptor<ProjectMetrics> projectMetricsCaptor = ArgumentCaptor.forClass(ProjectMetrics.class);
        verify(metricsUseCase).saveTodayPortfolioMetrics(
            any(PortfolioId.class),
            any(Engagement.class),
            any(InteractionMetrics.class),
            projectMetricsCaptor.capture()
        );

        ProjectMetrics cumProjects = projectMetricsCaptor.getValue();
        assertEquals(EXPECTED_VIEW_TIME, cumProjects.viewTime());
        assertEquals(EXPECTED_EXPOSURES, cumProjects.exposures());
        assertEquals(EXPECTED_CODE_VIEWS, cumProjects.codeViews());
        assertEquals(EXPECTED_LIVE_VIEWS, cumProjects.liveViews());
    }

    @Test
    @DisplayName("should return 400 when portfolio id mismatch")
    void should_return_400_when_portfolio_id_mismatch() {
        // given
        APIGatewayV2HTTPEvent event = createEvent("POST", ALTERNATIVE_PORTFOLIO_ID, MISMATCHED_PORTFOLIO_REQUEST_BODY);

        // when
        APIGatewayV2HTTPResponse response = handler.handleMetricsRequest(event);

        // then
        assertEquals(400, response.getStatusCode());
        assertTrue(response.getBody().contains("Portfolio ID mismatch"));
        
        verify(metricsUseCase, never()).saveTodayPortfolioMetrics(any(), any(), any(), any());
        verify(metricsUseCase, never()).saveTodayDetailSlot(any(), any(), any());
    }

    @Test
    @DisplayName("should return 400 when invalid json body")
    void should_return_400_when_invalid_json_body() {
        // given
        APIGatewayV2HTTPEvent event = createEvent("POST", VALID_PORTFOLIO_ID, INVALID_JSON_BODY);

        // when
        APIGatewayV2HTTPResponse response = handler.handleMetricsRequest(event);

        // then
        assertEquals(400, response.getStatusCode());
        assertTrue(response.getBody().contains("Invalid request body"));
        
        verify(metricsUseCase, never()).saveTodayPortfolioMetrics(any(), any(), any(), any());
        verify(metricsUseCase, never()).saveTodayDetailSlot(any(), any(), any());
    }

    @Test
    @DisplayName("should return 405 when unsupported http method")
    void should_return_405_when_unsupported_http_method() {
        // given
        APIGatewayV2HTTPEvent event = createEvent("DELETE", VALID_PORTFOLIO_ID, null);

        // when
        APIGatewayV2HTTPResponse response = handler.handleMetricsRequest(event);

        // then
        assertEquals(405, response.getStatusCode());
        assertTrue(response.getBody().contains("Method Not Allowed"));
        
        verify(metricsUseCase, never()).saveTodayPortfolioMetrics(any(), any(), any(), any());
        verify(metricsUseCase, never()).saveTodayDetailSlot(any(), any(), any());
    }

    // Helper methods

    private APIGatewayV2HTTPEvent createEvent(String method, String portfolioId, String body) {
        APIGatewayV2HTTPEvent event = new APIGatewayV2HTTPEvent();
        
        APIGatewayV2HTTPEvent.RequestContext requestContext = new APIGatewayV2HTTPEvent.RequestContext();
        APIGatewayV2HTTPEvent.RequestContext.Http http = new APIGatewayV2HTTPEvent.RequestContext.Http();
        http.setMethod(method);
        requestContext.setHttp(http);
        event.setRequestContext(requestContext);

        event.setRawPath("/metrics/" + portfolioId);
        
        event.setBody(body);
        
        return event;
    }
}
