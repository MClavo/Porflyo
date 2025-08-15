package com.porflyo.infrastructure.adapters.output.util;

import java.util.Locale;

import com.github.slugify.Slugify;
import com.porflyo.application.ports.output.SlugGeneratorPort;
import com.porflyo.domain.model.portfolio.Slug;

import io.micronaut.context.annotation.Requires;
import jakarta.inject.Singleton;

/**
 * Generates slugs using the Slugify library.
 * This implementation ensures that slugs are URL-friendly and conform to the defined format.
 */
@Singleton
@Requires(classes = Slugify.class)
public class SlugifySlugGenerator implements SlugGeneratorPort {

    private final Slugify slugify = Slugify.builder()
            .locale(Locale.forLanguageTag("es"))
            .lowerCase(true)
            .transliterator(true)
            .build();

    @Override
    public Slug normalize(String text) {
        String base = slugify.slugify(text);
        return new Slug(base.length() > 64 ? base.substring(0, 64) : base);
    }
}