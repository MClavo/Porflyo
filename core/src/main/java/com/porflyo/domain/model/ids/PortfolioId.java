package com.porflyo.domain.model.ids;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record PortfolioId(String value) {
    public PortfolioId {
        value = Ids.require(value, "PortfolioId");
    }

    public static PortfolioId newKsuid() { return new PortfolioId(Ids.ksuid()); }
}