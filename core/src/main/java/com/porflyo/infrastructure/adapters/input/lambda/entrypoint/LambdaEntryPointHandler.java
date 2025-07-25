package com.porflyo.infrastructure.adapters.input.lambda.entrypoint;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.infrastructure.adapters.input.lambda.auth.AuthLambdaHandler;
import com.porflyo.infrastructure.adapters.input.lambda.github.GithubRepoLambdaHandler;
import com.porflyo.infrastructure.adapters.input.lambda.github.GithubUserLambdaHandler;
import com.porflyo.infrastructure.adapters.input.lambda.utils.LambdaHttpUtils;

import io.micronaut.context.ApplicationContext;
import io.micronaut.context.env.Environment;
import io.micronaut.core.annotation.Introspected;
import jakarta.inject.Inject;

@Introspected
public class LambdaEntryPointHandler implements RequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse>{
    
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
        if(path == "/auth/login")
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

            String startingRoute = path.split("/")[1];


            // Route the request to the appropriate handlers based on path
            if (startingRoute == "auth") {
                return oauthHandler(path, input);

            } if(startingRoute == "api") {
                return apiHandler(path, input);

            } else {
                return LambdaHttpUtils.createErrorResponse(404, "Not Found");
            }
                
        } catch (Exception e){
            return LambdaHttpUtils.createErrorResponse(500, e.getMessage());
        }

    }
}
