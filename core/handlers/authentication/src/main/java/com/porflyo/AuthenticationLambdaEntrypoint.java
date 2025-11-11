package com.porflyo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.exceptions.auth.JwtMalformedException;
import com.porflyo.model.user.UserClaims;
import com.porflyo.usecase.AuthUseCase;

import io.micronaut.context.ApplicationContext;
import io.micronaut.context.env.Environment;
import io.micronaut.function.aws.MicronautRequestHandler;
import jakarta.inject.Inject;

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
public class AuthenticationLambdaEntrypoint extends MicronautRequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse>{
    private static final Logger log = LoggerFactory.getLogger(AuthenticationLambdaEntrypoint.class);
    private final AuthUseCase authService;

    private final FrontendConfig frontendConfig;

    @Inject
    public AuthenticationLambdaEntrypoint() {
        this.applicationContext = ApplicationContext.
            builder(Environment.FUNCTION)
            .deduceEnvironment(false)
            .start();
        this.authService = applicationContext.getBean(AuthUseCase.class);
        this.frontendConfig = applicationContext.getBean(FrontendConfig.class);
    }

    @Override
    public APIGatewayV2HTTPResponse execute(APIGatewayV2HTTPEvent input) {
        String path = input.getRawPath();
        log.debug("Received request for path: {}", path);
        
        // Handle edge case where path might be null or empty
        if (path == null || path.isEmpty() || path.equals("/")) {
            log.warn("Invalid or empty path received: {}", path);
            return LambdaHttpUtils.createErrorResponse(404, "Not Found");
        }

        if(path.equals("/logout"))
            return handleLogout(input);
        else
            return handleTokenValidation(input);
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
        String token = LambdaHttpUtils.extractCookieValue(input, "session");

        if (token == null || token.trim().isEmpty()) {
            throw new JwtMalformedException("Missing or empty session token");
        }

       authService.verifyTokenOrThrow(token);

        return LambdaHttpUtils.createResponse(200, "Valid token");
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
        UserClaims claims = authService.extractClaims(cookie);
        return claims.getSub();
    }

}
