package com.porflyo.web.controller;

import static io.micronaut.security.oauth2.endpoint.token.response.OauthAuthenticationMapper.ACCESS_TOKEN_KEY;

import com.porflyo.infraestructure.github.GithubApiClient;

import io.micronaut.http.HttpHeaderValues;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.scheduling.TaskExecutors;
import io.micronaut.scheduling.annotation.ExecuteOn;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.authentication.Authentication;
import io.micronaut.security.rules.SecurityRule;


@Controller("/user")
public class UserController {

    private final GithubApiClient githubApiClient;

    public UserController(GithubApiClient githubApiClient) {
        this.githubApiClient = githubApiClient;
    }

    @Get
    @Secured(SecurityRule.IS_AUTHENTICATED)
    @ExecuteOn(TaskExecutors.BLOCKING)
    Object index(Authentication authentication) {
        return githubApiClient.getUser(authorizationValue(authentication));
    }

    private String authorizationValue(Authentication authentication) {
        Object claim = authentication.getAttributes().get(ACCESS_TOKEN_KEY);
        if (claim instanceof String) {
            return HttpHeaderValues.AUTHORIZATION_PREFIX_BEARER + ' ' + claim;
        }

        return null;
    }
}