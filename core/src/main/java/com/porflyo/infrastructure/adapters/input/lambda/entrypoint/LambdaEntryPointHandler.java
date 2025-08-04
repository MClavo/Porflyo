package com.porflyo.infrastructure.adapters.input.lambda.entrypoint;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.infrastructure.adapters.input.lambda.api.GithubRepoLambdaHandler;
import com.porflyo.infrastructure.adapters.input.lambda.api.UserLambdaHandler;
import com.porflyo.infrastructure.adapters.input.lambda.auth.AuthLambdaHandler;
import com.porflyo.infrastructure.adapters.input.lambda.utils.LambdaHttpUtils;
import com.porflyo.infrastructure.adapters.output.github.GithubAdapter;

import io.micronaut.context.ApplicationContext;
import io.micronaut.context.env.Environment;
import io.micronaut.function.aws.MicronautRequestHandler;
import jakarta.inject.Inject;


/**
 * DEVis entry point for AWS Lambda requests in a Micronaut-based application.
 * It extends {@link MicronautRequestHandler} to process {@link APIGatewayV2HTTPEvent} events and produce {@link APIGatewayV2HTTPResponse} responses.
 * <p>
 * The handler routes incoming HTTP requests based on their path to appropriate sub-handlers:
 * <ul>
 *   <li><b>OAuth endpoints</b> (e.g., <code>/oauth/login/github</code>, <code>/oauth/callback/github</code>) are handled by {@link AuthLambdaHandler}.</li>
 *   <li><b>API endpoints</b> (e.g., <code>/api/user</code>, <code>/api/repos</code>) are handled by {@link UserLambdaHandler} and {@link GithubRepoLambdaHandler}.</li>
 * </ul>
 * <p>
 * Token validation is performed for API endpoints before delegating to user or repo handlers.
 */
public class LambdaEntryPointHandler extends MicronautRequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse>{
    private static final Logger log = LoggerFactory.getLogger(GithubAdapter.class);
    
    private final ApplicationContext applicationContext;
    private final AuthLambdaHandler authLambdaHandler;
    private final UserLambdaHandler userLambdaHandler;
    private final GithubRepoLambdaHandler repoLambdaHandler;

    @Inject
    public LambdaEntryPointHandler() {
        this.applicationContext = ApplicationContext.
            builder(Environment.FUNCTION)
            .deduceEnvironment(false)
            .start();
        this.authLambdaHandler = applicationContext.getBean(AuthLambdaHandler.class);
        this.userLambdaHandler = applicationContext.getBean(UserLambdaHandler.class);
        this.repoLambdaHandler = applicationContext.getBean(GithubRepoLambdaHandler.class);
    }

    private APIGatewayV2HTTPResponse oauthHandler(String path, APIGatewayV2HTTPEvent input){
        
        if(path.equals("/oauth/login/github"))
            return authLambdaHandler.handleOauthLogin(input);
        else
            return authLambdaHandler.handleOAuthCallback(input);

    }

    private APIGatewayV2HTTPResponse apiHandler(String path, APIGatewayV2HTTPEvent input){
        // Simulate API Gateway token validation,
        // SAM can not replicate the API Gateway's token validation process
        APIGatewayV2HTTPResponse validation = authLambdaHandler.handleTokenValidation(input);

        if(validation.getStatusCode() != 200)
            return validation;

        // Extract the route from the path
        String route = LambdaHttpUtils.extractPathSegment(input, 1); // Extracts {segment} of /api/{segment}/whatever

        switch (route) {
            case "user":
                return userLambdaHandler.handleUserRequest(input);

            case "repos":
                return repoLambdaHandler.handleUserRequest(input);
        
            default:
                return LambdaHttpUtils.createErrorResponse(404, "Not Found");
        }
    }


    @Override
    public APIGatewayV2HTTPResponse execute(APIGatewayV2HTTPEvent input) {
        try {
            String path = input.getRawPath();
            log.debug("Received request for path: {}", path);

            // Handle edge case where path might be null or empty
            if (path == null || path.isEmpty() || path.equals("/")) {
                log.warn("Invalid or empty path received: {}", path);
                return LambdaHttpUtils.createErrorResponse(404, "Not Found");
            }

            String[] pathParts = path.split("/");
            String startingRoute = pathParts[1];

            // Route the request to the appropriate handlers based on path
            switch (startingRoute) {
                case "oauth":
                    return oauthHandler(path, input);

                case "api":
                    return apiHandler(path, input);

                default:
                    log.warn("No handler found for path: {}", path);
                    return LambdaHttpUtils.createErrorResponse(404, "Not Found");
            }

        } catch (Exception e){
            log.error("Error processing request for path: {}, error: {}", input.getRawPath(), e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, e.getMessage());
        }

    }
}
