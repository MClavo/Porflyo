package com.porflyo.domain.model.user;

import java.time.Instant;
import java.util.Map;
import java.util.Objects;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Serdeable
@Introspected
public final class User {

    // ────────────────────────── Attributes ──────────────────────────
    @NotBlank
    private final UserId id;
    @Valid
    private final ProviderAccount providerAccount;
    @NotBlank
    private final String name;
    @Email
    private final String email;
    private final String description;
    private final String profileImage;
    private final Map<@NotBlank String, String> socials; // {key: social platform, value: URL or handle}
    private final Instant createdAt;
    private final Instant updatedAt;

    public User(
            UserId id,
            ProviderAccount providerAccount,
            String name,
            String email,
            String description,
            String profileImage,
            Map<String, String> socials,
            Instant createdAt,
            Instant updatedAt) {

        this.id = Objects.requireNonNull(id);
        this.providerAccount = providerAccount;
        this.name = Objects.requireNonNull(name);
        this.email = Objects.requireNonNull(email);
        this.description = description;
        this.profileImage = profileImage;
        this.socials = socials;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // ────────────────────────── Getters ──────────────────────────

    public UserId id() { return id; }

    public ProviderAccount provider() { return providerAccount; }

    public String name() { return name; }

    public String email() { return email; }

    public String description() { return description; }

    public String profileImage() { return profileImage; }

    public Map<String, String> socials() { return socials; }

    public Instant createdAt() { return createdAt; }

    public Instant updatedAt() { return updatedAt; }
}
