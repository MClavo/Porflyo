package com.porflyo.handler;

import java.io.IOException;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.LambdaHttpUtils;
import com.porflyo.dto.EnhancedPortfolioMetricsBundle;
import com.porflyo.dto.HeatmapSnapshot;
import com.porflyo.dto.received.MetricsSaveRequestDto;
import com.porflyo.dto.response.MetricsResponseDto;
import com.porflyo.mapper.MetricsSaveRequestMapper;
import com.porflyo.mapper.MetricsResponseMapper;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.metrics.Engagement;
import com.porflyo.model.metrics.InteractionMetrics;
import com.porflyo.model.metrics.ProjectMetrics;
import com.porflyo.model.metrics.ProjectMetricsWithId;
import com.porflyo.usecase.MetricsUseCase;

import io.micronaut.json.JsonMapper;
import jakarta.inject.Inject;

public class MetricsLambdaHandler {
    private static final Logger log = LoggerFactory.getLogger(MetricsLambdaHandler.class);  

    private final JsonMapper jsonMapper;
    private final MetricsSaveRequestMapper metricsSaveMapper;
    private final MetricsResponseMapper metricsResponseMapper;
    private final MetricsUseCase metricsUseCase;

    @Inject
    public MetricsLambdaHandler(
            JsonMapper jsonMapper,
            MetricsSaveRequestMapper metricsSaveMapper,
            MetricsResponseMapper metricsResponseMapper,
            MetricsUseCase metricsUseCase) {
        this.jsonMapper = jsonMapper;
        this.metricsSaveMapper = metricsSaveMapper;
        this.metricsResponseMapper = metricsResponseMapper;
        this.metricsUseCase = metricsUseCase;
    }


    public APIGatewayV2HTTPResponse handleMetricsRequest(APIGatewayV2HTTPEvent input) {
        try{
            // /metrics/{portfolioId}/{months}

            String httpMethod = LambdaHttpUtils.getMethod(input);
            String body = input.getBody();

            String portfolioIdStr = LambdaHttpUtils.extractPathSegment(input, 1);
            PortfolioId portfolioId = new PortfolioId(portfolioIdStr);

            String monthsStr = LambdaHttpUtils.extractPathSegment(input, 2);
            Integer months = (!monthsStr.isEmpty()) ? Integer.valueOf(monthsStr) : 0;


            return processMetricsRequest(httpMethod, body, portfolioId, months);

        } catch (Exception e) {
            log.error("Error processing metrics request: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal Server Error");
        }

    }


    // ────────────────────────── Gateway ──────────────────────────
    
    private APIGatewayV2HTTPResponse processMetricsRequest(
            String httpMethod,
            String body,
            PortfolioId portfolioId,
            Integer months) {

        log.debug("Handling metrics for portfolio: {}, method: {}", portfolioId, httpMethod);
        
        
        try {
            switch (httpMethod) {
                case "post":
                    return saveMetrics(portfolioId, body);
                
                case "get":
                    return getMetrics(portfolioId, months);

                default:
                    log.warn("Unsupported HTTP method: {}", httpMethod);
                    return LambdaHttpUtils.createErrorResponse(405, "Method Not Allowed");
            }
        
        } catch (IllegalArgumentException e) {
            log.warn("Invalid portfolio ID: {}", portfolioId);
            return LambdaHttpUtils.createErrorResponse(400, "Invalid portfolio ID");
        }    
    }

    // ────────────────────────── Metrics Management ────────────────────────── 

    private APIGatewayV2HTTPResponse saveMetrics(PortfolioId portfolioId, String body) {
        try{
            // Deserialize JSON to DTO
            MetricsSaveRequestDto requestDto = jsonMapper.readValue(body, MetricsSaveRequestDto.class);
            
            // Extract portfolio ID from DTO and validate it matches the path parameter
            PortfolioId dtoPortfolioId = metricsSaveMapper.toPortfolioId(requestDto);
            if (!portfolioId.equals(dtoPortfolioId)) {
                log.warn("Portfolio ID mismatch: path={}, body={}", portfolioId.value(), dtoPortfolioId.value());
                return LambdaHttpUtils.createErrorResponse(400, "Portfolio ID mismatch");
            }
            
            log.debug("Saving metrics: {}", requestDto);

            // Map DTO to domain objects
            Engagement engagement = metricsSaveMapper.toEngagement(requestDto);
            log.debug("Mapped engagement metrics: {}", engagement);
            InteractionMetrics scroll = metricsSaveMapper.toInteractionMetrics(requestDto);
            log.debug("Mapped scroll metrics: {}", scroll);
            ProjectMetrics cumProjects = metricsSaveMapper.toCumulativeProjectMetrics(requestDto);
            log.debug("Mapped cumulative project metrics: {}", cumProjects);
            HeatmapSnapshot heatmap = metricsSaveMapper.toHeatmapSnapshot(requestDto);
            log.debug("Mapped heatmap snapshot: {}", heatmap);
            List<ProjectMetricsWithId> projects = metricsSaveMapper.toProjectMetricsList(requestDto);
            log.debug("Mapped individual project metrics: {}", projects);
            
            // Save aggregate metrics
            metricsUseCase.saveTodayPortfolioMetrics(portfolioId, engagement, scroll, cumProjects);
            log.debug("Saved portfolio metrics for portfolio: {}", portfolioId.value());
            
            // Save detail slot (heatmap and project metrics)
            metricsUseCase.saveTodayDetailSlot(portfolioId, heatmap, projects);
            log.debug("Saved detail slot metrics for portfolio: {}", portfolioId.value());
            
            log.debug("Saved metrics for portfolio: {}", portfolioId.value());
            return LambdaHttpUtils.createResponse(200, "{\"message\": \"Metrics saved successfully\"}");

        } catch (IOException e) {
            log.error("Error deserializing metrics request: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(400, "Invalid request body");
        } catch (Exception e) {
            log.error("Error saving metrics: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal Server Error");
        }

    }


    private APIGatewayV2HTTPResponse getMetrics(PortfolioId portfolioId, Integer months) {
        try{
            log.debug("Retrieving metrics for portfolio: {}, months: {}", portfolioId.value(), months);

            EnhancedPortfolioMetricsBundle bundle = 
                metricsUseCase.getPortfolioMetricsWithSlots(portfolioId, months);

            // Convert bundle to response DTO
            MetricsResponseDto responseDto = metricsResponseMapper.toMetricsResponseDto(bundle);
            
            // Serialize to JSON
            String jsonResponse = jsonMapper.writeValueAsString(responseDto);
            
            log.debug("Successfully retrieved metrics for portfolio: {}", portfolioId.value());
            return LambdaHttpUtils.createResponse(200, jsonResponse);

        } catch (Exception e) {
            log.error("Error retrieving metrics: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal Server Error");
        }
    }

}