package com.porflyo.application.services;

import java.io.File;

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
    public void put(String bucket, String key, File file) {
        mediaRepository.put(bucket, key, file);
    }
    
    @Override
    public PresignedPostDto createPresignedPut(String bucket, String key, String contentType, long size, String md5) {
        return mediaRepository.generatePut(bucket, key, contentType, size, md5);
    }

    @Override
    public Object get(String bucket, String key) {
        return mediaRepository.get(bucket, key);
    }

    @Override
    public void delete(String bucket, String key) {
        mediaRepository.delete(bucket, key);
    }
}
