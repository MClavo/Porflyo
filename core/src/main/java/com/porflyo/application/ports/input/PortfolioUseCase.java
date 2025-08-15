package com.porflyo.application.ports.input;

import java.util.List;
import java.util.Optional;

import com.porflyo.application.dto.PortfolioPatchDto;
import com.porflyo.domain.model.ids.PortfolioId;
import com.porflyo.domain.model.ids.UserId;
import com.porflyo.domain.model.portfolio.Portfolio;
import com.porflyo.domain.model.portfolio.Slug;

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

    Portfolio setUrlAndVisibility(UserId userId, PortfolioId id, Slug slug, boolean published);

    void delete(UserId userId, PortfolioId portfolioId);
}
