package com.porflyo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.handler.MediaLambdaHandler;
import com.porflyo.handler.PortfolioLambdaHandler;
import com.porflyo.handler.ProviderRepoLambdaHandler;
import com.porflyo.handler.PublicPortfolioLambdaHandler;
import com.porflyo.handler.SavedSectionLambdaHandler;
import com.porflyo.handler.UserLambdaHandler;

import io.micronaut.context.ApplicationContext;
import io.micronaut.context.env.Environment;
import io.micronaut.function.aws.MicronautRequestHandler;
import jakarta.inject.Inject;

public class ApiLambdaEntrypoint extends MicronautRequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse>{
    private static final Logger log = LoggerFactory.getLogger(ApiLambdaEntrypoint.class);
    
    private final ApplicationContext applicationContext;
    //private final AuthLambdaHandler authLambdaHandler;
    private final UserLambdaHandler userLambdaHandler;
    private final ProviderRepoLambdaHandler repoLambdaHandler;
    private final MediaLambdaHandler mediaLambdaHandler;
    private final PortfolioLambdaHandler portfolioLambdaHandler;
    private final PublicPortfolioLambdaHandler publicPortfolioLambdaHandler;
    private final SavedSectionLambdaHandler savedSectionLambdaHandler;

    @Inject
    public ApiLambdaEntrypoint() {
        this.applicationContext = ApplicationContext.
            builder(Environment.FUNCTION)
            .deduceEnvironment(false)
            .start();
        //this.authLambdaHandler = applicationContext.getBean(AuthLambdaHandler.class);
        this.userLambdaHandler = applicationContext.getBean(UserLambdaHandler.class);
        this.repoLambdaHandler = applicationContext.getBean(ProviderRepoLambdaHandler.class);
        this.mediaLambdaHandler = applicationContext.getBean(MediaLambdaHandler.class);
        this.portfolioLambdaHandler = applicationContext.getBean(PortfolioLambdaHandler.class);
        this.publicPortfolioLambdaHandler = applicationContext.getBean(PublicPortfolioLambdaHandler.class);
        this.savedSectionLambdaHandler = applicationContext.getBean(SavedSectionLambdaHandler.class);
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
            
            //String[] pathParts = path.split("/");
            //String startingRoute = pathParts[1];

            return processRequest(input, path);

        } catch (Exception e){
            log.error("Error processing request for path: {}, error: {}", input.getRawPath(), e.getMessage(), e);
            return LambdaExceptionTranslator.toResponse(e, input);
        }
        
    }


    // ────────────────────────── Gateway ──────────────────────────

    private APIGatewayV2HTTPResponse processRequest(APIGatewayV2HTTPEvent input, String path) {
        String[] pathParts = path.split("/");
        String startingRoute = pathParts[1];
        
        // Route the request to the appropriate handlers based on path
        switch (startingRoute) {
            /* case "oauth":
                return oauthHandler(path, input); */
            
            case "api":
                return apiHandler(path, input);
            
            case "public":
                return publicPortfolioLambdaHandler.handlePublicPortfolioRequest(input);
            
            /* case "logout":
                return authLambdaHandler.handleLogout(input); */
            
            default:
                log.warn("No handler found for path: {}", path);
                return LambdaHttpUtils.createErrorResponse(404, "Not Found");
        }
    }


    //  ────────────────────────── API ──────────────────────────
    
    private APIGatewayV2HTTPResponse apiHandler(String path, APIGatewayV2HTTPEvent input){
        // Simulate API Gateway token validation,
        // SAM can not replicate the API Gateway's token validation process
        // authLambdaHandler.handleTokenValidation(input);     // Throws AuthException if token is invalid

        // Extract the route from the path
        String route = LambdaHttpUtils.extractPathSegment(input, 1); // Extracts {segment} of /api/{segment}/whatever

        switch (route.toLowerCase()) {
            case "user":
                return userLambdaHandler.handleUserRequest(input);

            case "repos":
                return repoLambdaHandler.handleUserRequest(input);
            
            case "media":
                return mediaLambdaHandler.handleMediaRequest(input);
            
            case "portfolios":
                return portfolioLambdaHandler.handlePortfolioRequest(input);
            
            case "sections":
                return savedSectionLambdaHandler.handleSavedSectionRequest(input);

            default:
                return LambdaHttpUtils.createErrorResponse(404, "Not Found");
        }
    }
}
