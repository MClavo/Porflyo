package com.porflyo.model.portfolio;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Represents a slug (URL-friendly identifier) for a portfolio.
 */
@Serdeable
@Introspected
public record Slug(String value) {

    public static final int MIN_LEN = 3;
    public static final int MAX_LEN = 64;

    // Only lowercase letters, digits, and dashes
    private static final String REGEX = "^[a-z0-9-]{" + MIN_LEN + "," + MAX_LEN + "}$";

    public Slug {
        value = require(value, "Slug");

        if (!value.matches(REGEX)) {
            throw new IllegalArgumentException("Invalid slug format");
        }
    }

    private static String require(String v, String name) {
        if (v == null) throw new IllegalArgumentException(name + " is null");
        if (v.isBlank()) throw new IllegalArgumentException(name + " is blank");
        return v;
    }
}
