package com.porflyo.infrastructure.configuration;

import io.micronaut.context.annotation.ConfigurationProperties;

@ConfigurationProperties("quota")
public record QuotaConfig (
    int maxSavedSections,
    int maxPortfolios
) {}
