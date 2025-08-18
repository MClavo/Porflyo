package com.porflyo.infrastructure.adapters.output.dynamodb.repository;

import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;
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

import com.porflyo.application.dto.UserPatchDto;
import com.porflyo.application.ports.output.UserRepository;
import com.porflyo.domain.model.ids.ProviderUserId;
import com.porflyo.domain.model.ids.UserId;
import com.porflyo.domain.model.user.ProviderAccount;
import com.porflyo.domain.model.user.ProviderAccount.Provider;
import com.porflyo.domain.model.user.User;
import com.porflyo.infrastructure.adapters.output.dynamodb.schema.UserTableSchema;
import com.porflyo.infrastructure.configuration.DdbConfig;
import com.porflyo.testing.data.TestData;

import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import io.micronaut.test.support.TestPropertyProvider;
import jakarta.inject.Inject;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;

@MicronautTest(environments = {"integration"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Testcontainers
@DisplayName("DynamoDB User Repository Integration Tests (recreated table, using TestData)")
public class DdbUserRepositoryIntegrationTest implements TestPropertyProvider {

    @Container
    @SuppressWarnings("resource")
    static GenericContainer<?> dynamodb = new GenericContainer<>(DockerImageName.parse("amazon/dynamodb-local:latest"))
            .withExposedPorts(8000)
            .withCommand("-jar", "DynamoDBLocal.jar", "-sharedDb", "-inMemory");

    @Inject UserRepository repo;

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

    private final UserId userId1 = TestData.DEFAULT_USER_ID;
    private final ProviderUserId providerId1 = TestData.DEFAULT_PROVIDER_USER_ID;
    private final User user = TestData.DEFAULT_USER;
    private final ProviderAccount provider = TestData.DEFAULT_PROVIDER_ACCOUNT;
    

    @Test
    @DisplayName("should return empty when user not found by ID or provider ID")
    void shouldReturnEmpty_whenUserNotFound() {
        // When
        Optional<User> byId = repo.findById(new UserId("non-existent-id"));
        Optional<User> byProvider = repo.findByProviderId(new ProviderUserId("non-existent-provider-id"));

        // Then
        assertTrue(byId.isEmpty(), "findById should be empty for missing user");
        assertTrue(byProvider.isEmpty(), "findByProviderId should be empty for missing user");
    }

    @Test
    @DisplayName("should save and retrieve user by ID")
    void shouldSaveAndRetrieve_whenFindById() {
        // When
        repo.save(user);

        // Then
        User loaded = repo.findById(userId1).orElseThrow();
        assertEquals(user.id(), loaded.id());
        assertEquals(user.name(), loaded.name());
        assertEquals(user.email(), loaded.email());
        assertEquals(user.description(), loaded.description());
        assertEquals(user.profileImage(), loaded.profileImage());
        assertEquals(user.provider().provider(), loaded.provider().provider());
        assertEquals(user.provider().providerUserId(), loaded.provider().providerUserId());
    }

    @Test
    @DisplayName("should find user by provider ID via GSI")
    void shouldFind_whenFindByProviderIdOnGsi() {
        // Given
        repo.save(user);

        // When
        User found = repo.findByProviderId(providerId1).orElseThrow();

        // Then
        assertEquals(userId1, found.id(), "GSI result should match user ID");
        assertEquals(providerId1, found.provider().providerUserId(), "GSI should target provider user id");
    }

    @Test
    @DisplayName("should preserve description through compression/decompression")
    void shouldPreserveDescription_whenSavingAndLoading() {
        // Given
        repo.save(user);

        // When
        User loaded = repo.findById(userId1).orElseThrow();

        // Then
        assertEquals(TestData.DEFAULT_USER.description(), loaded.description());
    }

    @Test
    @DisplayName("should patch basic fields (name, description)")
    void shouldPatch_whenUpdatingBasicFields() {
        // Given
        repo.save(user);

        // When
        UserPatchDto patch = new UserPatchDto(
            Optional.of("User One Updated"),
            Optional.empty(),
            Optional.of("NEW DESCRIPTION"),
            Optional.empty(),
            Optional.empty()
        );
        User patched = repo.patch(userId1, patch);

        // Then
        assertEquals("User One Updated", patched.name());
        assertEquals("NEW DESCRIPTION", patched.description());

        User reloaded = repo.findById(userId1).orElseThrow();
        assertEquals("User One Updated", reloaded.name());
        assertEquals("NEW DESCRIPTION", reloaded.description());
    }

    @Test
    @DisplayName("should patch provider account fields")
    void shouldPatchProviderAccount_whenUpdatingProvider() {
        // Given
        repo.save(user);
        ProviderAccount original = provider;

        // When
        ProviderAccount updatedProvider = new ProviderAccount(
            Provider.GITHUB,
            original.providerUserId(),
            "User One Updated",                                  // name
            URI.create(TestData.DEFAULT_GITHUB_AVATAR_URL),      // avatar
            "NewAccessToken"                                     // access token
        );
        User updated = repo.patchProviderAccount(userId1, updatedProvider);

        // Then
        assertEquals(updatedProvider.provider(), updated.provider().provider());
        assertEquals(updatedProvider.providerUserId(), updated.provider().providerUserId());
        assertEquals(updatedProvider.providerUserName(), updated.provider().providerUserName());
        assertEquals(updatedProvider.providerAvatarUrl(), updated.provider().providerAvatarUrl());
        assertEquals(updatedProvider.providerAccessToken(), updated.provider().providerAccessToken());

        User reloaded = repo.findById(userId1).orElseThrow();
        assertEquals("User One Updated", reloaded.provider().providerUserName());
        assertEquals("NewAccessToken", reloaded.provider().providerAccessToken());
    }

    @Test
    @DisplayName("should delete user and make future lookups empty")
    void shouldDeleteUser_whenExistingUser() {
        // Given
        repo.save(user);
        assertTrue(repo.findById(userId1).isPresent(), "Precondition: user exists");

        // When
        repo.delete(userId1);

        // Then
        assertTrue(repo.findById(userId1).isEmpty(), "User should not exist after deletion");
        assertTrue(repo.findByProviderId(providerId1).isEmpty(), "GSI should not find deleted user");
    }

    @Test
    @DisplayName("should add socials when updating user")
    void shouldAddAndChangeSocials_whenUpdatingUser() {
        // Given
        repo.save(user);
        assertTrue(repo.findById(userId1).isPresent(), "Precondition: user exists");


        Map<String, String> newSocials = Map.of(
            "twitter", "new_twitter_handle",
            "facebook", "new_facebook_handle",
            "web", "new_web_handle"
        );

        Map<String, String> newSocials2 = Map.of(
            "test", "only_one"
        );

        // When
        UserPatchDto patch = new UserPatchDto(
            Optional.empty(),
            Optional.empty(),
            Optional.empty(),
            Optional.empty(),
            Optional.of(newSocials)
        );
        
        UserPatchDto patch2 = new UserPatchDto(
            Optional.empty(),
            Optional.empty(),
            Optional.empty(),
            Optional.empty(),
            Optional.of(newSocials2)
        );


        User patched = repo.patch(userId1, patch);

        // Then
        assertEquals("new_twitter_handle", patched.socials().get("twitter"));
        assertEquals("new_facebook_handle", patched.socials().get("facebook"));
        assertEquals("new_web_handle", patched.socials().get("web"));

        User patched2 = repo.patch(userId1, patch2);

        assertEquals("only_one", patched2.socials().get("test"));
        assertNull(patched2.socials().get("twitter"), "Old socials should be removed");
        assertNull(patched2.socials().get("facebook"), "Old socials should be removed");
        assertNull(patched2.socials().get("web"), "Old socials should be removed");
    }


    @Test
    @DisplayName("should delete socials when updating user")
    void shouldDeleteAndChangeSocials_whenUpdatingUser() {
        // Given
        repo.save(user);
        assertTrue(repo.findById(userId1).isPresent(), "Precondition: user exists");


        Map<String, String> newSocials = Map.of(
            "twitter", "new_twitter_handle",
            "facebook", "new_facebook_handle",
            "web", "new_web_handle"
         );

         Map<String, String> newSocials2 = Map.of(
            "twitter", "new_twitter_handle",
            "facebook", "new_facebook_handle"
         );

        // When
        UserPatchDto patch1 = new UserPatchDto(
            Optional.empty(),
            Optional.empty(),
            Optional.empty(),
            Optional.empty(),
            Optional.of(newSocials)
        );

        UserPatchDto patch2 = new UserPatchDto(
            Optional.empty(),
            Optional.empty(),
            Optional.empty(),
            Optional.empty(),
            Optional.of(Map.of()) // Empty map to delete socials
        );

        UserPatchDto patch3 = new UserPatchDto(
            Optional.empty(),
            Optional.empty(),
            Optional.empty(),
            Optional.empty(),
            Optional.of(newSocials2)
        );


        repo.patch(userId1, patch1);
        User patched = repo.patch(userId1, patch2);

        // Then
        assertTrue(patched.socials().isEmpty(), "Socials should be empty after deletion");

        patched = repo.patch(userId1, patch3);

        assertEquals("new_twitter_handle", patched.socials().get("twitter"));
        assertEquals("new_facebook_handle", patched.socials().get("facebook"));
        assertNull(patched.socials().get("web"));
    }


}

