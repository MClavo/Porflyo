package com.porflyo.infrastructure.adapters.output.dynamodb.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import com.porflyo.application.ports.output.PortfolioUrlRepository;
import com.porflyo.domain.model.ids.PortfolioId;
import com.porflyo.domain.model.ids.UserId;
import com.porflyo.domain.model.portfolio.PortfolioUrl;
import com.porflyo.domain.model.portfolio.Slug;
import com.porflyo.infrastructure.adapters.output.dynamodb.schema.PortfolioUrlTableSchema;
import com.porflyo.infrastructure.configuration.DdbConfig;
import com.porflyo.testing.data.PortfolioTestData;
import com.porflyo.testing.data.TestData;

import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import io.micronaut.test.support.TestPropertyProvider;
import jakarta.inject.Inject;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;

@MicronautTest(environments = {"integration"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Testcontainers
@DisplayName("DynamoDB PortfolioUrl Repository Integration Tests")
public class DdbPortfolioUrlRepositoryIntegrationTest implements TestPropertyProvider {

    @Container
    @SuppressWarnings("resource")
    static GenericContainer<?> dynamodb = new GenericContainer<>(DockerImageName.parse("amazon/dynamodb-local:latest"))
            .withExposedPorts(8000)
            .withCommand("-jar", "DynamoDBLocal.jar", "-sharedDb", "-inMemory");

    @Inject
    PortfolioUrlRepository repository;

    @Inject DynamoDbEnhancedClient enhanced;
    @Inject DdbConfig ddbConfig;

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


    // Test data
    private final UserId userId = TestData.DEFAULT_USER_ID;
    private final PortfolioId portfolioId = PortfolioTestData.DEFAULT_PORTFOLIO_ID;
    private final Slug slug = PortfolioTestData.DEFAULT_PORTFOLIO_DESIRED_SLUG;
    private final Slug otherSlug = new Slug("other-slug");


    @Test
    @DisplayName("Should return empty when slug mapping does not exist")
    void shouldReturnEmpty_whenFindBySlugAndNotFound() {
        // Given
        // (no data)

        // When
        Optional<PortfolioUrl> found = repository.findBySlug(slug);

        // Then
        assertTrue(found.isEmpty(), "Expected Optional.empty() when slug mapping is missing");
    }

    @Test
    @DisplayName("Should reserve slug when it is free")
    void shouldReserve_whenSlugIsFree() {
        // Given
        boolean isPublic = true;

        // When
        boolean reserved = repository.reserve(slug, userId, portfolioId, isPublic);

        // Then
        assertTrue(reserved, "Slug should be reserved when it is free");

        Optional<PortfolioUrl> mapping = repository.findBySlug(slug);
        assertTrue(mapping.isPresent(), "Mapping should exist after reserve");

        PortfolioUrl url = mapping.get();
        assertEquals(userId.value(), url.userId().value());
        assertEquals(portfolioId.value(), url.portfolioId().value());
        assertEquals(slug.value(), url.slug().value());
        assertTrue(url.isPublic(), "Visibility should match the reserve flag");
    }

    @Test
    @DisplayName("Should not reserve slug when it is already taken")
    void shouldNotReserve_whenSlugAlreadyTaken() {
        // Given
        assertTrue(repository.reserve(slug, userId, portfolioId, false), "Precondition: first reserve succeeds");
        // Ensure the slug is reserved
        Optional<PortfolioUrl> t = repository.findBySlug(slug);
        assertTrue(t.isPresent(), "Mapping should exist after reserve");

        // When
        boolean reservedAgain = repository.reserve(slug, new UserId("another-user"), new PortfolioId("another-portfolio"), true);

        // Then
        assertFalse(reservedAgain, "Second reserve must fail for same slug");

        Optional<PortfolioUrl> mapping = repository.findBySlug(slug);
        assertTrue(mapping.isPresent(), "Original mapping should remain");
        PortfolioUrl url = mapping.get();
        assertEquals(userId.value(), url.userId().value(), "Original owner must remain unchanged");
        assertEquals(portfolioId, url.portfolioId(), "Original portfolio must remain unchanged");
        assertFalse(url.isPublic(), "Original visibility should remain unchanged");
    }

    @Test
    @DisplayName("Should release slug mapping when existing")
    void shouldRelease_whenExistingMapping() {
        // Given
        assertTrue(repository.reserve(slug, userId, portfolioId, true), "Precondition: reserve succeeds");

        // When
        repository.release(slug);

        // Then
        assertTrue(repository.findBySlug(slug).isEmpty(), "Mapping should be removed after release");
    }

    @Test
    @DisplayName("Should change slug atomically when new slug is free")
    void shouldChangeSlugAtomically_whenNewSlugIsFree() {
        // Given
        assertTrue(repository.reserve(slug, userId, portfolioId, true), "Precondition: old slug reserved");

        // When
        repository.changeSlugAtomic(slug, otherSlug, userId, portfolioId, true);

        // Then
        assertTrue(repository.findBySlug(slug).isEmpty(), "Old slug mapping should be gone");

        Optional<PortfolioUrl> newMapping = repository.findBySlug(otherSlug);
        assertTrue(newMapping.isPresent(), "New slug mapping should exist");

        PortfolioUrl url = newMapping.get();
        assertEquals(userId.value(), url.userId().value());
        assertEquals(portfolioId.value(), url.portfolioId().value());
        assertEquals(otherSlug.value(), url.slug().value());
        assertTrue(url.isPublic(), "Visibility should be preserved");
    }

    @Test
    @DisplayName("Should update visibility flag for existing mapping")
    void shouldUpdateVisibility_whenExistingMapping() {
        // Given
        assertTrue(repository.reserve(slug, userId, portfolioId, false), "Precondition: reserved with isPublic=false");

        // When
        repository.updateVisibility(slug, true);

        // Then
        Optional<PortfolioUrl> mapping = repository.findBySlug(slug);
        assertTrue(mapping.isPresent(), "Mapping should exist");
        assertTrue(mapping.get().isPublic(), "Visibility should be updated to true");
    }
}
