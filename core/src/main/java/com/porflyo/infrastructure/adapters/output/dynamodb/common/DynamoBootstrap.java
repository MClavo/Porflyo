package com.porflyo.infrastructure.adapters.output.dynamodb.common;

import com.porflyo.infrastructure.adapters.output.dynamodb.schema.UserTableSchema;
import com.porflyo.infrastructure.configuration.DynamoDbConfig;

import io.micronaut.context.annotation.Requires;
import io.micronaut.context.env.Environment;
import io.micronaut.context.event.ApplicationEventListener;
import io.micronaut.context.event.StartupEvent;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.services.dynamodb.model.ResourceNotFoundException;

/**
 * !!!! NEVER use this in production !!!!
 * <p>
 * Ensures the DynamoDB table is created at application startup.
 * <p>
 * This is only active in test and development environments.
 * </p>
 * !!!! NEVER use this in production !!!!
 */
@Singleton
//@Requires(env = { Environment.TEST, Environment.DEVELOPMENT })
public class DynamoBootstrap implements ApplicationEventListener<StartupEvent> {

    @Inject DynamoDbEnhancedClient enhanced;
    @Inject DynamoDbConfig dynamoDbConfig;

    @Override
    public void onApplicationEvent(StartupEvent event) {
        var table = enhanced.table(dynamoDbConfig.tableName(), UserTableSchema.SCHEMA);
        if (!tableExists(table)) {
            table.createTable();
        }
    }

    private boolean tableExists(DynamoDbTable<?> table) {
        try { table.describeTable(); return true; }
        catch (ResourceNotFoundException __) { return false; }
    }
}

