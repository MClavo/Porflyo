package com.porflyo.application.services;

import com.porflyo.application.ports.input.MediaUseCase;
import com.porflyo.application.ports.output.MediaRepository;
import com.porflyo.domain.model.dto.PresignedPostDto;

public class MediaService implements MediaUseCase {
     private final MediaRepository mediaRepository;

    public MediaService(MediaRepository mediaRepository) {
        this.mediaRepository = mediaRepository;
    }

    @Override
    public PresignedPostDto createPresignedPost(String bucket, String key) {
        return mediaRepository.generatePost(bucket, key);
    }

    @Override
    public void delete(String bucket, String key) {
        mediaRepository.deleteObject(bucket, key);
    }
}
