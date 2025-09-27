package com.porflyo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.handler.MetricsLambdaHandler;

import io.micronaut.context.ApplicationContext;
import io.micronaut.context.env.Environment;
import io.micronaut.function.aws.MicronautRequestHandler;
import jakarta.inject.Inject;

public class MetricsLambdaEntrypoint extends MicronautRequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse>{
    private static final Logger log = LoggerFactory.getLogger(MetricsLambdaEntrypoint.class);
    
    private final ApplicationContext applicationContext;
    private final MetricsLambdaHandler metricsLambdaHandler;


    @Inject
    public MetricsLambdaEntrypoint() {
        this.applicationContext = ApplicationContext.
            builder(Environment.FUNCTION)
            .deduceEnvironment(false)
            .start();
        this.metricsLambdaHandler = applicationContext.getBean(MetricsLambdaHandler.class);
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
            case "get":
                if (path.contains("/metrics")) {
                    return metricsLambdaHandler.handleMetricsRequest(input);
                }
                break;
            
            case "post":
                if (path.contains("/metrics")) {
                    return metricsLambdaHandler.handleMetricsRequest(input);
                }
                break;
                
            default:
                log.warn("Unsupported method: {} for path: {}", method, path);
                return LambdaHttpUtils.createErrorResponse(405, "Method Not Allowed");
        }
        
        log.warn("No handler found for path: {}", path);
        return LambdaHttpUtils.createErrorResponse(404, "Not Found");
    }
}
