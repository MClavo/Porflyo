package com.porflyo.application.services;

import java.util.List;

import com.porflyo.application.ports.input.ProviderUseCase;
import com.porflyo.application.ports.output.ProviderPort;
import com.porflyo.domain.model.provider.ProviderRepo;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
public class ProviderService implements ProviderUseCase {

    private final ProviderPort providerPort;

    @Inject
    public ProviderService(ProviderPort providerPort) {
        this.providerPort = providerPort;
    }

    @Override
    public List<ProviderRepo> getUserRepos(String accessToken) {
        return providerPort.getUserRepos(accessToken);

    }
    
}
