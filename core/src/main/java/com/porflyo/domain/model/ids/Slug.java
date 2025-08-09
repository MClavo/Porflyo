package com.porflyo.domain.model.ids;

public record Slug(String value) {
    public Slug {
        value = Ids.require(value, "Slug");
        if (!value.matches("[a-z0-9-]{3,64}"))
            throw new IllegalArgumentException("Invalid slug");
    }
}
