package com.porflyo.testing.data;

import java.util.Map;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;

public class LambdaTestData {
    /**
     * Creates a basic APIGatewayV2HTTPEvent for testing.
     *
     * @return a basic APIGatewayV2HTTPEvent
     */
    public static APIGatewayV2HTTPEvent createBasicApiGatewayEvent() {
        APIGatewayV2HTTPEvent event = new APIGatewayV2HTTPEvent();
        event.setHeaders(Map.of());
        event.setQueryStringParameters(Map.of());
        return event;
    }

    /**
     * Creates an APIGatewayV2HTTPEvent with the specified query parameters.
     *
     * @param queryParams the query parameters to include
     * @return an APIGatewayV2HTTPEvent with query parameters
     */
    public static APIGatewayV2HTTPEvent createApiGatewayEventWithQuery(Map<String, String> queryParams) {
        APIGatewayV2HTTPEvent event = createBasicApiGatewayEvent();
        event.setQueryStringParameters(queryParams);
        return event;
    }

    /**
     * Creates an APIGatewayV2HTTPEvent with the OAuth authorization code.
     *
     * @param code the authorization code
     * @return an APIGatewayV2HTTPEvent with the code parameter
     */
    public static APIGatewayV2HTTPEvent createOAuthCallbackEvent(String code) {
        return createApiGatewayEventWithQuery(Map.of("code", code));
    }
}
