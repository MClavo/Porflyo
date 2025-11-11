package com.porflyo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.configuration.JwtConfig;
import com.porflyo.model.user.UserSession;
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
public class OauthLambdaEntrypoint extends MicronautRequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse>{
    private static final Logger log = LoggerFactory.getLogger(OauthLambdaEntrypoint.class);
    private final AuthUseCase authService;

    private final JwtConfig jwtConfig;
    private final FrontendConfig frontendConfig;

    @Inject
    public OauthLambdaEntrypoint() {
        this.applicationContext = ApplicationContext.
            builder(Environment.FUNCTION)
            .deduceEnvironment(false)
            .start();
            
        this.authService = applicationContext.getBean(AuthUseCase.class);
        this.jwtConfig = applicationContext.getBean(JwtConfig.class);
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

        if(path.equals("/oauth/login/github"))
            return handleOauthLogin(input);
        else
            return handleOAuthCallback(input);
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
            log.debug("Extracted OAuth code");

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
}
