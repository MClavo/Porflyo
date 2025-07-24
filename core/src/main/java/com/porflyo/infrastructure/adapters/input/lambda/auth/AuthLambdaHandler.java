package com.porflyo.infrastructure.adapters.input.lambda.auth;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.application.ports.input.AuthUseCase;
import com.porflyo.application.ports.output.ConfigurationPort;
import com.porflyo.domain.model.UserSession;
import com.porflyo.infrastructure.adapters.input.lambda.utils.LambdaHttpUtils;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

/**
 * Handler class for AWS Lambda functions related to authentication.
 * <p>
 * This class provides endpoints for OAuth login and callback handling,
 * integrating with the authentication use case and configuration port.
 * </p>
 *
 * <p>
 * Endpoints:
 * <ul>
 *   <li>{@link #handleOauthLogin(APIGatewayV2HTTPEvent)} - Initiates the OAuth login flow by generating a login URL and returning a redirect response.</li>
 *   <li>{@link #handleOAuthCallback(APIGatewayV2HTTPEvent)} - Handles the OAuth callback, exchanges the authorization code for a session, and sets a session cookie.</li>
 * </ul>
 * </p>
 *
 * <p>
 * Dependencies are injected via constructor:
 * <ul>
 *   <li>{@link AuthUseCase} - Service for authentication logic.</li>
 *   <li>{@link ConfigurationPort} - Provides configuration values such as frontend URL and JWT expiration.</li>
 * </ul>
 * </p>
 *
 * <p>
 * All responses are formatted as {@link APIGatewayV2HTTPResponse} for AWS Lambda compatibility.
 * </p>
 */
@Singleton
public class AuthLambdaHandler {

    private final AuthUseCase authService;
    private final ConfigurationPort config;

    @Inject
    public AuthLambdaHandler(AuthUseCase authUseCase, ConfigurationPort configurationPort) {
        this.authService = authUseCase;
        this.config = configurationPort;
    }

    /**
     * Handles the OAuth login process by generating a redirect response to the OAuth login URL.
     * <p>
     * This method builds the OAuth login URL using the {@code authService} and returns an HTTP redirect
     * response to that URL. If an exception occurs during the process, it returns an error response with
     * status code 500 and the exception message.
     * </p>
     *
     * @param input the incoming API Gateway V2 HTTP event
     * @return an {@code APIGatewayV2HTTPResponse} that redirects the user to the OAuth login URL,
     *         or an error response if an exception occurs
     */
    public APIGatewayV2HTTPResponse handleOauthLogin(APIGatewayV2HTTPEvent input) {
        try {
            String loginUrl = authService.buildOAuthLoginUrl();

            return LambdaHttpUtils.createRedirectResponse(loginUrl);

        } catch (Exception e) {
            return LambdaHttpUtils.createErrorResponse(500, e.getMessage());
        }
    }

    /**
     * Handles the OAuth callback by processing the authorization code received from the OAuth provider.
     * <p>
     * This method extracts the authorization code from the query parameters of the incoming HTTP event,
     * exchanges it for a user session using the authentication service, and sets a session cookie with
     * the generated JWT token. If the authorization code is missing or invalid, it redirects to the frontend
     * with an error message. In case of any exceptions, it returns a 500 error response.
     * </p>
     *
     * @param input The {@link APIGatewayV2HTTPEvent} containing the HTTP request and query parameters.
     * @return An {@link APIGatewayV2HTTPResponse} that either redirects the user to the frontend with a session cookie,
     *         or returns an error response if the process fails.
     */
    public APIGatewayV2HTTPResponse handleOAuthCallback (APIGatewayV2HTTPEvent input){
        try {
            String code = input.getQueryStringParameters() != null ? 
                input.getQueryStringParameters().get("code") : null;
            String frontend = config.getFrontendUrl();
            long expiration = config.getJwtExpirationSeconds();
            
            if(code == null || code.trim().isEmpty()) {
                return LambdaHttpUtils.createErrorRedirectResponse(400, frontend, "Missing authorization code");
            }

            
            // Exchange code internally
            UserSession session = authService.handleOAuthCallback(code);

            return LambdaHttpUtils.createRedirectResponseWithCookie(
                frontend,           // redirect URL
                "",                 // body
                "session",          // Cookie name
                session.jwtToken(), // Cookie value
                expiration);        // Max-Age

            
        } catch (Exception e) {
            return LambdaHttpUtils.createErrorResponse(500, e.getMessage());
        }
    }

}
