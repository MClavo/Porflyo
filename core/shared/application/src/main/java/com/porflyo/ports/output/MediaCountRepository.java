package com.porflyo.ports.output;

import java.util.List;
import java.util.Map;
import com.porflyo.model.ids.UserId;

public interface MediaCountRepository {

    /**
     * Replace the entire map of media counters for the user.
     * Prefer using the incremental methods when possible.
     */
    void save(UserId userId, Map<String, Integer> mediaCount);

    /**
     * Return an empty map if nothing exists.
     */
    Map<String, Integer> find(UserId userId);

    /**
     * Delete the whole counter record for the user.
     */
    void delete(UserId userId);

    /**
     * Increment usage count for the given media keys.
     * Returns the updated counts for those keys.
     */
    Map<String, Integer> increment(UserId userId, List<String> mediaKeys);

    /**
     * Decrement usage count for the given media keys.
     * Returns the keys whose count reached <= 0 (i.e., candidates to delete from MediaRepository).
     */
    List<String> decrementAndReturnDeletables(UserId userId, List<String> mediaKeys);
}