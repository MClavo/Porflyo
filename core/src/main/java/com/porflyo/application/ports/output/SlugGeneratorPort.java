package com.porflyo.application.ports.output;

import com.porflyo.domain.model.portfolio.Slug;

import io.micronaut.core.annotation.NonNull;

public interface SlugGeneratorPort {
    @NonNull Slug normalize(@NonNull String text);
}
