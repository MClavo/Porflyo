package com.porflyo.infrastructure.adapters.output.dynamodb.common;

import java.net.URI;

import com.porflyo.infrastructure.configuration.DynamoDbConfig;

import io.micronaut.context.annotation.Factory;
import io.micronaut.context.annotation.Requires;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

/**
 * Supplies a shared {@link DynamoDbClient} for the entire application.
 *
 */
@Factory
@Requires(beans = DynamoDbConfig.class) // Solo se carga si DynamoDbConfig está disponible
public class DynamoDbClientFactory {

    private final DynamoDbConfig dynamoDbConfig;

    @Inject
    public DynamoDbClientFactory(DynamoDbConfig dynamoDbConfig) {
        this.dynamoDbConfig = dynamoDbConfig;
    }
    

    @Singleton
    @Named("lowClient")
    DynamoDbClient lowClient() {

        String endpoint = dynamoDbConfig.endpoint();
        Region region = Region.of(dynamoDbConfig.region());

        // TODO: Change this in production to use real credentials
        // Fake credentials for local testing
        AwsBasicCredentials fakeCreds = AwsBasicCredentials.create("test", "test");

        return DynamoDbClient.builder()
                             .region(region)
                             .endpointOverride(URI.create(endpoint))
                             .credentialsProvider(StaticCredentialsProvider.create(fakeCreds))
                             .build();
    }

    @Singleton
    DynamoDbEnhancedClient enhanced(@Named("lowClient") DynamoDbClient low) {
        return DynamoDbEnhancedClient.builder()
                                     .dynamoDbClient(low)
                                     .build();
    }
}
