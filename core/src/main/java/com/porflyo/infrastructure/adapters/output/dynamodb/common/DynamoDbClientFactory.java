package com.porflyo.infrastructure.adapters.output.dynamodb.common;

import java.net.URI;

import com.porflyo.infrastructure.configuration.DynamoDbConfig;

import io.micronaut.context.annotation.Factory;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

/**
 * Supplies a shared {@link DynamoDbClient} for the entire application.
 *
 */
@Factory
public class DynamoDbClientFactory {

    private final DynamoDbConfig dynamoDbConfig;

    @Inject
    public DynamoDbClientFactory(DynamoDbConfig dynamoDbConfig) {
        this.dynamoDbConfig = dynamoDbConfig;
    }
    

    @Singleton
    DynamoDbClient dynamoDbClient() {
        String endpoint = dynamoDbConfig.endpoint().orElse(null);
        Region region = Region.of(dynamoDbConfig.region());

        var builder = DynamoDbClient.builder().region(region);
        if (endpoint != null && !endpoint.equals("null")) {
            builder.endpointOverride(URI.create(endpoint));
        }
        return builder.build();
    }
}
