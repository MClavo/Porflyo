package com.porflyo;


import io.micronaut.context.annotation.ConfigurationProperties;
import io.micronaut.core.annotation.Nullable;

@ConfigurationProperties("s3")
public record S3Config(
    long expiration, // in minutes
    String region,
    String bucketName,
    @Nullable String endpoint
) {}
