package com.porflyo.ports.input;

import java.util.List;

import com.porflyo.model.ids.UserId;
import com.porflyo.model.provider.ProviderRepo;

import jakarta.validation.constraints.NotNull;

/**
 * RepoUseCase interface defines the operations related to repository retrieval,
 * specifically for retrieving user repositories from a provider.
 */
public interface ProviderUseCase {
    List<ProviderRepo> getUserRepos(@NotNull UserId userId);
}
