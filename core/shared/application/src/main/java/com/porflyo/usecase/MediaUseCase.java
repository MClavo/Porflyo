package com.porflyo.usecase;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.porflyo.dto.PresignedPostDto;
import com.porflyo.model.ids.UserId;
import com.porflyo.ports.MediaCountRepository;
import com.porflyo.ports.MediaRepository;

import jakarta.inject.Inject;

public class MediaUseCase {
    private static final Logger log = LoggerFactory.getLogger(MediaUseCase.class);

    private final MediaRepository mediaRepository;
    private final MediaCountRepository mediaCountRepository;

    @Inject
    public MediaUseCase(MediaRepository mediaRepository,
                        MediaCountRepository mediaCountRepository) {
        this.mediaRepository = mediaRepository;
        this.mediaCountRepository = mediaCountRepository;
    }

    // ────────────────────────── ResolveUrl ──────────────────────────

    public String resolveUrl(String key) {
        return mediaRepository.resolveUrl(key);
    }

    public String extractKeyFromUrl(String url) {
        return mediaRepository.extractKeyFromUrl(url);
    }

    // ────────────────────────── Upload / Delete ──────────────────────────

    public PresignedPostDto createPresignedPut(String key, String contentType, long size, String md5) {
        return mediaRepository.generatePut(key, contentType, size, md5);
    }

    
    public void delete(String key) {
        mediaRepository.delete(key);
    }

    // ────────────────────────── Usage counters ──────────────────────────

    
    public Map<String, Integer> incrementUsage(UserId userId, List<String> mediaKeys) {
        if (mediaKeys == null || mediaKeys.isEmpty()) return Map.of();
        return mediaCountRepository.increment(userId, mediaKeys);
    }

    
    public List<String> decrementUsageAndDeleteUnused(UserId userId, List<String> mediaKeys) {
        if (mediaKeys == null || mediaKeys.isEmpty()) return List.of();

        List<String> toDelete = mediaCountRepository.decrementAndReturnDeletables(userId, mediaKeys);

        // delete (idempotent if fails)
        for (String key : toDelete) {
            try {
                mediaRepository.delete(key);
            } catch (Exception ex) {
                log.error("Error deleting media key {}: {}", key, ex.getMessage(), ex);
                // Maybe one day re-increment
            }
        }
        return toDelete;
    }
}