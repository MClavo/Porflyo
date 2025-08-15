package com.porflyo.domain.model.portfolio;

import com.porflyo.domain.model.ids.PortfolioId;
import com.porflyo.domain.model.ids.UserId;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Represents a web address (URL) for a portfolio.
 */
@Serdeable
@Introspected
public record PortfolioUrl(
    UserId userId,
    PortfolioId portfolioId,
    Slug slug,
    boolean isPublic
) {}
