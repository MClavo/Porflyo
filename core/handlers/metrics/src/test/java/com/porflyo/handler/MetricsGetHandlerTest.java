package com.porflyo.handler;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.dto.DetailSlot;
import com.porflyo.dto.EnhancedPortfolioMetrics;
import com.porflyo.dto.EnhancedPortfolioMetricsBundle;
import com.porflyo.dto.response.DailyAggregateDto;
import com.porflyo.dto.response.MetricsResponseDto;
import com.porflyo.dto.response.SlotDto;
import com.porflyo.mapper.MetricsSaveRequestMapper;
import com.porflyo.mapper.MetricsResponseMapper;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.metrics.DerivedMetrics;
import com.porflyo.model.metrics.Devices;
import com.porflyo.model.metrics.Engagement;
import com.porflyo.model.metrics.InteractionMetrics;
import com.porflyo.model.metrics.PortfolioHeatmap;
import com.porflyo.model.metrics.ProjectMetrics;
import com.porflyo.model.metrics.ProjectMetricsWithId;
import com.porflyo.model.metrics.ZScores;
import com.porflyo.usecase.MetricsUseCase;

import io.micronaut.json.JsonMapper;
import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import jakarta.inject.Inject;

@MicronautTest(environments = "local")
@ExtendWith(MockitoExtension.class)
@DisplayName("Metrics Get Handler Tests")
class MetricsGetHandlerTest {

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
    @DisplayName("should return metrics successfully when valid request")
    void should_return_metrics_successfully_when_valid_request() throws Exception {
        // given
        String portfolioId = "test-portfolio";
        EnhancedPortfolioMetricsBundle bundle = createMockBundle(portfolioId);
        
        when(metricsUseCase.getPortfolioMetricsWithSlots(any(PortfolioId.class), anyInt()))
            .thenReturn(bundle);
        
        APIGatewayV2HTTPEvent event = createEvent("GET", portfolioId, "3");

        // when
        APIGatewayV2HTTPResponse response = handler.handleMetricsRequest(event);

        // then
        assertEquals(200, response.getStatusCode());
        assertNotNull(response.getBody());
        
        // Parse response and verify structure
        MetricsResponseDto responseDto = jsonMapper.readValue(response.getBody(), MetricsResponseDto.class);
        assertNotNull(responseDto);
        assertNotNull(responseDto.meta());
        assertEquals("2025.09.26-r1", responseDto.meta().calcVersion());
        assertEquals(28, responseDto.meta().baseline().windowDays());
        
        // Verify daily aggregates
        assertEquals(1, responseDto.dailyAgg().size());
        assertEquals("2025-11-10", responseDto.dailyAgg().get(0).date());
        assertEquals(4, responseDto.dailyAgg().get(0).raw().views());
        
        // Verify slots
        assertEquals(1, responseDto.slots().size());
        assertEquals("2025-11-10", responseDto.slots().get(0).date());
        assertEquals(2, responseDto.slots().get(0).projects().size());
    }

    @Test
    @DisplayName("should return empty metrics when portfolio has no data")
    void should_return_empty_metrics_when_portfolio_has_no_data() throws Exception {
        // given
        String portfolioId = "empty-portfolio";
        EnhancedPortfolioMetricsBundle emptyBundle = new EnhancedPortfolioMetricsBundle(
            new PortfolioId(portfolioId),
            List.of(),
            List.of()
        );
        
        when(metricsUseCase.getPortfolioMetricsWithSlots(any(PortfolioId.class), anyInt()))
            .thenReturn(emptyBundle);
        
        APIGatewayV2HTTPEvent event = createEvent("GET", portfolioId, "3");

        // when
        APIGatewayV2HTTPResponse response = handler.handleMetricsRequest(event);

        // then
        assertEquals(200, response.getStatusCode());
        assertNotNull(response.getBody(), "Response body should not be null");
        
        MetricsResponseDto responseDto = jsonMapper.readValue(response.getBody(), MetricsResponseDto.class);
        assertNotNull(responseDto, "Response DTO should not be null");
        assertNotNull(responseDto.meta(), "Meta should not be null");
        
        // The lists might be null when deserialized if they are empty in JSON
        List<DailyAggregateDto> dailyAgg = responseDto.dailyAgg();
        List<SlotDto> slots = responseDto.slots();
        
        // Accept either empty list or null (both are valid for "no data")
        assertTrue(dailyAgg == null || dailyAgg.isEmpty(), "Daily aggregates should be null or empty");
        assertTrue(slots == null || slots.isEmpty(), "Slots should be null or empty");
    }

    @Test
    @DisplayName("should handle default months parameter when not provided")
    void should_handle_default_months_parameter_when_not_provided() throws Exception {
        // given
        String portfolioId = "test-portfolio";
        EnhancedPortfolioMetricsBundle bundle = createMockBundle(portfolioId);
        
        when(metricsUseCase.getPortfolioMetricsWithSlots(any(PortfolioId.class), anyInt()))
            .thenReturn(bundle);
        
        APIGatewayV2HTTPEvent event = createEvent("GET", portfolioId, "");

        // when
        APIGatewayV2HTTPResponse response = handler.handleMetricsRequest(event);

        // then
        assertEquals(200, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    @DisplayName("should verify JSON structure matches GetMetrics.json format")
    void should_verify_json_structure_matches_expected_format() throws Exception {
        // given
        String portfolioId = "test-portfolio";
        EnhancedPortfolioMetricsBundle bundle = createMockBundle(portfolioId);
        
        when(metricsUseCase.getPortfolioMetricsWithSlots(any(PortfolioId.class), anyInt()))
            .thenReturn(bundle);
        
        APIGatewayV2HTTPEvent event = createEvent("GET", portfolioId, "0");

        // when
        APIGatewayV2HTTPResponse response = handler.handleMetricsRequest(event);

        // then
        String jsonResponse = response.getBody();
        
        // Verify key JSON fields are present
        assertTrue(jsonResponse.contains("\"meta\""));
        assertTrue(jsonResponse.contains("\"calcVersion\""));
        assertTrue(jsonResponse.contains("\"generatedAt\""));
        assertTrue(jsonResponse.contains("\"timezone\""));
        assertTrue(jsonResponse.contains("\"units\""));
        assertTrue(jsonResponse.contains("\"baseline\""));
        assertTrue(jsonResponse.contains("\"dailyAgg\""));
        assertTrue(jsonResponse.contains("\"slots\""));
        assertTrue(jsonResponse.contains("\"raw\""));
        assertTrue(jsonResponse.contains("\"derived\""));
        assertTrue(jsonResponse.contains("\"zScores\""));
        assertTrue(jsonResponse.contains("\"deviceMix\""));
        assertTrue(jsonResponse.contains("\"heatmap\""));
        assertTrue(jsonResponse.contains("\"projects\""));
    }

    // Helper methods

    private APIGatewayV2HTTPEvent createEvent(String method, String portfolioId, String months) {
        APIGatewayV2HTTPEvent event = new APIGatewayV2HTTPEvent();
        
        APIGatewayV2HTTPEvent.RequestContext requestContext = new APIGatewayV2HTTPEvent.RequestContext();
        APIGatewayV2HTTPEvent.RequestContext.Http http = new APIGatewayV2HTTPEvent.RequestContext.Http();
        http.setMethod(method);
        requestContext.setHttp(http);
        event.setRequestContext(requestContext);

        event.setRawPath("/metrics/" + portfolioId + "/" + months);
        
        return event;
    }

    private EnhancedPortfolioMetricsBundle createMockBundle(String portfolioIdStr) {
        PortfolioId portfolioId = new PortfolioId(portfolioIdStr);
        LocalDate date = LocalDate.of(2025, 11, 10);
        
        Engagement engagement = new Engagement(
            194,    // activeTime
            4,      // views
            20,     // qualityVisits
            29,     // emailCopies
            33,     // socialClicks
            new Devices(39, 96)
        );
        
        InteractionMetrics scroll = new InteractionMetrics(
            6403,   // scoreTotal
            12472,  // scrollTimeTotal
            52249,  // ttfiSumMs
            33      // ttfiCount
        );
        
        ProjectMetrics cumProjects = new ProjectMetrics(
            117505, // viewTime
            287,    // exposures
            34,     // codeViews
            181     // liveViews
        );
        
        DerivedMetrics derived = new DerivedMetrics(
            0.8,    // desktopPct
            0.2,    // mobileTabletPct
            60.0,   // engagementAvg
            1470.0, // avgScrollTimeMs
            2020.0, // avgCardViewTimeMs
            870.0,  // ttfiMeanMs
            0.0949854239371126, // emailConversion
            null,   // qualityVisitRate
            null    // socialCtr
        );
        
        ZScores zScores = new ZScores(
            -0.00572540710680514,   // visits
            0.552345361403626,       // engagement
            0.317976161566564,       // ttfi
            null,                    // qualityVisitRate
            null                     // socialCtr
        );
        
        EnhancedPortfolioMetrics enhanced = new EnhancedPortfolioMetrics(
            portfolioId, date, engagement, scroll, cumProjects, derived, zScores
        );
        
        PortfolioHeatmap heatmap = new PortfolioHeatmap(
            "1.0",
            512,
            List.of(7318, 2954, 6302),
            List.of(384, 117, 849),
            List.of(7, 7, 8)
        );
        
        List<ProjectMetricsWithId> projects = List.of(
            new ProjectMetricsWithId(3, 3368, 98, 0, 1),
            new ProjectMetricsWithId(4, 1751, 60, 1, 1)
        );
        
        DetailSlot slot = new DetailSlot(date, heatmap, projects);
        
        return new EnhancedPortfolioMetricsBundle(
            portfolioId,
            List.of(enhanced),
            List.of(slot)
        );
    }
}
