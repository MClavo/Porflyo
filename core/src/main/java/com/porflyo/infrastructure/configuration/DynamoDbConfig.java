package com.porflyo.infrastructure.configuration;

import io.micronaut.context.annotation.ConfigurationProperties;

@ConfigurationProperties("dynamodb")
public record DynamoDbConfig(
    String region,      
    String tableName,
    String endpoint
) {}
