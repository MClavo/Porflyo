package com.porflyo.infrastructure.adapters.input.lambda.auth;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.application.ports.input.AuthUseCase;
import com.porflyo.application.ports.output.ConfigurationPort;
import com.porflyo.domain.model.UserSession;
import com.porflyo.infrastructure.adapters.input.lambda.utils.LambdaHttpUtils;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
public class AuthLambdaHandler {

    private final AuthUseCase authService;
    private final ConfigurationPort config;

    @Inject
    public AuthLambdaHandler(AuthUseCase authUseCase, ConfigurationPort configurationPort) {
        this.authService = authUseCase;
        this.config = configurationPort;
    }

    public APIGatewayV2HTTPResponse handleOauthLogin(APIGatewayV2HTTPEvent input) {
        try {
            String loginUrl = authService.buildOAuthLoginUrl();

            return LambdaHttpUtils.createRedirectResponse(loginUrl);

        } catch (Exception e) {
            return LambdaHttpUtils.createErrorResponse(500, e.getMessage());
        }
    }

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
