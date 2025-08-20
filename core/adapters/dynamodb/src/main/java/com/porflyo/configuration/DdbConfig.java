package com.porflyo.configuration;

import io.micronaut.context.annotation.ConfigurationProperties;
import io.micronaut.context.annotation.Requires;

@ConfigurationProperties("dynamodb")
@Requires(property = "dynamodb.endpoint")
public record DdbConfig(
    String region,      
    String tableName,
    String endpoint
) {}
