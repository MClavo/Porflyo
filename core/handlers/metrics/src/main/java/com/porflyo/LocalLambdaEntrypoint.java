package com.porflyo;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.exceptions.auth.JwtMalformedException;
import com.porflyo.usecase.AuthUseCase;

import io.micronaut.context.ApplicationContext;
import io.micronaut.context.env.Environment;
import io.micronaut.function.aws.MicronautRequestHandler;
import jakarta.inject.Inject;


/**
 * Used to simulate the API Gateway validation, sam can handle it.
 * <p>
 * If the path is for the api first tries to validate the cookie.
 */
public class LocalLambdaEntrypoint extends MicronautRequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse>{
    private final AuthUseCase authUseCase;


    @Inject
    public LocalLambdaEntrypoint() {
        this.applicationContext = ApplicationContext.
            builder(Environment.FUNCTION)
            .deduceEnvironment(false)
            .start();
        this.authUseCase = applicationContext.getBean(AuthUseCase.class);
    }

     @Override
    public APIGatewayV2HTTPResponse execute(APIGatewayV2HTTPEvent input) {
        String httpMethod = LambdaHttpUtils.getMethod(input);
        

        if(httpMethod.equals("get")){
            String token = LambdaHttpUtils.extractCookieValue(input, "session");

            if (token == null || token.trim().isEmpty()) {
                return LambdaHttpUtils.createErrorResponse(401, "Missing or empty session token");
            }

            try {
                authUseCase.verifyTokenOrThrow(token);
            } catch (JwtMalformedException e) {
                return LambdaHttpUtils.createErrorResponse(401, e.getMessage());
            }
        }

        try (MetricsLambdaEntrypoint metricsEntrypoint = new MetricsLambdaEntrypoint()) {
            return metricsEntrypoint.execute(input);
        }
    }
}
