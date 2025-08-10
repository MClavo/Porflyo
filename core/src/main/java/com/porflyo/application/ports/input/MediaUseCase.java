package com.porflyo.application.ports.input;

import com.porflyo.application.dto.PresignedPostDto;

import jakarta.validation.constraints.NotNull;

/**
 * MediaUseCase interface defines operations related to media management,
 * such as uploading files and creating presigned URLs for file uploads.
 */
public interface MediaUseCase {
    /**
     * Creates a presigned POST request for uploading files to a specified key.
     * The bucket and region are configured in the application properties.
     *
     * @param key         The key (path) where the file will be uploaded.
     * @param contentType The content type of the file.
     * @param size       The size of the file.
     * @param md5       The MD5 base64 checksum of the file.
     * @return A PresignedPostDto containing the URL and fields for the presigned POST request.
     */
    @NotNull
    PresignedPostDto createPresignedPut(@NotNull String key, @NotNull String contentType, @NotNull long size, @NotNull String md5);

    /**
     * Deletes an object from storage using the specified key.
     * Does not verify if the object is used in more than one place.
     */
    void delete(String key);
}
