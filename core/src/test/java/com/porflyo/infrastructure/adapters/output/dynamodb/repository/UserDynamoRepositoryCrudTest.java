package com.porflyo.infrastructure.adapters.output.dynamodb.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import com.porflyo.application.ports.output.UserRepository;
import com.porflyo.domain.model.shared.EntityId;
import com.porflyo.domain.model.user.ProviderAccount;
import com.porflyo.domain.model.user.User;

import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import io.micronaut.test.support.TestPropertyProvider;
import jakarta.inject.Inject;

@MicronautTest(environments = {"integration"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Testcontainers
public class UserDynamoRepositoryCrudTest implements TestPropertyProvider {

    @Container
    @SuppressWarnings("resource")
    static GenericContainer<?> dynamodb = new GenericContainer<>(DockerImageName.parse("amazon/dynamodb-local:latest"))
            .withExposedPorts(8000)
            .withCommand("-jar", "DynamoDBLocal.jar", "-sharedDb", "-inMemory");

    @Inject 
    UserRepository repo;

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

    private EntityId id1 = new EntityId("123");
    
    private ProviderAccount providerAccount1 = new ProviderAccount(
        "providerUserId1",
        "providerUserName1",
        URI.create("https://example.com/avatar1.png"),
        "accessToken1"
    );


    private User user1 = new User(
        id1,
        providerAccount1,
        "User One",
        "user-email@example.com",
        "Description for User One",
        URI.create("https://example.com/avatar1.png"),
        Map.of("github", "https://github.com/user1")
    );

   

    @Test
    void crudRoundTrip() {
        // CREATE
        repo.save(user1);
        

        // READ
        var loaded = repo.findById(id1).orElseThrow();
        assertEquals("User One", loaded.name());

        // UPDATE
        Map<String, Object> updates = Map.of(
            "pk", "USER#"+id1.value().toString(),
            "name", "User One Updated");
        repo.patch(id1, updates);
        var patched = repo.findById(id1).orElseThrow();
        assertEquals("User One Updated", patched.name());
        assertEquals(id1.value(), patched.id().value());
        System.out.println("Patched id: " + patched.id().value());

        // DELETE
        repo.delete(id1);
        assertTrue(repo.findById(id1).isEmpty());
    }

}

