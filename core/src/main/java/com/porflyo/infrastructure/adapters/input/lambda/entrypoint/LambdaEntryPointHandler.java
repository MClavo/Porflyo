package com.porflyo.infrastructure.adapters.input.lambda.entrypoint;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.infrastructure.adapters.input.lambda.auth.AuthLambdaHandler;
import com.porflyo.infrastructure.adapters.input.lambda.utils.LambdaHttpUtils;

import io.micronaut.context.ApplicationContext;
import io.micronaut.context.env.Environment;
import io.micronaut.core.annotation.Introspected;
import jakarta.inject.Inject;

@Introspected
public class LambdaEntryPointHandler implements
        RequestHandler<APIGatewayV2HTTPEvent, 
        APIGatewayV2HTTPResponse>{
    
    private final ApplicationContext applicationContext;
    private final AuthLambdaHandler authLambdaHandler;

    @Inject
    public LambdaEntryPointHandler() {
        this.applicationContext = ApplicationContext.builder(Environment.FUNCTION).start();
        this.authLambdaHandler = applicationContext.getBean(AuthLambdaHandler.class);
    }

    @Override
    public APIGatewayV2HTTPResponse handleRequest(APIGatewayV2HTTPEvent input, Context context) {
        try {
            String path = input.getRawPath();

            // Route the request to the appropriate handlers based on path
            switch (path) {
                case "/auth/login":
                    return authLambdaHandler.handleOauthLogin(input);
                case "/auth/callback":
                    return authLambdaHandler.handleOAuthCallback(input);

                default:
                    return LambdaHttpUtils.createErrorResponse(404, "Not Found");
            }



        } catch (Exception e){
            return LambdaHttpUtils.createErrorResponse(500, e.getMessage());
        }

    }
}
