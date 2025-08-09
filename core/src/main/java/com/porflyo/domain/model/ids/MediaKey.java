package com.porflyo.domain.model.ids;

public record MediaKey(String value) {
    public MediaKey {
        value = Ids.require(value, "MediaKey");
    }
}
