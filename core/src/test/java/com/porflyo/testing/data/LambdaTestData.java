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

    /**
     * Creates an APIGatewayV2HTTPEvent with a session cookie.
     *
     * @param sessionToken the JWT token to include in the session cookie
     * @return an APIGatewayV2HTTPEvent with the session cookie
     */
    public static APIGatewayV2HTTPEvent createEventWithSessionCookie(String sessionToken) {
        APIGatewayV2HTTPEvent event = createBasicApiGatewayEvent();
        Map<String, String> headers = Map.of("Cookie", "session=" + sessionToken);
        event.setHeaders(headers);
        return event;
    }

    /**
     * Creates an APIGatewayV2HTTPEvent with the default session cookie.
     *
     * @return an APIGatewayV2HTTPEvent with the default session cookie
     */
    public static APIGatewayV2HTTPEvent createEventWithDefaultSessionCookie() {
        return createEventWithSessionCookie(TestData.DEFAULT_JWT_TOKEN);
    }

    /**
     * Creates an APIGatewayV2HTTPEvent with multiple cookies.
     *
     * @param cookies a map of cookie names to values
     * @return an APIGatewayV2HTTPEvent with the specified cookies
     */
    public static APIGatewayV2HTTPEvent createEventWithCookies(Map<String, String> cookies) {
        APIGatewayV2HTTPEvent event = createBasicApiGatewayEvent();
        StringBuilder cookieHeader = new StringBuilder();
        cookies.forEach((name, value) -> {
            if (cookieHeader.length() > 0) {
                cookieHeader.append("; ");
            }
            cookieHeader.append(name).append("=").append(value);
        });
        Map<String, String> headers = Map.of("Cookie", cookieHeader.toString());
        event.setHeaders(headers);
        return event;
    }

    /**
     * Creates an APIGatewayV2HTTPEvent with no cookies (empty headers).
     *
     * @return an APIGatewayV2HTTPEvent with no cookies
     */
    public static APIGatewayV2HTTPEvent createEventWithNoCookies() {
        APIGatewayV2HTTPEvent event = createBasicApiGatewayEvent();
        event.setHeaders(Map.of());
        return event;
    }
}
