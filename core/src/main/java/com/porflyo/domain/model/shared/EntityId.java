package com.porflyo.domain.model.shared;

import com.github.ksuid.Ksuid;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotBlank;

/**
 * Globally-unique, time-sortable identifier for any aggregate root.
 * Generated via KSUID so lexicographic order == creation order.
 */
@Serdeable
@Introspected
public record EntityId(@NotBlank String value) {

    public EntityId {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("EntityId cannot be null or blank");
        }
    }

    /** Generates a new KSUID {@code EntityId} */
    public static EntityId newKsuid() {
        return new EntityId(Ksuid.newKsuid().toString());
    }
}