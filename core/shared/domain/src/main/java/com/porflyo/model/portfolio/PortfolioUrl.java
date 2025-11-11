package com.porflyo.model.portfolio;

import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.ids.UserId;

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
