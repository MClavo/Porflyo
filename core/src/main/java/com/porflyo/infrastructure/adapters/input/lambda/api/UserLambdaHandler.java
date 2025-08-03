package com.porflyo.infrastructure.adapters.input.lambda.api;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.application.ports.input.UserUseCase;
import com.porflyo.application.ports.output.JwtPort;
import com.porflyo.domain.model.GithubLoginClaims;
import com.porflyo.domain.model.GithubUser;
import com.porflyo.infrastructure.adapters.input.lambda.utils.LambdaHttpUtils;

import io.micronaut.json.JsonMapper;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

/**
 * Handler class for processing GitHub user-related Lambda requests.
 * <p>
 * This class is responsible for handling incoming API Gateway events,
 * extracting session information from cookies, validating JWT claims,
 * retrieving user data from GitHub, and returning the appropriate HTTP response.
 * </p>
 *
 * <p>
 * Dependencies are injected via constructor:
 * <ul>
 *   <li>{@link JsonMapper} for serializing objects to JSON.</li>
 *   <li>{@link UserUseCase} for retrieving user data using an access token.</li>
 *   <li>{@link JwtPort} for extracting and validating JWT claims from session cookies.</li>
 * </ul>
 * </p>
 *
 * <p>
 * The main entry point is {@link #handleUserRequest(APIGatewayV2HTTPEvent)},
 * which processes the request and returns an {@link APIGatewayV2HTTPResponse}.
 * </p>
 *
 * @since 1.0
 */
@Singleton
public class UserLambdaHandler {
    private final JsonMapper jsonMapper;
    private final UserUseCase userService;
    private final JwtPort jwtService;

    @Inject
    public UserLambdaHandler(JsonMapper jsonMapper, UserUseCase userService, JwtPort jwtService) {
        this.jsonMapper = jsonMapper;
        this.userService = userService;
        this.jwtService = jwtService;
    }

    /**
     * Handles an incoming HTTP request to retrieve GitHub user data.
     * <p>
     * This method extracts the "session" cookie from the request, parses the JWT claims,
     * and uses the access token to fetch the corresponding GitHub user information.
     * Returns a successful HTTP response with the user data in JSON format,
     * or an error response if any exception occurs during processing.
     *
     * @param input the API Gateway HTTP event containing the request data
     * @return an APIGatewayV2HTTPResponse with the user data or an error message
     */
    public APIGatewayV2HTTPResponse handleUserRequest(APIGatewayV2HTTPEvent input) {
        try {
            // Extract cookie and claims
            String cookie = LambdaHttpUtils.extractCookieValue(input, "session");
            GithubLoginClaims claims = jwtService.extractClaims(cookie);

            

            // Get user data
            return null;//LambdaHttpUtils.createResponse(200, jsonMapper.writeValueAsString(user));

        } catch (Exception e) {
            return LambdaHttpUtils.createErrorResponse(500, e.getMessage());
        }
    }
}
