package com.porflyo.common;

import java.util.List;

import com.porflyo.configuration.DdbConfig;
import com.porflyo.schema.MediaCountTableSchema;
import com.porflyo.schema.PortfolioMetricsTableSchema;
import com.porflyo.schema.PortfolioTableSchema;
import com.porflyo.schema.PortfolioUrlTableSchema;
import com.porflyo.schema.QuotaTableSchema;
import com.porflyo.schema.SavedSectionTableSchema;
import com.porflyo.schema.SlotMetricsTableSchema;
import com.porflyo.schema.UserTableSchema;

import io.micronaut.context.annotation.Requires;
import io.micronaut.context.env.Environment;
import io.micronaut.context.event.ApplicationEventListener;
import io.micronaut.context.event.StartupEvent;
import jakarta.inject.Inject;
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
@Requires(env = {Environment.DEVELOPMENT, "local", "integration", "s3-integration" })
@Requires(beans = DdbConfig.class) // Only if DynamoDbConfig is present
public class DdbBootstrap implements ApplicationEventListener<StartupEvent> {

    DynamoDbEnhancedClient enhanced;
    DdbConfig ddbConfig;

    @Inject
    public DdbBootstrap(DynamoDbEnhancedClient enhanced, DdbConfig ddbConfig) {
        this.enhanced = enhanced;
        this.ddbConfig = ddbConfig;
    }

    private static final List<TableSchema<?>> USER_TABLE_SCHEMAS = List.of(
        UserTableSchema.SCHEMA,
        SavedSectionTableSchema.SCHEMA,
        PortfolioTableSchema.SCHEMA,
        PortfolioUrlTableSchema.SCHEMA,
        MediaCountTableSchema.SCHEMA,
        QuotaTableSchema.SCHEMA
    );

    private static final List<TableSchema<?>> METRICS_TABLE_SCHEMAS = List.of(
        PortfolioMetricsTableSchema.SCHEMA,
        SlotMetricsTableSchema.SCHEMA
    );


    @Override
    public void onApplicationEvent(StartupEvent event) {
        // Create user table and warm up its schemas
        createTableAndWarmupSchemas(ddbConfig.userTable(), USER_TABLE_SCHEMAS);
        
        // Create metrics table and warm up its schemas
        createTableAndWarmupSchemas(ddbConfig.metricsTable(), METRICS_TABLE_SCHEMAS);
    }

    private void createTableAndWarmupSchemas(String tableName, List<TableSchema<?>> schemas) {
        // Choose the creator schema. It must define the PK/SK used by the single table.
        TableSchema<?> creatorSchema = schemas.get(0);

        // Create the table once (if missing) using the creator schema
        DynamoDbTable<?> creatorHandle = enhanced.table(tableName, creatorSchema);
        if (!tableExists(creatorHandle)) {
            creatorHandle.createTable();
        }

        // Warm up handles for all other schemas WITHOUT creating tables again
        // (this is safe; it only builds typed views over the same physical table).
        for (int i = 1; i < schemas.size(); i++) {
            TableSchema<?> schema = schemas.get(i);
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
