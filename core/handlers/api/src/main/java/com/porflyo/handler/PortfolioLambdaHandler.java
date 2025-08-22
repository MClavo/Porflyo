package com.porflyo.handler;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.LambdaHttpUtils;
import com.porflyo.dto.PortfolioCreateDto;
import com.porflyo.dto.PortfolioPatchDto;
import com.porflyo.dto.PortfolioPublishDto;
import com.porflyo.dto.PublicPortfolioDto;
import com.porflyo.mapper.PortfolioCreateDtoMapper;
import com.porflyo.mapper.PortfolioPatchDtoMapper;
import com.porflyo.mapper.PublicPortfolioDtoMapper;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.portfolio.Portfolio;
import com.porflyo.model.user.UserClaims;
import com.porflyo.ports.input.AuthUseCase;
import com.porflyo.ports.input.PortfolioUseCase;

import io.micronaut.core.type.Argument;
import io.micronaut.json.JsonMapper;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

/**
 * Lambda handler for portfolio-related operations.
 * <p>
 * This class handles incoming API Gateway events for portfolio management, including creating,
 * retrieving, updating, publishing, and deleting portfolios. It uses the {@link PortfolioUseCase}
 * to perform business logic and the {@link AuthUseCase} for authentication operations.
 * </p>
 *
 * This handler is always invoked after the user has been authenticated.
 */
@Singleton
public class PortfolioLambdaHandler {
    private static final Logger log = LoggerFactory.getLogger(PortfolioLambdaHandler.class);
    
    private final JsonMapper jsonMapper;
    private final PublicPortfolioDtoMapper publicPortfolioDtoMapper;
    private final PortfolioCreateDtoMapper portfolioCreateDtoMapper;
    private final PortfolioUseCase portfolioService;
    private final AuthUseCase authService;

    @Inject
    public PortfolioLambdaHandler(
            JsonMapper jsonMapper,
            PublicPortfolioDtoMapper publicPortfolioDtoMapper,
            PortfolioCreateDtoMapper portfolioCreateDtoMapper,
            PortfolioUseCase portfolioService,
            AuthUseCase authService) {
                
        this.jsonMapper = jsonMapper;
        this.publicPortfolioDtoMapper = publicPortfolioDtoMapper;
        this.portfolioCreateDtoMapper = portfolioCreateDtoMapper;
        this.portfolioService = portfolioService;
        this.authService = authService;
    }

    /**
     * Handles incoming API Gateway events for portfolio-related requests.
     *
     * @param input The API Gateway event containing the request data.
     * @return An {@link APIGatewayV2HTTPResponse} with the result of the operation.
     */
    public APIGatewayV2HTTPResponse handlePortfolioRequest(APIGatewayV2HTTPEvent input) {
        try {
            // /api/portfolio/{request}
            String pathRequest = LambdaHttpUtils.extractPathSegment(input, 2);
            
            UserId userId = getUserIdFromCookie(input);
            String body = input.getBody();
            String httpMethod = LambdaHttpUtils.getMethod(input);

            return processPortfolioRequest(userId, body, pathRequest, httpMethod);

        } catch (Exception e) {
            log.error("Error processing portfolio request: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal Server Error");
        }
    }

    // ────────────────────────── Gateway ──────────────────────────

    private APIGatewayV2HTTPResponse processPortfolioRequest(UserId userId, String body, String pathRequest, String httpMethod) {
        log.debug("Handling portfolio request for path: {}, method: {}", pathRequest, httpMethod);

        switch (pathRequest) {
            case "create":
                return createPortfolio(userId, body);

            case "list":
                return listPortfolios(userId);
                
            default:
                // Handle portfolio-specific operations: /api/portfolio/{portfolioId}/{action}
                return handlePortfolioSpecificRequest(userId, body, pathRequest, httpMethod);
        }
    }

    private APIGatewayV2HTTPResponse handlePortfolioSpecificRequest(UserId userId, String body, String portfolioId, String httpMethod) {
        try {
            PortfolioId id = new PortfolioId(portfolioId);
            
            switch (httpMethod) {
                case "get":
                    return getPortfolio(userId, id);

                case "patch":
                    return patchPortfolio(userId, id, body);

                case "delete":
                    return deletePortfolio(userId, id);

                case "post":
                    // Handle publish/unpublish
                    return publishPortfolio(userId, id, body);
                    
                default:
                    log.warn("Unsupported HTTP method: {}", httpMethod);
                    return LambdaHttpUtils.createErrorResponse(405, "Method Not Allowed");
            }
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid portfolio ID: {}", portfolioId);
            return LambdaHttpUtils.createErrorResponse(400, "Invalid portfolio ID");
        }
    }

    // ────────────────────────── Portfolio Management ────────────────────────── 

    /**
     * Creates a new portfolio draft.
     *
     * @param userId the ID of the user creating the portfolio
     * @param body   the JSON body containing the portfolio data
     * @return an {@link APIGatewayV2HTTPResponse} with the created portfolio data or an error message
     */
    private APIGatewayV2HTTPResponse createPortfolio(UserId userId, String body) {
        try {
            PortfolioCreateDto createDto = jsonMapper.readValue(body, PortfolioCreateDto.class);
            Portfolio portfolio = portfolioCreateDtoMapper.toDomain(createDto, userId);
            
            portfolioService.createDraft(portfolio);
            
            PublicPortfolioDto dto = publicPortfolioDtoMapper.toDto(portfolio);
            log.debug("Created portfolio: {} for user: {}", portfolio.id().value(), userId.value());
            
            return LambdaHttpUtils.createResponse(201, jsonMapper.writeValueAsString(dto));

        } catch (java.io.IOException e) {
            log.error("Error deserializing portfolio create request: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(400, "Invalid request body");
        } catch (Exception e) {
            log.error("Error creating portfolio: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal Server Error");
        }
    }

    /**
     * Lists all portfolios owned by a user.
     *
     * @param userId the ID of the user
     * @return an {@link APIGatewayV2HTTPResponse} containing the list of portfolios
     */
    private APIGatewayV2HTTPResponse listPortfolios(UserId userId) {
        try {
            List<Portfolio> portfolios = portfolioService.listByOwner(userId);
            List<PublicPortfolioDto> dtos = portfolios.stream()
                .map(publicPortfolioDtoMapper::toDto)
                .toList();
            
            log.debug("Listed {} portfolios for user: {}", dtos.size(), userId.value());
            return LambdaHttpUtils.createResponse(200, jsonMapper.writeValueAsString(dtos));

        } catch (java.io.IOException e) {
            log.error("Error serializing portfolio list: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal Server Error");
        } catch (Exception e) {
            log.error("Error listing portfolios: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal Server Error");
        }
    }

    /**
     * Gets a specific portfolio by ID.
     *
     * @param userId      the ID of the user
     * @param portfolioId the ID of the portfolio to retrieve
     * @return an {@link APIGatewayV2HTTPResponse} containing the portfolio data or an error message
     */
    private APIGatewayV2HTTPResponse getPortfolio(UserId userId, PortfolioId portfolioId) {
        try {
            Optional<Portfolio> portfolioOpt = portfolioService.findById(userId, portfolioId);

            if (portfolioOpt.isEmpty()) {
                return LambdaHttpUtils.createErrorResponse(404, "Portfolio not found");
            }

            PublicPortfolioDto dto = publicPortfolioDtoMapper.toDto(portfolioOpt.get());
            log.debug("Retrieved portfolio: {} for user: {}", portfolioId.value(), userId.value());

            return LambdaHttpUtils.createResponse(200, jsonMapper.writeValueAsString(dto));

        } catch (java.io.IOException e) {
            log.error("Error serializing portfolio data: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal Server Error");
        } catch (Exception e) {
            log.error("Error retrieving portfolio: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal Server Error");
        }
    }

    /**
     * Patches a portfolio with the provided body and returns the updated portfolio data.
     *
     * @param userId      the ID of the user
     * @param portfolioId the ID of the portfolio to patch
     * @param body        the JSON body containing the fields to update
     * @return an {@link APIGatewayV2HTTPResponse} containing the updated portfolio data or an error message
     */
    private APIGatewayV2HTTPResponse patchPortfolio(UserId userId, PortfolioId portfolioId, String body) {
        try {
            Map<String, Object> attributes = extractAttributesFromBody(body);
            PortfolioPatchDto patch = PortfolioPatchDtoMapper.toPatch(attributes);

            Portfolio portfolio = portfolioService.patchPortfolio(userId, portfolioId, patch);
            PublicPortfolioDto dto = publicPortfolioDtoMapper.toDto(portfolio);

            log.debug("Patched portfolio: {} for user: {}, Attributes: {}", portfolioId.value(), userId.value(), attributes);
            return LambdaHttpUtils.createResponse(200, jsonMapper.writeValueAsString(dto));

        } catch (java.io.IOException e) {
            log.error("Error processing patch request: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(400, "Invalid request body");
        } catch (Exception e) {
            log.error("Error patching portfolio: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal Server Error");
        }
    }

    /**
     * Publishes or unpublishes a portfolio with a specific URL.
     *
     * @param userId      the ID of the user
     * @param portfolioId the ID of the portfolio to publish
     * @param body        the JSON body containing the URL and publication status
     * @return an {@link APIGatewayV2HTTPResponse} containing the updated portfolio data or an error message
     */
    private APIGatewayV2HTTPResponse publishPortfolio(UserId userId, PortfolioId portfolioId, String body) {
        try {
            PortfolioPublishDto publishDto = jsonMapper.readValue(body, PortfolioPublishDto.class);
            
            Portfolio portfolio = portfolioService.setUrlAndVisibility(
                userId, portfolioId, publishDto.url(), publishDto.published());
            
            PublicPortfolioDto dto = publicPortfolioDtoMapper.toDto(portfolio);

            log.debug("Published portfolio: {} for user: {}, URL: {}, Published: {}", 
                portfolioId.value(), userId.value(), publishDto.url(), publishDto.published());
            
            return LambdaHttpUtils.createResponse(200, jsonMapper.writeValueAsString(dto));

        } catch (java.io.IOException e) {
            log.error("Error processing publish request: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(400, "Invalid request body");
        } catch (Exception e) {
            log.error("Error publishing portfolio: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal Server Error");
        }
    }

    /**
     * Deletes a portfolio by its ID.
     *
     * @param userId      the ID of the user
     * @param portfolioId the ID of the portfolio to delete
     * @return an {@link APIGatewayV2HTTPResponse} indicating success or failure
     */
    private APIGatewayV2HTTPResponse deletePortfolio(UserId userId, PortfolioId portfolioId) {
        try {
            portfolioService.delete(userId, portfolioId);
            log.debug("Deleted portfolio: {} for user: {}", portfolioId.value(), userId.value());
            return LambdaHttpUtils.createResponse(204, null); // No content

        } catch (Exception e) {
            log.error("Error deleting portfolio: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal Server Error");
        }
    }

    // ────────────────────────── Helpers ──────────────────────────

    private UserId getUserIdFromCookie(APIGatewayV2HTTPEvent input) {
        String cookie = LambdaHttpUtils.extractCookieValue(input, "session");
        UserClaims claims = authService.extractClaims(cookie);
        return new UserId(claims.getSub());
    }

    /* Extracts attributes from the request body */
    private Map<String, Object> extractAttributesFromBody(String body) throws java.io.IOException {
        if (body == null || body.isEmpty()) 
            throw new IllegalArgumentException("Request body cannot be null or empty");
            
        return jsonMapper.readValue(body, Argument.mapOf(String.class, Object.class));
    }
}
