package com.porflyo.model.ids;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record UserId(String value) {
    public UserId {
        value = Ids.require(value, "UserId");
    }

    public static UserId newKsuid() { return new UserId(Ids.ksuid()); }
}
