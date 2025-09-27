package com.porflyo.handler;

import java.io.IOException;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.LambdaHttpUtils;
import com.porflyo.dto.EnhancedPortfolioMetrics;
import com.porflyo.dto.EnhancedPortfolioMetricsBundle;
import com.porflyo.dto.EnhancedPortfolioMetricsSnapshot;
import com.porflyo.dto.response.BootstrapResponseDto;
import com.porflyo.dto.response.MonthResponseDto;
import com.porflyo.dto.response.TodayResponseDto;
import com.porflyo.mapper.BootstrapResponseMapper;
import com.porflyo.mapper.MonthResponseMapper;
import com.porflyo.mapper.TodayResponseMapper;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.usecase.MetricsUseCase;

import io.micronaut.json.JsonMapper;
import jakarta.inject.Inject;

/**
 * Lambda handler for metrics-related operations.
 * <p>
 * This class handles incoming API Gateway events for metrics management, including bootstrap,
 * today, and month endpoints. It uses the {@link MetricsUseCase} to perform business logic
 * and the {@link AuthUseCase} for authentication operations.
 * </p>
 * 
 * This handler is always invoked after the user has been authenticated.
 */
public class MetricsLambdaHandler {
    private static final Logger log = LoggerFactory.getLogger(MetricsLambdaHandler.class);
    
    private final JsonMapper jsonMapper;
    private final BootstrapResponseMapper bootstrapMapper;
    private final TodayResponseMapper todayMapper;
    private final MonthResponseMapper monthMapper;
    private final MetricsUseCase metricsUseCase;

    @Inject
    public MetricsLambdaHandler(
            JsonMapper jsonMapper,
            BootstrapResponseMapper bootstrapMapper,
            TodayResponseMapper todayMapper,
            MonthResponseMapper monthMapper,
            MetricsUseCase metricsUseCase
    ) {
                
        this.jsonMapper = jsonMapper;
        this.bootstrapMapper = bootstrapMapper;
        this.todayMapper = todayMapper;
        this.monthMapper = monthMapper;
        this.metricsUseCase = metricsUseCase;
    }

    /**
     * Handles incoming API Gateway events for metrics-related requests.
     *
     * @param input The API Gateway event containing the request data.
     * @return An {@link APIGatewayV2HTTPResponse} with the result of the operation.
     */
    public APIGatewayV2HTTPResponse handleMetricsRequest(APIGatewayV2HTTPEvent input) {
        try {
            String httpMethod = LambdaHttpUtils.getMethod(input);
            String request = LambdaHttpUtils.extractPathSegment(input, 1);
            String portfolioId = LambdaHttpUtils.extractQueryParameter(input, "portfolioId");
            String month = LambdaHttpUtils.extractQueryParameter(input, "month");
            String body = input.getBody();

            if (portfolioId == null) {
                return LambdaHttpUtils.createErrorResponse(400, "Missing required parameter: portfolioId");
            }

            return processMetricsRequest(httpMethod, request, portfolioId, month, body);
            
            
        } catch (Exception e) {
            log.error("Error processing metrics request: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal server error");
        }
    }

    // ────────────────────────── Gateway ──────────────────────────

    private APIGatewayV2HTTPResponse processMetricsRequest(
            String method, 
            String request, 
            String portfolioId,
            String month,
            String body
    ) {
        if(method == null || request == null) {
            log.warn("Invalid method or request: method={}, request={}", method, request);
            return LambdaHttpUtils.createErrorResponse(405, "Method Not Allowed");
        }

        try {
            switch (method) {
                case "get":
                    return processGetRequest(request, portfolioId, month);
                
                case "post":
                    return handleSave(portfolioId, body);

                default:
                    log.warn("Unsupported method: {}", method);
                    return LambdaHttpUtils.createErrorResponse(405, "Method Not Allowed");
            }
        } catch (IllegalArgumentException e) {
            log.warn("Invalid portfolio ID: {}", portfolioId);
            return LambdaHttpUtils.createErrorResponse(400, "Invalid portfolio ID");
        }


       
    }


    private APIGatewayV2HTTPResponse processGetRequest(
            String request,
            String portfolioId,
            String month
    ) {
        try {
            switch (request) {
                case "bootstrap":
                    return handleBootstrap(portfolioId);

                case "today":
                    return handleToday(portfolioId);

                case "month":
                    return handleMonth(portfolioId, month);

                default:
                    log.warn("Unsupported request: {}", request);
                    return LambdaHttpUtils.createErrorResponse(405, "Request Not Allowed");
            }
        } catch (IllegalArgumentException e) {
            log.warn("Invalid portfolio ID: {}", portfolioId);
            return LambdaHttpUtils.createErrorResponse(400, "Invalid portfolio ID");
        }
    }


    // ────────────────────────── Metrics Endpoints ────────────────────────── 

    private APIGatewayV2HTTPResponse handleSave(String portfolioIdStr, String body) {
        // Currently not implemented
        return LambdaHttpUtils.createErrorResponse(501, "Not implemented");
    }

    /**
     * Handles the bootstrap endpoint: GET /metrics/bootstrap?portfolioId=<id>
     */
    private APIGatewayV2HTTPResponse handleBootstrap(String portfolioIdStr) {
        try {
            
            PortfolioId portfolioId = new PortfolioId(portfolioIdStr);
            
            // Get enhanced metrics with slots // TODO: get months from config
            EnhancedPortfolioMetricsBundle bundle = metricsUseCase.getPortfolioMetricsWithSlots(portfolioId, 3);
            
            // Map to response DTO
            BootstrapResponseDto response = bootstrapMapper.map(
                bundle.aggregates(),
                bundle.slots(),
                28 // TODO: get from config
            );
            
            String jsonResponse = jsonMapper.writeValueAsString(response);
            return LambdaHttpUtils.createResponse(200, jsonResponse);
            
        } catch (NumberFormatException e) {
            return LambdaHttpUtils.createErrorResponse(400, "Invalid number format in parameters");

        } catch (IOException e) {
            log.error("Error serializing bootstrap response", e);
            return LambdaHttpUtils.createErrorResponse(500, "Error processing response");

        } catch (Exception e) {
            log.error("Error handling bootstrap request", e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal server error");
        }
    }

    /**
     * Handles the today endpoint: GET /metrics/today?portfolioId=<id>
     */
    private APIGatewayV2HTTPResponse handleToday(String portfolioIdStr) {
        try {
            PortfolioId portfolioId = new PortfolioId(portfolioIdStr);
            
            // Get today's enhanced metrics with details
            EnhancedPortfolioMetricsSnapshot snapshot = metricsUseCase.getTodayMetricsWithDetails(portfolioId);
            
            if (snapshot.aggregate() == null || snapshot.details() == null) {
                return LambdaHttpUtils.createErrorResponse(404, "No metrics found for today");
            }
            
            // Map to response DTO
            TodayResponseDto response = todayMapper.map(
                snapshot.aggregate(),
                snapshot.details(),
                28 // TODO: get from config
            );
            
            String jsonResponse = jsonMapper.writeValueAsString(response);
            return LambdaHttpUtils.createResponse(200, jsonResponse);
            
        } catch (NumberFormatException e) {
            return LambdaHttpUtils.createErrorResponse(400, "Invalid number format in portfolioId");

        } catch (IOException e) {
            log.error("Error serializing today response", e);
            return LambdaHttpUtils.createErrorResponse(500, "Error processing response");

        } catch (Exception e) {
            log.error("Error handling today request", e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal server error");
        }
    }

    /**
     * Handles the month endpoint: GET /metrics/month?portfolioId=<id>&month=YYYY-MM
     */
    private APIGatewayV2HTTPResponse handleMonth(String portfolioIdStr, String monthStr) {
        try {
            if (monthStr == null) {
                return LambdaHttpUtils.createErrorResponse(400, "Missing required parameters: month");
            }
            
            PortfolioId portfolioId = new PortfolioId(portfolioIdStr);
            
            // Parse YYYY-MM format and calculate months back
            YearMonth requestedMonth = YearMonth.parse(monthStr, DateTimeFormatter.ofPattern("yyyy-MM"));
            YearMonth currentMonth = YearMonth.now();

            int monthsBack = (int) java.time.temporal.ChronoUnit.MONTHS.between(requestedMonth, currentMonth);
            
            // Get enhanced metrics for the specific month
            List<EnhancedPortfolioMetrics> monthMetrics = metricsUseCase.getPortfolioMetricsOneMonth(portfolioId, monthsBack);
            
            // Map to response DTO
            MonthResponseDto response = monthMapper.map(
                monthMetrics,
                28 // TODO: get from config
            );
            
            String jsonResponse = jsonMapper.writeValueAsString(response);
            return LambdaHttpUtils.createResponse(200, jsonResponse);
            
        } catch (NumberFormatException e) {
            return LambdaHttpUtils.createErrorResponse(400, "Invalid number format in portfolioId");

        } catch (DateTimeParseException e) {
            return LambdaHttpUtils.createErrorResponse(400, "Invalid month format. Use YYYY-MM");

        } catch (IOException e) {
            log.error("Error serializing month response", e);
            return LambdaHttpUtils.createErrorResponse(500, "Error processing response");

        } catch (Exception e) {
            log.error("Error handling month request", e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal server error");
        }
    }
}