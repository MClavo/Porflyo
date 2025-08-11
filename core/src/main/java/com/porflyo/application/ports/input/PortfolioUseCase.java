package com.porflyo.application.ports.input;

import java.util.List;
import java.util.Optional;

import com.porflyo.application.dto.PortfolioDetailsDto;
import com.porflyo.domain.model.ids.PortfolioId;
import com.porflyo.domain.model.ids.Slug;
import com.porflyo.domain.model.ids.UserId;
import com.porflyo.domain.model.portfolio.Portfolio;

import jakarta.validation.constraints.NotNull;

public interface PortfolioUseCase {
    Portfolio createDraft(UserId userId, PortfolioDetailsDto portfolio);

    Optional<Portfolio> findById(PortfolioId id);

    List<Portfolio> listByOwner(UserId userId);

    Portfolio patchPortfolio(
        @NotNull UserId userId,
        @NotNull PortfolioId portfolioId,
        @NotNull PortfolioDetailsDto patch
    );

    Portfolio setSlugAndVisibility(UserId userId, PortfolioId id, Slug slug, boolean published);

    void delete(UserId userId, PortfolioId portfolioId);
}
