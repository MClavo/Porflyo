package com.porflyo.application.services;

import java.io.InputStream;
import java.util.Optional;

import com.porflyo.application.ports.input.MediaUseCase;
import com.porflyo.application.ports.output.MediaRepository;
import com.porflyo.domain.model.dto.PresignedPostDto;

import jakarta.inject.Singleton;

@Singleton
public class MediaService implements MediaUseCase {
     private final MediaRepository mediaRepository;

    public MediaService(MediaRepository mediaRepository) {
        this.mediaRepository = mediaRepository;
    }

    @Override
    public void put(String key, InputStream file) {
        mediaRepository.put(key, file);
    }
    
    @Override
    public PresignedPostDto createPresignedPut(String key, String contentType, long size, String md5) {
        return mediaRepository.generatePut(key, contentType, size, md5);
    }

    @Override
    public Optional<Object> get(String key) {
        return mediaRepository.get(key);
    }

    @Override
    public void delete(String key) {
        mediaRepository.delete(key);
    }
}
