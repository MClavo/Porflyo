package com.porflyo.application.ports.input;

import java.util.Map;
import java.util.Optional;

import com.porflyo.domain.model.shared.EntityId;
import com.porflyo.domain.model.user.User;

import io.micronaut.core.annotation.NonNull;
import io.micronaut.validation.Validated;
import jakarta.validation.Valid;

/**
 * UserUseCase defines the contract for user management operations in the application.
 * <p>
 * This interface provides methods for creating, retrieving, updating, and deleting user entities.
 * All parameters and return values are expected to be non-null unless otherwise specified.
 * Validation annotations are used to ensure domain integrity.
 * </p>
 *
 * <ul>
 *   <li>{@link #create(User)}: Creates a new user and returns its identifier.</li>
 *   <li>{@link #findById(EntityId)}: Retrieves a user by its identifier, returning an {@code Optional}.</li>
 *   <li>{@link #update(User)}: Updates an existing user and returns the updated instance.</li>
 *   <li>{@link #delete(EntityId)}: Deletes a user and all dependent items.</li>
 * </ul>
 *
 * <p>
 * Implementations should ensure transactional consistency and proper validation of input parameters.
 * </p>
 */
@Validated
public interface UserUseCase {
    
     /**
     * Creates a new user.
     *
     * @param user A fully-validated domain object (must carry a non-null id).
     * @return The identifier assigned to the user (same as {@code user.id()}).
     */
    @NonNull
    EntityId create(@Valid @NonNull User user);

    /**
     * Retrieves a user by id.
     *
     * @param id The user identifier.
     * @return Optional present if found, empty otherwise.
     */
    @NonNull
    Optional<User> findById(@NonNull EntityId id);

     /**
     * Updates an existing user.
     *
     * @param user The modified user instance (immutable aggregate).
     * @return The updated user after persistence.
     */
    @NonNull
    User patch(@Valid @NonNull EntityId id, @NonNull Map<String, Object> attributes);

    /**
     * Deletes a user and every dependent item (portfolios, merits…) if needed.
     *
     * @param id The identifier to remove.
     */
    void delete(@NonNull EntityId id);
}
