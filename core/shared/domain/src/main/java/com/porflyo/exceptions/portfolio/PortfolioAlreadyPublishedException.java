package com.porflyo.exceptions.portfolio;

import com.porflyo.model.ids.PortfolioId;

public final class PortfolioAlreadyPublishedException extends PortfolioException {
    private final PortfolioId portfolioId;
    public PortfolioAlreadyPublishedException(PortfolioId portfolioId) {
        super(409, "portfolio_already_published", "Portfolio already published: " + portfolioId.value());
        this.portfolioId = portfolioId;
    }
    public PortfolioId portfolioId() { return portfolioId; }
}
