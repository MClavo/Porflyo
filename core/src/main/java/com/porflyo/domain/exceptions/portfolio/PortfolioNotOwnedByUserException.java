package com.porflyo.domain.exceptions.portfolio;

import com.porflyo.domain.model.ids.PortfolioId;
import com.porflyo.domain.model.ids.UserId;

public final class PortfolioNotOwnedByUserException extends PortfolioException {
    private final UserId userId;
    private final PortfolioId portfolioId;

    public PortfolioNotOwnedByUserException(UserId userId, PortfolioId portfolioId) {
        super(403, "portfolio_not_owned", "Portfolio " + portfolioId.value() + " is not owned by user " + userId.value());
        this.userId = userId; this.portfolioId = portfolioId;
    }
    public UserId userId() { return userId; }
    public PortfolioId portfolioId() { return portfolioId; }
}
