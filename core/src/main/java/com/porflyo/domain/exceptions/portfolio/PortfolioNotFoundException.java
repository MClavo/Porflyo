package com.porflyo.domain.exceptions.portfolio;

import com.porflyo.domain.model.ids.PortfolioId;

public final class PortfolioNotFoundException extends PortfolioException {
    private final PortfolioId portfolioId;
    public PortfolioNotFoundException(PortfolioId portfolioId) {
        super(404, "portfolio_not_found", "Portfolio not found: " + portfolioId.value());
        this.portfolioId = portfolioId;
    }
    public PortfolioId portfolioId() { return portfolioId; }
}