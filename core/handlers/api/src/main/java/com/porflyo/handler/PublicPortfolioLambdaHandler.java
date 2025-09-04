package com.porflyo.handler;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.LambdaHttpUtils;
import com.porflyo.dto.AvailabilityResponseDto;
import com.porflyo.dto.PublicPortfolioView;
import com.porflyo.model.portfolio.Slug;
import com.porflyo.ports.input.PublicPortfolioQueryUseCase;
import com.porflyo.ports.output.SlugGeneratorPort;

import io.micronaut.json.JsonMapper;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

/**
 * Lambda handler for public portfolio queries.
 * <p>
 * This class handles public access to published portfolios without requiring authentication.
 * It allows anonymous users to view published portfolios by their public URL.
 * </p>
 */
@Singleton
public class PublicPortfolioLambdaHandler {
    private static final Logger log = LoggerFactory.getLogger(PublicPortfolioLambdaHandler.class);
    
    private final JsonMapper jsonMapper;
    private final PublicPortfolioQueryUseCase publicPortfolioQueryService;
    private final SlugGeneratorPort slugGenerator;

    @Inject
    public PublicPortfolioLambdaHandler(
            JsonMapper jsonMapper,
            PublicPortfolioQueryUseCase publicPortfolioQueryService,
            SlugGeneratorPort slugGenerator) {
                
        this.jsonMapper = jsonMapper;
        this.publicPortfolioQueryService = publicPortfolioQueryService;
        this.slugGenerator = slugGenerator;
    }

    /**
     * Handles incoming API Gateway events for public portfolio requests.
     *
     * @param input The API Gateway event containing the request data.
     * @return An {@link APIGatewayV2HTTPResponse} with the portfolio data or an error message.
     */
    public APIGatewayV2HTTPResponse handlePublicPortfolioRequest(APIGatewayV2HTTPEvent input) {
        String request = LambdaHttpUtils.extractPathSegment(input, 1);
        String slug = LambdaHttpUtils.extractPathSegment(input, 2);

        if (slug == null || slug.isEmpty()) {
                return LambdaHttpUtils.createErrorResponse(400, "Portfolio URL is required");
        }

        switch (request.toLowerCase()) {
            case "portfolio":
                return getPublicPortfolio(slug);
            case "isurlavailable":
                return checkUrlAvailability(slug);
            default:
                return LambdaHttpUtils.createErrorResponse(404, "Not Found");
        }
    }

    // ────────────────────────── Public Portfolio Access ────────────────────────── 

    /**
     * Checks if a public portfolio URL is available.
     *
     * @param slug The URL slug of the portfolio.
     * @return An {@link AvailabilityResponseDto} indicating the availability status.
     */
    private APIGatewayV2HTTPResponse checkUrlAvailability(String slug) {
        try {
            Slug normalizedSlug = slugGenerator.normalize(slug);
            boolean isAvailable = publicPortfolioQueryService.isUrlAvailable(normalizedSlug);
            AvailabilityResponseDto responseDto = new AvailabilityResponseDto(isAvailable, normalizedSlug.value());

            return LambdaHttpUtils.createResponse(200, jsonMapper.writeValueAsString(responseDto));

        } catch (Exception e) {
            log.error("Error checking URL availability: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal Server Error");
        }
    }

    /**
     * Gets a published portfolio by its public URL slug.
     *
     * @param slugString the URL slug of the portfolio
     * @return an {@link APIGatewayV2HTTPResponse} containing the portfolio data or an error message
     */
    private APIGatewayV2HTTPResponse getPublicPortfolio(String slugString) {
        try {
            Slug slug = slugGenerator.normalize(slugString);
            Optional<PublicPortfolioView> portfolioOpt = publicPortfolioQueryService.getPublishedByUrl(slug);

            if (portfolioOpt.isEmpty()) {
                log.debug("No published portfolio found for slug: {}", slugString);
                return LambdaHttpUtils.createErrorResponse(404, "Portfolio not found");
            }

            PublicPortfolioView portfolio = portfolioOpt.get();
            log.debug("Retrieved public portfolio: {} for slug: {}", portfolio.portfolioId(), slugString);

            return LambdaHttpUtils.createResponse(200, jsonMapper.writeValueAsString(portfolio));

        } catch (java.io.IOException e) {
            log.error("Error serializing public portfolio data: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal Server Error");
        } catch (Exception e) {
            log.error("Error retrieving public portfolio: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal Server Error");
        }
    }
}
