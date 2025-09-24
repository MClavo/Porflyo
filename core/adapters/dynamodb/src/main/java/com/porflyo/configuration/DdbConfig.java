package com.porflyo.configuration;



import io.micronaut.context.annotation.ConfigurationProperties;
import io.micronaut.core.annotation.Nullable;

@ConfigurationProperties("dynamodb")
public record DdbConfig(
    String region,      
    String tableName,
    @Nullable String endpoint
) {}