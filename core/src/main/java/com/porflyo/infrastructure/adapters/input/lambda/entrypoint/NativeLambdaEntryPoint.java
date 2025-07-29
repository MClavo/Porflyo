package com.porflyo.infrastructure.adapters.input.lambda.entrypoint;

import java.net.MalformedURLException;

import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;

import io.micronaut.function.aws.runtime.AbstractMicronautLambdaRuntime;
import jakarta.annotation.Nullable;

/**
 * Entry point for AWS Lambda using the Micronaut framework.
 * <p>
 * This class extends {@link AbstractMicronautLambdaRuntime} to handle API Gateway V2 HTTP events and responses.
 * It sets up the Lambda runtime environment and delegates request handling to {@link LambdaEntryPointHandler}.
 * </p>
 *
 * <p>
 * Usage: This class should be specified as the main handler for the Lambda function.
 * </p>
 *
 *
 * @see AbstractMicronautLambdaRuntime
 * @see LambdaEntryPointHandler
 * 
 * @since 1.0
 */
public class NativeLambdaEntryPoint extends AbstractMicronautLambdaRuntime<
    APIGatewayV2HTTPEvent, 
    APIGatewayV2HTTPResponse, 
    APIGatewayV2HTTPEvent, 
    APIGatewayV2HTTPResponse> {
    
    public static void main(String[] args) {
        try {
            new NativeLambdaEntryPoint().run(args);
        } catch (MalformedURLException e) {
            e.printStackTrace();
        }
    }

    @Override
    @Nullable
    protected RequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse> createRequestHandler(String... args) {
        return new LambdaEntryPointHandler();
    }
}