package com.porflyo.application.services;

import com.porflyo.application.ports.input.UserUseCase;
import com.porflyo.application.ports.output.GithubPort;
import com.porflyo.domain.model.GithubUser;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

// TODO: Implement user management when persistence is available
@Singleton
public class UserService implements UserUseCase{

    private final GithubPort githubPort;

    @Inject
    public UserService(GithubPort githubPort) {
        this.githubPort = githubPort;
    }

    @Override
    public GithubUser getUserData(String accessToken) {
        try {
            return githubPort.getUserData(accessToken);
        } catch (RuntimeException e) {
            // Handle exceptions related to user data retrieval
            throw new RuntimeException("Failed to retrieve user data: " + e.getMessage(), e);
        }

    }
    
}
