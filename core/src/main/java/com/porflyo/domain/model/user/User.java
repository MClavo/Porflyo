package com.porflyo.domain.model.user;

import java.net.URI;
import java.util.Collections;
import java.util.Map;
import java.util.Objects;

import com.porflyo.domain.model.shared.EntityId;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Serdeable
@Introspected
public final class User {
    @NotBlank
    private final EntityId id;

    @Valid
    private final ProviderAccount providerAccount;

    @NotBlank
    private final String name;

    @Email
    private final String email;

    private final String description;
    private final URI avatarUrl;

    /**
     * KEY: Social Media Platform (e.g., "linkedin", "github")
     * <p>
     * VALUE: absolute URL of the user's profile
     */
    private final Map<@NotBlank String, String> socials;


    public User(EntityId id, ProviderAccount providerAccount, String name, String email, String description,
            URI avatarUrl, Map<String, String> socials) {
        this.id = Objects.requireNonNull(id);
        this.providerAccount = providerAccount;
        this.name = Objects.requireNonNull(name);
        this.email = Objects.requireNonNull(email);
        this.description = description;
        this.avatarUrl = avatarUrl;
        this.socials = socials == null ? Collections.emptyMap()
                : Map.copyOf(socials);
    }

    /**
     * Creates a brand new user when signing up first time via a provider.
     */
    public static User fromProvider(EntityId id,
            ProviderAccount providerAccount,
            String name,
            @Email String email,
            String description,
            URI avatarUrl) {

        return new User(id,
                providerAccount,
                name,
                email,
                description,
                avatarUrl,
                Collections.emptyMap());
    }

    /**
     * Returns a new {@code User} instance with the requested modifications.
     * Provider data is intentionally immutable.
     */
    public User editProfile(String newName,
            @Email String newEmail,
            String newDescription,
            URI newAvatarUrl,
            Map<String, String> newSocials) {

        return new User(
                id,
                this.providerAccount, // immutable
                newName != null ? newName : this.name,
                newEmail != null ? newEmail : this.email,
                newDescription != null ? newDescription : this.description,
                newAvatarUrl != null ? newAvatarUrl : this.avatarUrl,
                newSocials != null ? Map.copyOf(newSocials) : this.socials);
    }

    public EntityId id() {
        return id;
    }

    public ProviderAccount provider() {
        return providerAccount;
    }

    public String name() {
        return name;
    }

    public String email() {
        return email;
    }

    public String description() {
        return description;
    }

    public URI avatarUrl() {
        return avatarUrl;
    }

    public Map<String, String> socials() {
        return socials;
    }
}
