package com.porflyo.ports;

import com.porflyo.model.portfolio.Slug;

import io.micronaut.core.annotation.NonNull;

public interface SlugGeneratorPort {
    @NonNull Slug normalize(@NonNull String text);
}
