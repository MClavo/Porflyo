package com.porflyo.services;

import java.util.List;

import com.porflyo.ports.input.ProviderUseCase;
import com.porflyo.ports.output.ProviderPort;
import com.porflyo.ports.output.UserRepository;
import com.porflyo.exceptions.user.UserNotFoundException;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.provider.ProviderRepo;
import com.porflyo.model.user.User;

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
