package com.porflyo;

import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.TestInstance;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import com.porflyo.configuration.DdbConfig;
import com.porflyo.ports.UserRepositoryContract;
import com.porflyo.repository.DdbUserRepository;
import  com.porflyo.schema.UserTableSchema;

import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import io.micronaut.test.support.TestPropertyProvider;
import jakarta.annotation.PostConstruct;
import jakarta.inject.Inject;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;

@MicronautTest(environments = {"integration"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Testcontainers
@DisplayName("DynamoDB User Repository Integration Tests (recreated table, using TestData)")
public class DdbUserRepositoryIntegrationTest
        extends UserRepositoryContract
        implements TestPropertyProvider {

    @Container
    @SuppressWarnings("resource")
    static GenericContainer<?> dynamodb = new GenericContainer<>(DockerImageName.parse("amazon/dynamodb-local:latest"))
            .withExposedPorts(8000)
            .withCommand("-jar", "DynamoDBLocal.jar", "-sharedDb", "-inMemory");

    @Inject DdbUserRepository injectedRepository;

    DdbUserRepositoryIntegrationTest() {
        super(null);
    }

    @PostConstruct
    void init(){
        this.repository = injectedRepository;
    }

    @Inject DynamoDbEnhancedClient enhanced;
    @Inject DdbConfig ddbConfig;

    @Override
    public Map<String, String> getProperties() {
        if (!dynamodb.isRunning()) {
            dynamodb.start();
        }
        String dynamoUrl = "http://" + dynamodb.getHost() + ":" + dynamodb.getMappedPort(8000);
        return Map.of(
            "dynamodb.endpoint", dynamoUrl,
            "dynamodb.region", "us-east-1",
            "micronaut.test.resources.enabled", "false"
        );
    }

    @BeforeEach
    void recreateTable() {
        var table = enhanced.table(ddbConfig.tableName(), UserTableSchema.SCHEMA);
        try { table.deleteTable(); } catch (Exception ignored) {}
        table.createTable();
    }

}

