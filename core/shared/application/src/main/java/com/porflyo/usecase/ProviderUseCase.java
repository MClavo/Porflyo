package com.porflyo.usecase;

import java.util.List;

import com.porflyo.exceptions.user.UserNotFoundException;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.provider.ProviderRepo;
import com.porflyo.model.user.User;
import com.porflyo.ports.ProviderPort;
import com.porflyo.ports.UserRepository;

import jakarta.inject.Inject;

public class ProviderUseCase {

    private final UserRepository userRepository;
    private final ProviderPort providerPort;

    @Inject
    public ProviderUseCase(UserRepository userRepository, ProviderPort providerPort) {
        this.userRepository = userRepository;
        this.providerPort = providerPort;
    }

    public List<ProviderRepo> getUserRepos(UserId userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));

        String token = user.provider().providerAccessToken();

        return providerPort.getUserRepos(token);

    }
    
}
