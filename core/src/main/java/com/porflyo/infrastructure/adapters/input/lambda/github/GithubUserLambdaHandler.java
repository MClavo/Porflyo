package com.porflyo.infrastructure.adapters.input.lambda.github;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.application.ports.input.UserUseCase;
import com.porflyo.application.ports.output.JwtPort;
import com.porflyo.domain.model.GithubLoginClaims;
import com.porflyo.domain.model.GithubUser;
import com.porflyo.infrastructure.adapters.input.lambda.utils.LambdaHttpUtils;

import io.micronaut.json.JsonMapper;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
public class GithubUserLambdaHandler {
    private final JsonMapper jsonMapper;
    private final UserUseCase userService;
    private final JwtPort jwtService;

    @Inject
    public GithubUserLambdaHandler(JsonMapper jsonMapper, UserUseCase userService, JwtPort jwtService) {
        this.jsonMapper = jsonMapper;
        this.userService = userService;
        this.jwtService = jwtService;
    }

    public APIGatewayV2HTTPResponse handleUserRequest(APIGatewayV2HTTPEvent input) {
        try {
            // Extract cookie and claims
            String cookie = LambdaHttpUtils.extractCookieValue(input, "session");
            GithubLoginClaims claims = jwtService.extractClaims(cookie);

            // Get user data
            GithubUser user = userService.getUserData(claims.getAccessToken());
            return LambdaHttpUtils.createResponse(200, jsonMapper.writeValueAsString(user));

        } catch (Exception e) {
            return LambdaHttpUtils.createErrorResponse(500, e.getMessage());
        }
    }
}
