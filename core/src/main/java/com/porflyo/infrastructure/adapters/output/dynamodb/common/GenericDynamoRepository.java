package com.porflyo.infrastructure.adapters.output.dynamodb.common;

import java.util.Map;
import java.util.Optional;

import com.porflyo.infrastructure.configuration.DynamoDbConfig;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.DeleteItemRequest;
import software.amazon.awssdk.services.dynamodb.model.GetItemRequest;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;

/**
 * Ultra-thin helper that performs the three basic operations needed by any
 * aggregate: put, get and delete. It stays generic by accepting
 * already-built key/item maps – the concrete mapper lives elsewhere.
 */
@Singleton
public class GenericDynamoRepository {

    private final DynamoDbClient client;
    private final DynamoDbConfig dynamoDbConfig;

    @Inject
    public GenericDynamoRepository(DynamoDbClient client, DynamoDbConfig dynamoDbConfig) {
        this.client = client;
        this.dynamoDbConfig = dynamoDbConfig;
    }

    /**
     * Inserts a new item into the DynamoDB table.
     *
     * @param item a map representing the item's attributes and their values to be stored in DynamoDB
     */
    public void putItem(Map<String, AttributeValue> item) {
        client.putItem(PutItemRequest.builder()
                .tableName(dynamoDbConfig.tableName())
                .item(item)
                .build());
    }

    /**
     * Retrieves an item from the DynamoDB table using the specified key.
     * <p>
     * Performs a non-consistent read (costs 1/2 RCU).
     * </p>
     *
     * @param key the primary key of the item to retrieve, represented as a map of attribute names to {@link AttributeValue}
     * @return an {@link Optional} containing the item as a map of attribute names to {@link AttributeValue} if found, 
     * or {@link Optional#empty()} if not found
     */
    public Optional<Map<String, AttributeValue>> getItem(Map<String, AttributeValue> key) {
        var resp = client.getItem(GetItemRequest.builder()
                .tableName(dynamoDbConfig.tableName())
                .key(key)
                .consistentRead(false)  // costs 1/2 RCU.
                .build());
        return resp.hasItem() ? Optional.of(resp.item()) : Optional.empty();
    }

    /**
     * Deletes an item from the DynamoDB table using the specified key.
     *
     * @param key a map representing the primary key of the item to delete, 
     * where the key is the attribute name and the value is an {@link AttributeValue}
     */
    public void deleteItem(Map<String, AttributeValue> key) {
        client.deleteItem(DeleteItemRequest.builder()
                .tableName(dynamoDbConfig.tableName())
                .key(key)
                .build());
    }
}
