package com.porflyo.infrastructure.configuration;

import java.util.Optional;

import io.micronaut.context.annotation.ConfigurationProperties;

@ConfigurationProperties("dynamodb")
public record DynamoDbConfig(
    String region,      
    String tableName,
    Optional<String> endpoint
) {}
