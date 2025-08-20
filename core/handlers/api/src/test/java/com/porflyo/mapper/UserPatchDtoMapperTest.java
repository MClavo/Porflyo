package com.porflyo.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;

import com.porflyo.dto.UserPatchDto;

class UserPatchDtoMapperTest {

    @Test
    void should_createPatchDto_when_allFieldsPresent() {
        // given
        Map<String, Object> attributes = Map.of(
                "name", "Updated Name",
                "email", "updated@example.com", 
                "description", "Updated description",
                "avatarUrl", "updated-avatar.jpg",
                "socials", Map.of("twitter", "@updated", "linkedin", "linkedin.com/updated")
        );

        // when
        UserPatchDto result = UserPatchDtoMapper.toPatch(attributes);

        // then
        assertThat(result).isNotNull();
        assertThat(result.name()).isPresent().contains("Updated Name");
        assertThat(result.email()).isPresent().contains("updated@example.com");
        assertThat(result.description()).isPresent().contains("Updated description");
        assertThat(result.avatarUrl()).isPresent().contains("updated-avatar.jpg");
        assertThat(result.socials()).isPresent();
        assertThat(result.socials().get()).containsEntry("twitter", "@updated");
        assertThat(result.socials().get()).containsEntry("linkedin", "linkedin.com/updated");
    }

    @Test
    void should_createPatchDto_when_partialFieldsPresent() {
        // given
        Map<String, Object> attributes = Map.of(
                "name", "New Name",
                "description", "New description"
        );

        // when
        UserPatchDto result = UserPatchDtoMapper.toPatch(attributes);

        // then
        assertThat(result).isNotNull();
        assertThat(result.name()).isPresent().contains("New Name");
        assertThat(result.email()).isEmpty();
        assertThat(result.description()).isPresent().contains("New description");
        assertThat(result.avatarUrl()).isEmpty();
        assertThat(result.socials()).isEmpty();
    }

    @Test
    void should_createPatchDto_when_emptySocialsMap() {
        // given
        Map<String, Object> attributes = Map.of(
                "name", "Test User",
                "socials", Map.of() // empty socials map
        );

        // when
        UserPatchDto result = UserPatchDtoMapper.toPatch(attributes);

        // then
        assertThat(result).isNotNull();
        assertThat(result.name()).isPresent().contains("Test User");
        assertThat(result.socials()).isPresent();
        assertThat(result.socials().get()).isEmpty();
    }

    @Test
    void should_createPatchDto_when_noFieldsPresent() {
        // given
        Map<String, Object> attributes = Map.of();

        // when
        UserPatchDto result = UserPatchDtoMapper.toPatch(attributes);

        // then
        assertThat(result).isNotNull();
        assertThat(result.name()).isEmpty();
        assertThat(result.email()).isEmpty();
        assertThat(result.description()).isEmpty();
        assertThat(result.avatarUrl()).isEmpty();
        assertThat(result.socials()).isEmpty();
    }

    @Test
    void should_createPatchDto_when_nullValues() {
        // given
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("name", null);
        attributes.put("email", "test@example.com");
        attributes.put("description", null);

        // when
        UserPatchDto result = UserPatchDtoMapper.toPatch(attributes);

        // then
        assertThat(result).isNotNull();
        assertThat(result.name()).isEmpty(); // null values should result in empty Optional
        assertThat(result.email()).isPresent().contains("test@example.com");
        assertThat(result.description()).isEmpty(); // null values should result in empty Optional
        assertThat(result.avatarUrl()).isEmpty();
        assertThat(result.socials()).isEmpty();
    }

    @Test
    void should_createPatchDto_when_socialsWithMixedTypes() {
        // given
        Map<Object, Object> socialMapRaw = new HashMap<>();
        socialMapRaw.put("twitter", "@user"); // valid string-string
        socialMapRaw.put("linkedin", "linkedin.com/user"); // valid string-string
        socialMapRaw.put("invalid", 123); // invalid - not string
        socialMapRaw.put(456, "value"); // invalid - key not string
        
        Map<String, Object> attributes = Map.of(
                "name", "Test User",
                "socials", socialMapRaw
        );

        // when
        UserPatchDto result = UserPatchDtoMapper.toPatch(attributes);

        // then
        assertThat(result).isNotNull();
        assertThat(result.name()).isPresent().contains("Test User");
        assertThat(result.socials()).isPresent();
        // Only valid string-string entries should be included
        assertThat(result.socials().get()).containsEntry("twitter", "@user");
        assertThat(result.socials().get()).containsEntry("linkedin", "linkedin.com/user");
        assertThat(result.socials().get()).hasSize(2); // invalid entries filtered out
    }

    @Test
    void should_createPatchDto_when_socialsNotMap() {
        // given
        Map<String, Object> attributes = Map.of(
                "name", "Test User",
                "socials", "not-a-map" // invalid - not a Map
        );

        // when
        UserPatchDto result = UserPatchDtoMapper.toPatch(attributes);

        // then
        assertThat(result).isNotNull();
        assertThat(result.name()).isPresent().contains("Test User");
        assertThat(result.socials()).isEmpty(); // should be empty when socials is not a Map
    }

    @Test
    void should_createPatchDto_when_onlyEmail() {
        // given
        Map<String, Object> attributes = Map.of("email", "only@example.com");

        // when
        UserPatchDto result = UserPatchDtoMapper.toPatch(attributes);

        // then
        assertThat(result).isNotNull();
        assertThat(result.name()).isEmpty();
        assertThat(result.email()).isPresent().contains("only@example.com");
        assertThat(result.description()).isEmpty();
        assertThat(result.avatarUrl()).isEmpty();
        assertThat(result.socials()).isEmpty();
    }

    @Test
    void should_createPatchDto_when_onlyAvatarUrl() {
        // given
        Map<String, Object> attributes = Map.of("avatarUrl", "avatar.png");

        // when
        UserPatchDto result = UserPatchDtoMapper.toPatch(attributes);

        // then
        assertThat(result).isNotNull();
        assertThat(result.name()).isEmpty();
        assertThat(result.email()).isEmpty();
        assertThat(result.description()).isEmpty();
        assertThat(result.avatarUrl()).isPresent().contains("avatar.png");
        assertThat(result.socials()).isEmpty();
    }
}
