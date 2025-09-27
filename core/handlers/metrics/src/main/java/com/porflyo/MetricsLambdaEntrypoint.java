package com.porflyo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;

import io.micronaut.context.ApplicationContext;
import io.micronaut.context.env.Environment;
import io.micronaut.function.aws.MicronautRequestHandler;
import jakarta.inject.Inject;

public class MetricsLambdaEntrypoint extends MicronautRequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse>{
    private static final Logger log = LoggerFactory.getLogger(MetricsLambdaEntrypoint.class);
    
    private final ApplicationContext applicationContext;
    //private final AuthLambdaHandler authLambdaHandler;


    @Inject
    public MetricsLambdaEntrypoint() {
        this.applicationContext = ApplicationContext.
            builder(Environment.FUNCTION)
            .deduceEnvironment(false)
            .start();
        //this.authLambdaHandler = applicationContext.getBean(AuthLambdaHandler.class);

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
            

            return processRequest(input, path);

        } catch (Exception e){
            log.error("Error processing request for path: {}, error: {}", input.getRawPath(), e.getMessage(), e);
            return LambdaExceptionTranslator.toResponse(e, input);
        }
        
    }


    // ────────────────────────── Gateway ──────────────────────────

    private APIGatewayV2HTTPResponse processRequest(APIGatewayV2HTTPEvent input, String path) {
        String method = LambdaHttpUtils.getMethod(input);
        
        // Route the request to the appropriate handlers based on path
        switch (method) {
            /* case "oauth":
                return oauthHandler(path, input); */
            
            case "get":
                // TODO: should be validated by lambda authorizer with current user jwt etc.
            
            case "post":
                // TODO:
                
            
            default:
                log.warn("No handler found for path: {}", path);
                return LambdaHttpUtils.createErrorResponse(404, "Not Found");
        }
    }


    //  ────────────────────────── Metrics ──────────────────────────
    // only if needed, else remove this method
    private APIGatewayV2HTTPResponse MetricsHandler(String path, APIGatewayV2HTTPEvent input){
        // Simulate API Gateway token validation,
        // SAM can not replicate the API Gateway's token validation process
        // authLambdaHandler.handleTokenValidation(input);     // Throws AuthException if token is invalid

        // Extract the route from the path
        String route = LambdaHttpUtils.extractPathSegment(input, 1); // Extracts {segment} of /api/{segment}/whatever

        switch (route.toLowerCase()) {
            

            default:
                return LambdaHttpUtils.createErrorResponse(404, "Not Found");
        }
    }
}
