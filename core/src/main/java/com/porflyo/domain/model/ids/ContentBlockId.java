package com.porflyo.domain.model.ids;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record ContentBlockId(String value) {
    public ContentBlockId {
        value = Ids.require(value, "ContentBlockId");
    }

    public static ContentBlockId newKsuid() { return new ContentBlockId(Ids.ksuid()); }
}

