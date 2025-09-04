package com.porflyo;

import com.porflyo.ports.SlugGeneratorPort;
import com.porflyo.ports.SlugGeneratorPortContract;

import io.micronaut.context.annotation.Property;
import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import jakarta.inject.Inject;

@MicronautTest(environments = "slug-integration")
@Property(name = "micronaut.banner.enabled", value = "false")
class SlugifySlugGeneratorIntegrationTest extends SlugGeneratorPortContract {

    @Inject
    SlugifySlugGeneratorIntegrationTest(SlugGeneratorPort slugGeneratorPort) {
        super(slugGeneratorPort);
    }
}
