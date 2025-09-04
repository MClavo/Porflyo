package com.porflyo;


import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;


/**
 * Utility class for creating and handling HTTP responses and extracting parameters
 * for AWS Lambda functions integrated with API Gateway HTTP APIs.
 * <p>
 * Provides methods to:
 * <ul>
 *   <li>Create standard JSON HTTP responses with customizable status codes and bodies.</li>
 *   <li>Create error responses with JSON-escaped error messages.</li>
 *   <li>Create redirect responses, including support for setting cookies.</li>
 *   <li>Extract cookie values and query parameters from incoming API Gateway events.</li>
 * </ul>
 * All responses are compatible with {@link APIGatewayV2HTTPResponse} and include
 * appropriate headers for CORS and content type.
 * </p>
 * <p>
 * This class is not intended to be instantiated.
 * </p>
 */
public final class LambdaHttpUtils {

    /**
     * Creates a standard JSON HTTP response for AWS API Gateway HTTP APIs.
     *
     * @param statusCode the HTTP status code to be set in the response
     * @param body       the JSON-formatted body of the response
     * @return an {@link APIGatewayV2HTTPResponse} representing the HTTP response
     */
    public static APIGatewayV2HTTPResponse createResponse(int statusCode, String body) {
        return APIGatewayV2HTTPResponse.builder()
                .withStatusCode(statusCode)
                .withHeaders(defaultJsonHeaders())
                .withBody(body)
                .build();
    }

    /**
     * Creates an error response for AWS API Gateway HTTP APIs with the specified
     * status code and error message.
     *
     * @param statusCode   the HTTP status code to be set in the response
     * @param errorMessage the error message to include in the response body; will
     *                     be JSON-escaped
     * @return an {@link APIGatewayV2HTTPResponse} containing the error message in
     *         JSON format
     */
    public static APIGatewayV2HTTPResponse createErrorResponse(int statusCode, String errorMessage) {
        String message = String.format("{\"error\": \"%s\"}", escapeJson(errorMessage));
        return createResponse(statusCode, message);
    }

    /**
     * Creates a redirect response for AWS API Gateway HTTP APIs with the specified
     * location.
     *
     * @param location the URL to redirect to
     * @return an {@link APIGatewayV2HTTPResponse} representing the redirect
     *         response
     */
    public static APIGatewayV2HTTPResponse createRedirectResponse(String location) {
        return APIGatewayV2HTTPResponse.builder()
                .withStatusCode(302)
                .withHeaders(Map.of("Location", location))
                .build();
    }

    /**
     * Creates a redirect response for AWS API Gateway HTTP APIs with the specified
     * location and a cookie.
     *
     * @param location    the URL to redirect to
     * @param cookieName  the name of the cookie to set
     * @param cookieValue the value of the cookie to set
     * @param maxAge      the maximum age of the cookie in seconds
     * @return an {@link APIGatewayV2HTTPResponse} representing the redirect
     *         response with the cookie
     */
    public static APIGatewayV2HTTPResponse createRedirectResponseWithCookie(
            String location,
            String body,
            String cookieName,
            String cookieValue,
            long maxAge) {

        String cookie = formatCookie(cookieName, cookieValue, maxAge);

        return APIGatewayV2HTTPResponse.builder()
                .withStatusCode(302)
                .withHeaders(Map.of(
                        "Location", location,
                        "Set-Cookie", cookie))
                .withBody(body)
                .build();
    }

    /**
     * Creates an error redirect response for AWS API Gateway HTTP APIs with the specified
     * location and error message.
     *
     * @param code        the HTTP status code to be set in the response
     * @param location    the URL to redirect to
     * @param errorMessage the error message to include in the response body; will
     *                     be JSON-escaped
     * @return an {@link APIGatewayV2HTTPResponse} representing the error redirect response
     */
    public static APIGatewayV2HTTPResponse createErrorRedirectResponse(
            int code,
            String location,
            String errorMessage) {

        return APIGatewayV2HTTPResponse.builder()
                .withStatusCode(code)
                .withHeaders(Map.of("Location", location))
                .withBody(String.format("{\"error\": \"%s\"}", escapeJson(errorMessage)))
                .build();
    }

    /**
     * Extracts the value of a cookie from the incoming API Gateway event.
     *
     * @param input      the API Gateway event
     * @param cookieName the name of the cookie to extract
     * @return the value of the cookie, or null if not found
     */
    public static String extractCookieValue(APIGatewayV2HTTPEvent input, String cookieName) {
        if (input.getCookies() == null) {
            return null;
        }
        for (String cookie : input.getCookies()) {
            if (cookie.startsWith(cookieName + "=")) {
                return cookie.substring(cookieName.length() + 1);
            }
        }
        return null;
    }


    /**
     * Extracts the value of a query parameter from the incoming API Gateway event.
     *
     * @param input      the API Gateway event
     * @param paramName  the name of the query parameter to extract
     * @return the value of the query parameter, or null if not found
     */
    public static String extractQueryParameter(APIGatewayV2HTTPEvent input, String paramName) {
        if (input.getQueryStringParameters() == null) {
            return null;
        }

        return input.getQueryStringParameters().get(paramName);
    }


    /**
     * Returns the HTTP method of the incoming API Gateway event in lowercase.
     *
     * @param input the API Gateway event
     * @return the HTTP method in lowercase, or null if not found
     */
    public static String getMethod(APIGatewayV2HTTPEvent input) {
        if (input.getRequestContext() != null && input.getRequestContext().getHttp().getMethod() != null) {
            return input.getRequestContext().getHttp().getMethod().toLowerCase();
        }
        return null;
    }


    /**
     * Extracts a specific part of the path from the incoming API Gateway event.
     *
     * @param input     the API Gateway event
     * @param position  the position of the path part to extract (0 is the first segment)
     * @return the extracted path part, or empty string if the position is invalid
     */
    public static String extractPathSegment(APIGatewayV2HTTPEvent input, int position) {
        String[] pathParts = input.getRawPath().split("/");
        int adjustedPos = position + 1; // Adjust for the leading slash in the path

        if (adjustedPos < 0 || adjustedPos >= pathParts.length)
            return ""; // Invalid position

        return pathParts[adjustedPos];
    }


    /**
     * Gets a specific path parameter from the incoming API Gateway event.
     *
     * @param input the API Gateway event
     * @param key   the name of the path parameter to extract
     * @return the value of the path parameter, or null if not found
     */
    public static String getPathParameter(APIGatewayV2HTTPEvent input, String key) {
        if (input.getPathParameters() == null) {
            return null;
        }
        return input.getPathParameters().get(key);
    }

    // ────────────────────────── helper methods ────────────────────────── 

    private static String extractFromHeader(String cookieHeader, String cookieName) {
        if (cookieHeader == null) {
            return null;
        }

        return Arrays.stream(cookieHeader.split(";"))
                .map(String::trim)
                .filter(cookie -> cookie.startsWith(cookieName + "="))
                .map(cookie -> cookie.substring((cookieName + "=").length()))
                .findFirst()
                .orElse(null);
    }

    private static Map<String, String> defaultJsonHeaders() {
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        headers.put("Access-Control-Allow-Origin", "*");
        headers.put("Access-Control-Allow-Headers", "Content-Type,Authorization");
        headers.put("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
        return headers;
    }

    private static String formatCookie(String name, String value, long maxAge) {
        return String.format(
                "%s=%s; Path=/; HttpOnly; Max-Age=%d; SameSite=Lax",
                name, value, maxAge);
    }

    private static String escapeJson(String input) {
        return input.replace("\"", "\\\"");
    }
}