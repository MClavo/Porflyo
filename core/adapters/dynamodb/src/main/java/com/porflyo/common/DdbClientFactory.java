package com.porflyo.common;

import java.net.URI;
import java.time.Duration;

import com.porflyo.configuration.DdbConfig;

import io.micronaut.context.annotation.Factory;
import io.micronaut.context.annotation.Requires;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.retries.StandardRetryStrategy;
import software.amazon.awssdk.retries.api.BackoffStrategy;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

/**
 * Supplies a shared {@link DynamoDbClient} for the entire application.
 *
 */
@Factory
@Requires(beans = DdbConfig.class) // Only loads if DynamoDbConfig is available
public class DdbClientFactory {

    private final DdbConfig cfg;

    @Inject
    public DdbClientFactory(DdbConfig dynamoDbConfig) {
        this.cfg = dynamoDbConfig;
    }


    // Backoff strategies with jittered exponential for non-throttling and throttling.
    private BackoffStrategy nonThrottling =
        BackoffStrategy.exponentialDelay(Duration.ofMillis(200), Duration.ofSeconds(5));
    private BackoffStrategy throttling =
        BackoffStrategy.exponentialDelay(Duration.ofSeconds(1), Duration.ofSeconds(15));

    // STANDARD retry with custom tuning 
    private StandardRetryStrategy standard =
        StandardRetryStrategy.builder()
                .maxAttempts(8) // 1 initial try + 7 retries
                .backoffStrategy(nonThrottling)
                .throttlingBackoffStrategy(throttling)
                .circuitBreakerEnabled(true)
                .build();


    // ────────────────────────── LOCAL ──────────────────────────

    @Singleton
    @Named("lowDynamoDbClient")
    @Requires(env = "local")
    DynamoDbClient localClient() {
        Region region = Region.of(cfg.region());

        return DynamoDbClient.builder()
            .region(region)
            .endpointOverride(URI.create(cfg.endpoint()))
            .credentialsProvider(StaticCredentialsProvider.create(
                AwsBasicCredentials.create("test","test")))
            .overrideConfiguration(o -> {o.retryStrategy(standard);})
            .httpClient(UrlConnectionHttpClient.builder().build())
            .build();
    }

    
    // ────────────────────────── PRODUCTION ──────────────────────────

    @Singleton
    @Named("lowDynamoDbClient")
    @Requires(notEnv = "local")
    DynamoDbClient prodClient() {
        Region region = Region.of(cfg.region());

        return DynamoDbClient.builder()
            .region(region)
            .credentialsProvider(DefaultCredentialsProvider.builder().build())
            .overrideConfiguration(o -> {o.retryStrategy(standard);})
            .httpClient(UrlConnectionHttpClient.builder().build())
            .build();
    }


    @Singleton
    DynamoDbEnhancedClient enhanced(@Named("lowDynamoDbClient") DynamoDbClient low) {
        return DynamoDbEnhancedClient.builder()
                .dynamoDbClient(low)
                .build();
    }
}
