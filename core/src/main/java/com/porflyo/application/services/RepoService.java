package com.porflyo.application.services;

import java.util.List;

import com.porflyo.application.ports.input.RepoUseCase;
import com.porflyo.application.ports.output.GithubPort;
import com.porflyo.domain.model.GithubRepo;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

// TODO: Implement repository management when persistence is available
@Singleton
public class RepoService implements RepoUseCase {

    private final GithubPort githubPort;

    @Inject
    public RepoService(GithubPort githubPort) {
        this.githubPort = githubPort;
    }

    @Override
    public List<GithubRepo> getUserRepos(String accessToken) {
        try {
            return githubPort.getUserRepos(accessToken);
        } catch (RuntimeException e) {
            // Handle exceptions related to repository retrieval
            throw new RuntimeException("Failed to retrieve repositories: " + e.getMessage(), e);
        }
    }
    
}
