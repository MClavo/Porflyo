package com.porflyo.application.ports.output;

import java.util.List;
import java.util.Optional;

import com.porflyo.application.dto.PortfolioPatchDto;
import com.porflyo.domain.model.ids.PortfolioId;
import com.porflyo.domain.model.ids.UserId;
import com.porflyo.domain.model.portfolio.Portfolio;
import com.porflyo.domain.model.portfolio.Slug;

import jakarta.validation.constraints.NotNull;

public interface PortfolioRepository {

    void save(@NotNull Portfolio portfolio);

    @NotNull Optional<Portfolio> findById(UserId userId, PortfolioId id);

    @NotNull List<Portfolio> findByUserId(UserId userId);

    @NotNull Portfolio patch(
        @NotNull UserId userId,
        @NotNull PortfolioId portfolioId,
        @NotNull PortfolioPatchDto patch
    );

    @NotNull Portfolio setSlugAndVisibility(UserId userId, PortfolioId id, Slug slug, boolean published);

    void delete(UserId userId, PortfolioId portfolioId);
}
