package com.porflyo.application.ports.input;

import java.util.List;

import com.porflyo.domain.model.ids.UserId;
import com.porflyo.domain.model.provider.ProviderRepo;

/**
 * RepoUseCase interface defines the operations related to repository management,
 * specifically for retrieving user repositories from a provider.
 */
public interface RepoUseCase {
    
    List<ProviderRepo> getUserRepos(String accessToken);
    
    List<ProviderRepo> getUserRepos(UserId userId);
}
