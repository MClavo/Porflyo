package com.porflyo.application.services;

import java.util.List;

import com.porflyo.application.ports.input.ProviderUseCase;
import com.porflyo.application.ports.output.ProviderPort;
import com.porflyo.application.ports.output.UserRepository;
import com.porflyo.domain.exceptions.user.UserNotFoundException;
import com.porflyo.domain.model.ids.UserId;
import com.porflyo.domain.model.provider.ProviderRepo;
import com.porflyo.domain.model.user.User;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
public class ProviderService implements ProviderUseCase {

    private final UserRepository userRepository;
    private final ProviderPort providerPort;

    @Inject
    public ProviderService(UserRepository userRepository, ProviderPort providerPort) {
        this.userRepository = userRepository;
        this.providerPort = providerPort;
    }

    @Override
    public List<ProviderRepo> getUserRepos(UserId userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));

        String token = user.provider().providerAccessToken();

        return providerPort.getUserRepos(token);

    }
    
}
