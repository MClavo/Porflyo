package com.porflyo.infrastructure.adapters.output.dynamodb.common;

import java.net.URI;
import java.time.Duration;

import com.porflyo.infrastructure.configuration.DdbConfig;

import io.micronaut.context.annotation.Factory;
import io.micronaut.context.annotation.Requires;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
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

    @Singleton
    @Named("lowDynamoDbClient")
    DynamoDbClient createDbClient() {
        Region region = Region.of(cfg.region());
        AwsBasicCredentials fakeCreds = AwsBasicCredentials.create("test", "test");

        // Backoff strategies with jittered exponential for non-throttling and throttling.
        BackoffStrategy nonThrottling =
                BackoffStrategy.exponentialDelay(Duration.ofMillis(200), Duration.ofSeconds(5));
        BackoffStrategy throttling =
                BackoffStrategy.exponentialDelay(Duration.ofSeconds(1), Duration.ofSeconds(15));

        // STANDARD retry with custom tuning 
        StandardRetryStrategy standard =
                StandardRetryStrategy.builder()
                        .maxAttempts(8) // 1 initial try + 7 retries
                        .backoffStrategy(nonThrottling)
                        .throttlingBackoffStrategy(throttling)
                        .circuitBreakerEnabled(true)
                        .build();

        return DynamoDbClient.builder()
                .region(region)
                .endpointOverride(URI.create(cfg.endpoint()))
                .credentialsProvider(StaticCredentialsProvider.create(fakeCreds))
                .overrideConfiguration(o -> {
                    o.retryStrategy(standard);
                })
                .build();
    }

    @Singleton
    DynamoDbEnhancedClient enhanced(@Named("lowDynamoDbClient") DynamoDbClient low) {
        return DynamoDbEnhancedClient.builder()
                .dynamoDbClient(low)
                .build();
    }
}
