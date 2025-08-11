package com.porflyo.application.ports.output;

import java.util.List;
import java.util.Optional;

import com.porflyo.application.dto.PortfolioDetailsDto;
import com.porflyo.domain.model.ids.PortfolioId;
import com.porflyo.domain.model.ids.Slug;
import com.porflyo.domain.model.ids.UserId;
import com.porflyo.domain.model.portfolio.Portfolio;

import jakarta.validation.constraints.NotNull;

public interface PortfolioRepository {
    
    @NotNull Portfolio save(UserId userId, PortfolioDetailsDto portfolio);
    @NotNull Optional<Portfolio> findById(PortfolioId id);

    @NotNull List<Portfolio> findByUserId(UserId userId);

    @NotNull Portfolio patch(
        @NotNull UserId userId,
        @NotNull PortfolioId portfolioId,
        @NotNull PortfolioDetailsDto patch
    );

    @NotNull Portfolio setSlugAndVisibility(UserId userId, PortfolioId id, Slug slug, boolean published);

    void delete(UserId userId, PortfolioId portfolioId);
}
