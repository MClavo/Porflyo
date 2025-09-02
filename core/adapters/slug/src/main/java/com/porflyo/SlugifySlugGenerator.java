package com.porflyo;

import java.util.Locale;

import com.github.slugify.Slugify;
import com.porflyo.model.portfolio.Slug;
import com.porflyo.ports.output.SlugGeneratorPort;

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
            .locale(Locale.forLanguageTag("en"))
            .lowerCase(true)
            .transliterator(false)
            .build();

    @Override
    public Slug normalize(String text) {
        String base = slugify.slugify(text);
        return new Slug(base.length() > 64 ? base.substring(0, 64) : base);
    }
}