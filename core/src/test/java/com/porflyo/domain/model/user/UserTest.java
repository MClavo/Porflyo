package com.porflyo.domain.model.user;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.porflyo.domain.model.shared.EntityId;

@DisplayName("User Tests")
class UserTest {

    @Test
    @DisplayName("Constructor sets all fields correctly")
    void testConstructorSetsFields() {
        EntityId id = Mockito.mock(EntityId.class);
        ProviderAccount provider = Mockito.mock(ProviderAccount.class);
        String name = "John Doe";
        String email = "john@example.com";
        String description = "A user";
        String profileImage = "http://avatar.com/john.png";
        Map<String, String> socials = new HashMap<>();
        socials.put("github", "https://github.com/johndoe");

        User user = new User(id, provider, name, email, description, profileImage, socials);

        assertEquals(id, user.id());
        assertEquals(provider, user.provider());
        assertEquals(name, user.name());
        assertEquals(email, user.email());
        assertEquals(description, user.description());
        assertEquals(profileImage, user.profileImage());
        assertEquals(socials, user.socials());
    }

    @Test
    @DisplayName("Constructor sets socials to empty map if null")
    void testConstructorSocialsNull() {
        EntityId id = Mockito.mock(EntityId.class);
        ProviderAccount provider = Mockito.mock(ProviderAccount.class);

        User user = new User(id, provider, "Jane", "jane@example.com", null, null, null);

        assertNotNull(user.socials());
        assertTrue(user.socials().isEmpty());
    }

    @Test
    @DisplayName("fromProvider creates user with empty socials")
    void testFromProvider() {
        EntityId id = Mockito.mock(EntityId.class);
        ProviderAccount provider = Mockito.mock(ProviderAccount.class);
        String name = "Alice";
        String email = "alice@example.com";
        String description = "desc";
        String profileImage = "http://avatar.com/alice.png";

        User user = User.fromProvider(id, provider, name, email, description, profileImage);

        assertEquals(id, user.id());
        assertEquals(provider, user.provider());
        assertEquals(name, user.name());
        assertEquals(email, user.email());
        assertEquals(description, user.description());
        assertEquals(profileImage, user.profileImage());
        assertTrue(user.socials().isEmpty());
    }

    @Test
    @DisplayName("editProfile returns new User with updated fields")
    void testEditProfileUpdatesFields() {
        EntityId id = Mockito.mock(EntityId.class);
        ProviderAccount provider = Mockito.mock(ProviderAccount.class);
        User user = new User(id, provider, "Bob", "bob@example.com", "desc", null, null);

        Map<String, String> newSocials = new HashMap<>();
        newSocials.put("linkedin", "https://linkedin.com/in/bob");

        User edited = user.editProfile("Bobby", "bobby@example.com", "new desc", "http://avatar.com/bobby.png", newSocials);

        assertEquals("Bobby", edited.name());
        assertEquals("bobby@example.com", edited.email());
        assertEquals("new desc", edited.description());
        assertEquals("http://avatar.com/bobby.png", edited.profileImage());
        assertEquals(newSocials, edited.socials());
        assertEquals(provider, edited.provider());
        assertEquals(id, edited.id());
    }

    @Test
    @DisplayName("editProfile uses original values if nulls are passed")
    void testEditProfileNulls() {
        EntityId id = Mockito.mock(EntityId.class);
        ProviderAccount provider = Mockito.mock(ProviderAccount.class);
        Map<String, String> socials = Collections.singletonMap("github", "https://github.com/bob");
        User user = new User(id, provider, "Bob", "bob@example.com", "desc", null, socials);

        User edited = user.editProfile(null, null, null, null, null);

        assertEquals("Bob", edited.name());
        assertEquals("bob@example.com", edited.email());
        assertEquals("desc", edited.description());
        assertNull(edited.profileImage());
        assertEquals(socials, edited.socials());
    }

    @Test
    @DisplayName("socials map is unmodifiable")
    void testSocialsUnmodifiable() {
        EntityId id = Mockito.mock(EntityId.class);
        ProviderAccount provider = Mockito.mock(ProviderAccount.class);
        Map<String, String> socials = new HashMap<>();
        socials.put("github", "https://github.com/test");

        User user = new User(id, provider, "Test", "test@example.com", null, null, socials);

        assertThrows(UnsupportedOperationException.class, () -> user.socials().put("twitter", "https://twitter.com/test"));
    }
}