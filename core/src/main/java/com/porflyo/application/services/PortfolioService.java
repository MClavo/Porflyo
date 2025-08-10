package com.porflyo.application.services;

import java.util.List;
import java.util.Optional;

import com.porflyo.application.dto.PortfolioDetailsDto;
import com.porflyo.application.ports.input.PortfolioUseCase;
import com.porflyo.application.ports.output.PortfolioRepository;
import com.porflyo.domain.model.ids.PortfolioId;
import com.porflyo.domain.model.ids.Slug;
import com.porflyo.domain.model.ids.UserId;
import com.porflyo.domain.model.portfolio.Portfolio;

import jakarta.inject.Inject;
import jakarta.validation.constraints.NotNull;

public class PortfolioService implements PortfolioUseCase {

    private final PortfolioRepository portfolioRepository;

    @Inject
    public PortfolioService(PortfolioRepository portfolioRepository) {
         this.portfolioRepository = portfolioRepository; 
    }

    @Override
    public Portfolio createDraft(UserId userId, PortfolioDetailsDto portfolio) {
        return portfolioRepository.save(userId, portfolio);
    }

    @Override
    public Optional<Portfolio> findById(PortfolioId id) { return portfolioRepository.findById(id); }

    @Override
    public List<Portfolio> listByOwner(UserId userId) { return portfolioRepository.findByUserId(userId); }

    @Override
    public Portfolio patchPortfolio(
            @NotNull PortfolioId id,
            @NotNull PortfolioId portfolioId,
            @NotNull PortfolioDetailsDto patch) {

        return portfolioRepository.patchPortfolio(id, portfolioId, patch);
    }

    @Override
    public Portfolio setSlugAndVisibility(UserId userId, PortfolioId id, Slug slug, boolean published) {
        return portfolioRepository.setSlugAndVisibility(userId, id, slug, published);
    }

    @Override
    public void delete(UserId userId, PortfolioId portfolioId) {
        portfolioRepository.delete(userId, portfolioId);
    }

}
