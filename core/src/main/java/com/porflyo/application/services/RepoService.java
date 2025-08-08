package com.porflyo.application.services;

import java.util.List;
import java.util.Optional;

import com.porflyo.application.ports.input.RepoUseCase;
import com.porflyo.application.ports.output.ProviderPort;
import com.porflyo.application.ports.output.UserRepository;
import com.porflyo.domain.model.provider.ProviderRepo;
import com.porflyo.domain.model.shared.EntityId;
import com.porflyo.domain.model.user.User;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
public class RepoService implements RepoUseCase {

    private final ProviderPort githubPort;
    private final UserRepository userRepository;

    @Inject
    public RepoService(ProviderPort githubPort, UserRepository userRepository) {
        this.githubPort = githubPort;
        this.userRepository = userRepository;
    }

    @Override
    public List<ProviderRepo> getUserRepos(String accessToken) {
        try {
            return githubPort.getUserRepos(accessToken);
        } catch (RuntimeException e) {
            // Handle exceptions related to repository retrieval
            throw new RuntimeException("Failed to retrieve repositories: " + e.getMessage(), e);
        }
    }

    @Override
    public List<ProviderRepo> getUserRepos(EntityId userId) {

        Optional<User> user = userRepository.findById(userId);

        if (user.isEmpty()) {
            throw new RuntimeException("User not found with ID: " + userId);
        }

        String accessToken = user.get().provider().providerAccessToken();
        
        return getUserRepos(accessToken);
        
    }
    
}
