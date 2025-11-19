package com.porflyo.ports;

import java.util.List;
import java.util.Map;

import com.porflyo.model.ids.UserId;
import com.porflyo.usecase.SavedSectionUseCase;

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
     * {@link SavedSection} specific: those keys are not deleted to prevent deleting media still in use in unsaved portfolios.
     */
    List<String> decrementAndReturnDeletables(UserId userId, List<String> mediaKeys);

    /**
     * SavedSection-specific: Decrement all media counts associated with the user's SavedSection.
     * Returns the keys whose count reached <= 0 (i.e., candidates to delete from MediaRepository).
     * Those keys are not deleted at {@link #decrementAndReturnDeletables} level, but only here.
     * This is because the user may want to delete their SSection, but still use the card before saving the portfolio.
     * If the key is deleted at the {@link SavedSectionUseCase} level, the card image would be deleted while the card is still in use.
     */
    List<String> deleteAndReturnSSectionZeros(UserId userId);
}