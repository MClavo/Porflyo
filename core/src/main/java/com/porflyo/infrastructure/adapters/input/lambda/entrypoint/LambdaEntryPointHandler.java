package com.porflyo.infrastructure.adapters.input.lambda.entrypoint;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.infrastructure.adapters.input.lambda.auth.AuthLambdaHandler;
import com.porflyo.infrastructure.adapters.input.lambda.github.GithubRepoLambdaHandler;
import com.porflyo.infrastructure.adapters.input.lambda.github.GithubUserLambdaHandler;
import com.porflyo.infrastructure.adapters.input.lambda.utils.LambdaHttpUtils;
import com.porflyo.infrastructure.adapters.output.github.GithubAdapter;

import io.micronaut.context.ApplicationContext;
import io.micronaut.context.env.Environment;
import io.micronaut.core.annotation.Introspected;
import jakarta.inject.Inject;

@Introspected
public class LambdaEntryPointHandler implements RequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse>{
    private static final Logger log = LoggerFactory.getLogger(GithubAdapter.class);
    
    private final ApplicationContext applicationContext;
    private final AuthLambdaHandler authLambdaHandler;
    private final GithubUserLambdaHandler userLambdaHandler;
    private final GithubRepoLambdaHandler repoLambdaHandler;

    @Inject
    public LambdaEntryPointHandler() {
        this.applicationContext = ApplicationContext.builder(Environment.FUNCTION).start();
        this.authLambdaHandler = applicationContext.getBean(AuthLambdaHandler.class);
        this.userLambdaHandler = applicationContext.getBean(GithubUserLambdaHandler.class);
        this.repoLambdaHandler = applicationContext.getBean(GithubRepoLambdaHandler.class);
    }

    private APIGatewayV2HTTPResponse oauthHandler(String path, APIGatewayV2HTTPEvent input){
        if(path.equals("/oauth/login/github"))
            return authLambdaHandler.handleOauthLogin(input);
        else
            return authLambdaHandler.handleOAuthCallback(input);
    }

    private APIGatewayV2HTTPResponse apiHandler(String path, APIGatewayV2HTTPEvent input){
        APIGatewayV2HTTPResponse validation = authLambdaHandler.handleTokenValidation(input);

        if(validation.getStatusCode() != 200)
            return validation;
        
        switch (path) {
            case "/api/user":
                return userLambdaHandler.handleUserRequest(input);
            
            case "/api/repos":
                return repoLambdaHandler.handleUserRequest(input);
        
            default:
                return LambdaHttpUtils.createErrorResponse(404, "Not Found");
        }
    }



    @Override
    public APIGatewayV2HTTPResponse handleRequest(APIGatewayV2HTTPEvent input, Context context) {
        try {
            String path = input.getRawPath();
            log.debug("Received request for path: {}", path);

            // Handle edge case where path might be null or empty
            if (path == null || path.isEmpty() || path.equals("/")) {
                log.warn("Invalid or empty path received: {}", path);
                return LambdaHttpUtils.createErrorResponse(404, "Not Found");
            }

            String[] pathParts = path.split("/");
            // Handle edge case where path doesn't have enough parts
            if (pathParts.length < 2) {
                log.warn("Path does not have enough parts: {}", path);
                return LambdaHttpUtils.createErrorResponse(404, "Not Found");
            }

            String startingRoute = pathParts[1];
            log.debug("Starting route: {}", startingRoute);

            // Route the request to the appropriate handlers based on path
            if (startingRoute.equals("oauth")) {
                return oauthHandler(path, input);

            } else if(startingRoute.equals("api")) {
                return apiHandler(path, input);

            } else {
                log.warn("No handler found for path: {}", path);
                return LambdaHttpUtils.createErrorResponse(404, "Not Found");
            }
                
        } catch (Exception e){
            log.error("Error processing request for path: {}, error: {}", input.getRawPath(), e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, e.getMessage());
        }

    }
}
