package com.porflyo.application.ports.input;

import java.util.List;

import com.porflyo.domain.model.ids.UserId;
import com.porflyo.domain.model.provider.ProviderRepo;

import jakarta.validation.constraints.NotNull;

/**
 * RepoUseCase interface defines the operations related to repository retrieval,
 * specifically for retrieving user repositories from a provider.
 */
public interface ProviderUseCase {
    List<ProviderRepo> getUserRepos(@NotNull UserId userId);
}
