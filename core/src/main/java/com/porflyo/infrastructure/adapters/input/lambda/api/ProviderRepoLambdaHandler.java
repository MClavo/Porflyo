package com.porflyo.infrastructure.adapters.input.lambda.api;

import java.util.List;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.application.ports.input.RepoUseCase;
import com.porflyo.application.ports.output.JwtPort;
import com.porflyo.domain.model.provider.ProviderRepo;
import com.porflyo.domain.model.shared.EntityId;
import com.porflyo.domain.model.user.UserClaims;
import com.porflyo.infrastructure.adapters.input.lambda.utils.LambdaHttpUtils;

import io.micronaut.json.JsonMapper;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

/**
 * Handler for AWS Lambda requests related to GitHub repositories.
 * <p>
 * This class processes incoming API Gateway HTTP events, extracts user session information,
 * retrieves the user's GitHub repositories using the provided use case, and returns the result
 * as a JSON response.
 * </p>
 *
 * <p>
 * Dependencies are injected via constructor:
 * <ul>
 *   <li>{@link RepoUseCase} for repository-related operations</li>
 *   <li>{@link JwtPort} for extracting JWT claims from session cookies</li>
 *   <li>{@link JsonMapper} for serializing responses to JSON</li>
 * </ul>
 * </p>
 *
 * @since 1.0
 */
@Singleton
public class ProviderRepoLambdaHandler {

    private final RepoUseCase repoService;
    private final JwtPort jwtService;
    private final JsonMapper jsonMapper;

    @Inject
    public ProviderRepoLambdaHandler(RepoUseCase repoService, JwtPort jwtService, JsonMapper jsonMapper) {
        this.repoService = repoService;
        this.jwtService = jwtService;
        this.jsonMapper = jsonMapper;
    }    

    /**
     * Handles an incoming API Gateway HTTP event to retrieve the authenticated user's GitHub repositories.
     * <p>
     * This method extracts the session cookie from the request, validates and parses the JWT to obtain user claims,
     * and then fetches the user's repositories from GitHub using the access token. The list of repositories is returned
     * as a JSON response. If any error occurs during processing, an error response with status 500 is returned.
     * </p>
     *
     * @param input the API Gateway HTTP event containing the request data
     * @return an {@link APIGatewayV2HTTPResponse} containing the user's GitHub repositories in JSON format,
     *         or an error response if processing fails
     */
    public APIGatewayV2HTTPResponse handleUserRequest(APIGatewayV2HTTPEvent input) {
        try {
            // Extract cookie and claims
            String cookie = LambdaHttpUtils.extractCookieValue(input, "session");
            UserClaims claims = jwtService.extractClaims(cookie);
            if (claims == null) {
                return LambdaHttpUtils.createErrorResponse(401, "Unauthorized: Invalid session");
            }

            EntityId userId = new EntityId(claims.getSub());

            // Get user data
            List<ProviderRepo> repos = repoService.getUserRepos(userId);
            return LambdaHttpUtils.createResponse(200, jsonMapper.writeValueAsString(repos));

        } catch (Exception e) {
            return LambdaHttpUtils.createErrorResponse(500, e.getMessage());
        }
    }
}
