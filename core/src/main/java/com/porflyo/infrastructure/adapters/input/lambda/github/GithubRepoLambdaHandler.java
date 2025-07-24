package com.porflyo.infrastructure.adapters.input.lambda.github;

import java.util.List;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.application.ports.input.RepoUseCase;
import com.porflyo.application.ports.output.JwtPort;
import com.porflyo.domain.model.GithubLoginClaims;
import com.porflyo.domain.model.GithubRepo;
import com.porflyo.infrastructure.adapters.input.lambda.utils.LambdaHttpUtils;

import jakarta.inject.Inject;

public class GithubRepoLambdaHandler {

    private final RepoUseCase repoService;
    private final JwtPort jwtService;

    @Inject
    public GithubRepoLambdaHandler(RepoUseCase repoService, JwtPort jwtService) {
        this.repoService = repoService;
        this.jwtService = jwtService;
    }

    public APIGatewayV2HTTPResponse handleUserRequest(APIGatewayV2HTTPEvent input) {
        try {
            // Extract cookie and claims
            String cookie = LambdaHttpUtils.extractCookieValue(input, "session");
            GithubLoginClaims claims = jwtService.extractClaims(cookie);

            // Get user data
            List<GithubRepo> repos = repoService.getUserRepos(claims.getAccessToken());
            return LambdaHttpUtils.createResponse(200, repos.toString());

        } catch (Exception e) {
            return LambdaHttpUtils.createErrorResponse(500, e.getMessage());
        }
    }
}
