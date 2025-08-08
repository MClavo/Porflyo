package com.porflyo.domain.model.user;

import java.util.Collections;
import java.util.Map;
import java.util.Objects;

import com.porflyo.domain.model.shared.EntityId;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import software.amazon.awssdk.services.dynamodb.endpoints.internal.Value.Str;

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
    private final String profileImage;

    /**
     * KEY: Social Media Platform (e.g., "linkedin", "github")
     * <p>
     * VALUE: absolute URL of the user's profile
     */
    private final Map<@NotBlank String, String> socials;


    public User(EntityId id, ProviderAccount providerAccount, String name, String email, String description,
            String profileImage, Map<String, String> socials) {
        this.id = Objects.requireNonNull(id);
        this.providerAccount = providerAccount;
        this.name = Objects.requireNonNull(name);
        this.email = Objects.requireNonNull(email);
        this.description = description;
        this.profileImage = profileImage;
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
            String profileImage) {

        return new User(id,
                providerAccount,
                name,
                email,
                description,
                profileImage,
                Collections.emptyMap());
    }

    /**
     * Returns a new {@code User} instance with the requested modifications.
     * Provider data is intentionally immutable.
     */
    public User editProfile(String newName,
            @Email String newEmail,
            String newDescription,
            String newProfileImage,
            Map<String, String> newSocials) {

        return new User(
                id,
                this.providerAccount, // immutable
                newName != null ? newName : this.name,
                newEmail != null ? newEmail : this.email,
                newDescription != null ? newDescription : this.description,
                newProfileImage != null ? newProfileImage : this.profileImage,
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

    public String profileImage() {
        return profileImage;
    }

    public Map<String, String> socials() {
        return socials;
    }
}
