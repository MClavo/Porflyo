package com.porflyo.infrastructure.adapters.input.lambda.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.application.configuration.JwtConfig;
import com.porflyo.application.ports.input.AuthUseCase;
import com.porflyo.application.ports.output.JwtPort;
import com.porflyo.domain.model.UserClaims;
import com.porflyo.domain.model.UserSession;
import com.porflyo.domain.model.shared.EntityId;
import com.porflyo.infrastructure.adapters.input.lambda.utils.LambdaHttpUtils;
import com.porflyo.infrastructure.configuration.FrontendConfig;

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
 * @since 1.0
 */
@Singleton
public class AuthLambdaHandler {
    private static final Logger log = LoggerFactory.getLogger(AuthLambdaHandler.class);
    private final AuthUseCase authService;
    private final JwtPort jwtService;

    private final JwtConfig jwtConfig;
    private final FrontendConfig frontendConfig;

    @Inject
    public AuthLambdaHandler(AuthUseCase authUseCase, JwtPort jwtPort, JwtConfig jwtConfig, FrontendConfig frontendConfig) {
        this.authService = authUseCase;
        this.jwtService = jwtPort;
        this.jwtConfig = jwtConfig;
        this.frontendConfig = frontendConfig;
    }

    /**
     * Handles the OAuth login by generating a login URL and returning a redirect response.
     * <p>
     * This method uses the authentication service to build the OAuth login URL and returns
     * an HTTP response that redirects the user to this URL.
     * </p>
     *
     * @param input the incoming API Gateway V2 HTTP event
     * @return an {@code APIGatewayV2HTTPResponse} containing the redirect URL for OAuth login
     */
    public APIGatewayV2HTTPResponse handleOauthLogin(APIGatewayV2HTTPEvent input) {
        try {
            String loginUrl = authService.buildOAuthLoginUrl();

            return LambdaHttpUtils.createRedirectResponse(loginUrl);

        } catch (Exception e) {
            log.error("Error handling OAuth login: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, e.getMessage());
        }
    }

    /**
     * Validates the session token present in the incoming API Gateway V2 HTTP event.
     * <p>
     * This method extracts the session token from the cookies of the incoming HTTP event,
     * validates it using the JWT service, and returns an appropriate response.
     * If the token is missing or invalid, it returns a 401 error response.
     * </p>
     *
     * @param input the incoming API Gateway V2 HTTP event
     * @return an {@code APIGatewayV2HTTPResponse} indicating the result of the token validation
     */
    public APIGatewayV2HTTPResponse handleTokenValidation(APIGatewayV2HTTPEvent input) {
        try {
            String token = LambdaHttpUtils.extractCookieValue(input, "session");

            if (token == null || token.trim().isEmpty()) {
                return LambdaHttpUtils.createErrorResponse(401, "Missing or invalid token");
            }

            boolean isValid = jwtService.validateToken(token);
            if (!isValid) {
                return LambdaHttpUtils.createErrorResponse(401, "Invalid token");
            }

            return LambdaHttpUtils.createResponse(200, "Valid token");

        } catch (Exception e) {
            log.error("Error validating token: {}", e.getMessage(), e);
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
            log.debug("Received OAuth callback with input: {}", input);
            String code = LambdaHttpUtils.extractQueryParameter(input, "code");
            log.debug("Extracted OAuth code: {}", code);

            String frontend = frontendConfig.url();
            long expiration = jwtConfig.expiration();

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
            log.error("Error handling OAuth callback: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, e.getMessage());
        }
    }

    public APIGatewayV2HTTPResponse handleLogout (APIGatewayV2HTTPEvent input){
        try {
            log.debug("Received logout request from user: {}", getUserId(input));

            String frontend = frontendConfig.url();

            // Clear session cookie
            return LambdaHttpUtils.createRedirectResponseWithCookie(
                frontend,           // redirect URL
                "",                 // body
                "session",          // Cookie name
                "",                 // Cookie value (clearing the cookie)
                0);                 // Max-Age set to 0 to delete the cookie

        } catch (Exception e) {
            log.error("Error handling logout: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, e.getMessage());
        }
    }

    private String getUserId(APIGatewayV2HTTPEvent input) {
        String cookie = LambdaHttpUtils.extractCookieValue(input, "session");
        UserClaims claims = jwtService.extractClaims(cookie);
        return claims.getSub();
    }

}
