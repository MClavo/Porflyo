package com.porflyo.handler;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.LambdaHttpUtils;
import com.porflyo.dto.DetailSlot;
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
import com.porflyo.model.user.UserClaims;
import com.porflyo.usecase.AuthUseCase;
import com.porflyo.usecase.MetricsUseCase;

import io.micronaut.core.type.Argument;
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
    private final AuthUseCase authUseCase;

    @Inject
    public MetricsLambdaHandler(
            JsonMapper jsonMapper,
            BootstrapResponseMapper bootstrapMapper,
            TodayResponseMapper todayMapper,
            MonthResponseMapper monthMapper,
            MetricsUseCase metricsUseCase,
            AuthUseCase authUseCase) {
                
        this.jsonMapper = jsonMapper;
        this.bootstrapMapper = bootstrapMapper;
        this.todayMapper = todayMapper;
        this.monthMapper = monthMapper;
        this.metricsUseCase = metricsUseCase;
        this.authUseCase = authUseCase;
    }

    /**
     * Handles incoming API Gateway events for metrics-related requests.
     *
     * @param input The API Gateway event containing the request data.
     * @return An {@link APIGatewayV2HTTPResponse} with the result of the operation.
     */
    public APIGatewayV2HTTPResponse handleMetricsRequest(APIGatewayV2HTTPEvent input) {
        try {
            UserClaims userClaims = getUserClaimsFromCookie(input);
            String httpMethod = LambdaHttpUtils.getMethod(input);
            String path = input.getRawPath();
            
            return processMetricsRequest(userClaims, path, httpMethod, input);
            
        } catch (Exception e) {
            log.error("Error processing metrics request: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal server error");
        }
    }

    // ────────────────────────── Gateway ──────────────────────────

    private APIGatewayV2HTTPResponse processMetricsRequest(
            UserClaims userClaims, 
            String path, 
            String httpMethod, 
            APIGatewayV2HTTPEvent input) {
        
        log.debug("Handling metrics request: {}, method: {}", path, httpMethod);

        try {
            if ("get".equals(httpMethod)) {
                return handleGetRequest(userClaims, path, input);
            } else {
                return LambdaHttpUtils.createErrorResponse(405, "Method not allowed");
            }
        } catch (IllegalArgumentException e) {
            log.warn("Bad request for metrics: {}", e.getMessage());
            return LambdaHttpUtils.createErrorResponse(400, e.getMessage());
        }
    }

    private APIGatewayV2HTTPResponse handleGetRequest(
            UserClaims userClaims, 
            String path, 
            APIGatewayV2HTTPEvent input) {
        
        // Extract route after /metrics/
        if (path.contains("/metrics/bootstrap")) {
            return handleBootstrap(userClaims, input);
        } else if (path.contains("/metrics/today")) {
            return handleToday(userClaims, input);
        } else if (path.contains("/metrics/month")) {
            return handleMonth(userClaims, input);
        } else {
            return LambdaHttpUtils.createErrorResponse(404, "Metrics endpoint not found");
        }
    }

    // ────────────────────────── Metrics Endpoints ────────────────────────── 

    /**
     * Handles the bootstrap endpoint: GET /metrics/bootstrap?portfolioId=<id>&months=<N>
     */
    private APIGatewayV2HTTPResponse handleBootstrap(UserClaims userClaims, APIGatewayV2HTTPEvent input) {
        try {
            String portfolioIdStr = LambdaHttpUtils.extractQueryParameter(input, "portfolioId");
            String monthsStr = LambdaHttpUtils.extractQueryParameter(input, "months");
            
            if (portfolioIdStr == null || monthsStr == null) {
                return LambdaHttpUtils.createErrorResponse(400, "Missing required parameters: portfolioId and months");
            }
            
            PortfolioId portfolioId = new PortfolioId(portfolioIdStr);
            int months = Integer.parseInt(monthsStr);
            
            // Get enhanced metrics with slots
            EnhancedPortfolioMetricsBundle bundle = metricsUseCase.getPortfolioMetricsWithSlots(portfolioId, months);
            
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
        } catch (java.io.IOException e) {
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
    private APIGatewayV2HTTPResponse handleToday(UserClaims userClaims, APIGatewayV2HTTPEvent input) {
        try {
            String portfolioIdStr = LambdaHttpUtils.extractQueryParameter(input, "portfolioId");
            
            if (portfolioIdStr == null) {
                return LambdaHttpUtils.createErrorResponse(400, "Missing required parameter: portfolioId");
            }
            
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
        } catch (java.io.IOException e) {
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
    private APIGatewayV2HTTPResponse handleMonth(UserClaims userClaims, APIGatewayV2HTTPEvent input) {
        try {
            String portfolioIdStr = LambdaHttpUtils.extractQueryParameter(input, "portfolioId");
            String monthStr = LambdaHttpUtils.extractQueryParameter(input, "month");
            
            if (portfolioIdStr == null || monthStr == null) {
                return LambdaHttpUtils.createErrorResponse(400, "Missing required parameters: portfolioId and month");
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
        } catch (java.time.format.DateTimeParseException e) {
            return LambdaHttpUtils.createErrorResponse(400, "Invalid month format. Use YYYY-MM");
        } catch (java.io.IOException e) {
            log.error("Error serializing month response", e);
            return LambdaHttpUtils.createErrorResponse(500, "Error processing response");
        } catch (Exception e) {
            log.error("Error handling month request", e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal server error");
        }
    }

    // ────────────────────────── Helpers ──────────────────────────

    private UserClaims getUserClaimsFromCookie(APIGatewayV2HTTPEvent input) {
        String token = LambdaHttpUtils.extractCookieValue(input, "session");
        return authUseCase.extractClaims(token);
    }
}