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
import com.porflyo.ports.output.PortfolioUrlRepositoryContract;
import com.porflyo.repository.DdbPortfolioUrlRepository;
import  com.porflyo.schema.PortfolioUrlTableSchema;

import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import io.micronaut.test.support.TestPropertyProvider;
import jakarta.annotation.PostConstruct;
import jakarta.inject.Inject;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;

@MicronautTest(environments = {"integration"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Testcontainers
@DisplayName("DynamoDB PortfolioUrl Repository Integration Tests")
public class DdbPortfolioUrlRepositoryIntegrationTest
        extends PortfolioUrlRepositoryContract
        implements TestPropertyProvider {

    @Container
    @SuppressWarnings("resource")
    static GenericContainer<?> dynamodb = new GenericContainer<>(DockerImageName.parse("amazon/dynamodb-local:latest"))
            .withExposedPorts(8000)
            .withCommand("-jar", "DynamoDBLocal.jar", "-sharedDb", "-inMemory");

    @Inject
    DdbPortfolioUrlRepository injectedRepository;
    @Inject DynamoDbEnhancedClient enhanced;
    @Inject DdbConfig ddbConfig;

    public DdbPortfolioUrlRepositoryIntegrationTest() {
        super(null); // Initialize with null, will be set in @PostConstruct
    }

    @PostConstruct
    void setUp() {
        this.repository = injectedRepository;
    }

    // Unique table name for each test
    private final String uniqueTableName = "test-" + java.util.UUID.randomUUID();

    @Override
    public Map<String, String> getProperties() {
        if (!dynamodb.isRunning()) {
            dynamodb.start();
        }
        String dynamoUrl = "http://" + dynamodb.getHost() + ":" + dynamodb.getMappedPort(8000);
        return Map.of(
            "dynamodb.endpoint", dynamoUrl,
            "dynamodb.region", "us-east-1",
            "dynamodb.tableName", uniqueTableName,
            "micronaut.test.resources.enabled", "false"
        );
    }

    @BeforeEach
    void createTable() {
        var table = enhanced.table(uniqueTableName, PortfolioUrlTableSchema.SCHEMA);
        try { table.deleteTable(); } catch (Exception ignored) {}
        table.createTable();
    }
}
