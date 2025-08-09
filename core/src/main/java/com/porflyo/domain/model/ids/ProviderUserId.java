package com.porflyo.domain.model.ids;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record ProviderUserId(String value) {
    public ProviderUserId {
        value = Ids.require(value, "ProviderUserId");
    }
}
