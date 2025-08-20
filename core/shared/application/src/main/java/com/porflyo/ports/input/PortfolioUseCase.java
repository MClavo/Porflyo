package com.porflyo.ports.input;

import java.util.List;
import java.util.Optional;

import com.porflyo.dto.PortfolioPatchDto;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.portfolio.Portfolio;

import jakarta.validation.constraints.NotNull;

public interface PortfolioUseCase {
    void createDraft(Portfolio portfolio);

    Optional<Portfolio> findById(UserId userId, PortfolioId portfolioId);

    List<Portfolio> listByOwner(UserId userId);

    Portfolio patchPortfolio(
        @NotNull UserId userId,
        @NotNull PortfolioId portfolioId,
        @NotNull PortfolioPatchDto patch
    );

    Portfolio setUrlAndVisibility(UserId userId, PortfolioId id, String urlString, boolean published);

    void delete(UserId userId, PortfolioId portfolioId);
}
