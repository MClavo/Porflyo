package com.porflyo.application.services;

import com.porflyo.application.dto.PresignedPostDto;
import com.porflyo.application.ports.input.MediaUseCase;
import com.porflyo.application.ports.output.MediaRepository;

import jakarta.inject.Singleton;

@Singleton
public class MediaService implements MediaUseCase {
     private final MediaRepository mediaRepository;

    public MediaService(MediaRepository mediaRepository) {
        this.mediaRepository = mediaRepository;
    }

    @Override
    public PresignedPostDto createPresignedPut(String key, String contentType, long size, String md5) {
        return mediaRepository.generatePut(key, contentType, size, md5);
    }

    @Override
    public void delete(String key) {
        mediaRepository.delete(key);
    }
}
