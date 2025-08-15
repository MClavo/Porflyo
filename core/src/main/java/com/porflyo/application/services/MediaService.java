package com.porflyo.application.services;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.porflyo.application.dto.PresignedPostDto;
import com.porflyo.application.ports.input.MediaUseCase;
import com.porflyo.application.ports.output.MediaCountRepository;
import com.porflyo.application.ports.output.MediaRepository;
import com.porflyo.domain.model.ids.UserId;

import jakarta.inject.Singleton;

@Singleton
public class MediaService implements MediaUseCase {
    private static final Logger log = LoggerFactory.getLogger(MediaService.class);

    private final MediaRepository mediaRepository;               // S3 adapter (infrastructure)
    private final MediaCountRepository mediaCountRepository;     // DynamoDB counter adapter (infrastructure)

    public MediaService(MediaRepository mediaRepository,
                        MediaCountRepository mediaCountRepository) {
        this.mediaRepository = mediaRepository;
        this.mediaCountRepository = mediaCountRepository;
    }

    // ────────────────────────── Upload / Delete ──────────────────────────

    @Override
    public PresignedPostDto createPresignedPut(String key, String contentType, long size, String md5) {
        return mediaRepository.generatePut(key, contentType, size, md5);
    }

    @Override
    public void delete(String key) {
        mediaRepository.delete(key);
    }

    // ────────────────────────── Usage counters ──────────────────────────

    @Override
    public Map<String, Integer> incrementUsage(UserId userId, List<String> mediaKeys) {
        if (mediaKeys == null || mediaKeys.isEmpty()) return Map.of();
        return mediaCountRepository.increment(userId, mediaKeys);
    }

    @Override
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