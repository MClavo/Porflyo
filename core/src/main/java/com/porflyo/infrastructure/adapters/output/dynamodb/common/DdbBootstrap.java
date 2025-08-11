package com.porflyo.infrastructure.adapters.output.dynamodb.common;

import java.util.List;

import com.porflyo.infrastructure.adapters.output.dynamodb.schema.SavedSectionTableSchema;
import com.porflyo.infrastructure.adapters.output.dynamodb.schema.UserTableSchema;
import com.porflyo.infrastructure.configuration.DdbConfig;

import io.micronaut.context.annotation.Requires;
import io.micronaut.context.env.Environment;
import io.micronaut.context.event.ApplicationEventListener;
import io.micronaut.context.event.StartupEvent;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
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
@Requires(env = { Environment.TEST, Environment.DEVELOPMENT, "local" })
@Requires(beans = DdbConfig.class) // Only if DynamoDbConfig is present
public class DdbBootstrap implements ApplicationEventListener<StartupEvent> {

    DynamoDbEnhancedClient enhanced;
    DdbConfig ddbConfig;

    @Inject
    public DdbBootstrap(DynamoDbEnhancedClient enhanced, DdbConfig ddbConfig) {
        this.enhanced = enhanced;
        this.ddbConfig = ddbConfig;
    }

    private static final List<TableSchema<?>> SCHEMAS = List.of(
        UserTableSchema.SCHEMA,
        SavedSectionTableSchema.SCHEMA
    );


    @Override
    public void onApplicationEvent(StartupEvent event) {
        final String tableName = ddbConfig.tableName();

        // Choose the creator schema. It must define the PK/SK used by the single table.
        TableSchema<?> creatorSchema = SCHEMAS.get(0);

        // Create the table once (if missing) using the creator schema
        DynamoDbTable<?> creatorHandle = enhanced.table(tableName, creatorSchema);
        if (!tableExists(creatorHandle)) {
            creatorHandle.createTable();
        }

        // Warm up handles for all other schemas WITHOUT creating tables again
        // (this is safe; it only builds typed views over the same physical table).
        for (int i = 1; i < SCHEMAS.size(); i++) {
            TableSchema<?> schema = SCHEMAS.get(i);
            enhanced.table(tableName, schema);
        }
    }


    private boolean tableExists(DynamoDbTable<?> table) {
        try {
            table.describeTable();
            return true;
        } catch (ResourceNotFoundException __) {
            return false;
        }
    }
}
