package com.porflyo.infrastructure.configuration;

import io.micronaut.context.annotation.ConfigurationProperties;
import io.micronaut.context.annotation.Requires;

@ConfigurationProperties("s3")
@Requires(property = "s3.endpoint")
public record S3Config(
    String accessKey,
    String secretKey,
    long expiration, // in minutes
    String region,
    String bucketName,
    String endpoint
) {}
