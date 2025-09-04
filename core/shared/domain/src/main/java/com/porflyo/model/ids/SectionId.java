package com.porflyo.model.ids;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record SectionId(String value) {
    public SectionId {
        value = Ids.require(value, "SectionId");
    }

    public static SectionId newKsuid() { return new SectionId(Ids.ksuid()); }
}

