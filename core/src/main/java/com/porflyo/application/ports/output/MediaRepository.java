package com.porflyo.application.ports.output;

import com.porflyo.domain.model.dto.PresignedPostDto;

/**
 * Port interface for media operations, such as generating presigned URLs for file uploads
 * and deleting objects from storage.
 */
public interface MediaRepository {
    /**
     * Generates a presigned POST request for uploading files to a specified bucket and key.
     *
     * @param bucket The name of the storage bucket.
     * @param key    The key (path) where the file will be uploaded.
     * @return A PresignedPostDto containing the URL and fields for the presigned POST request.
     */
    PresignedPostDto generatePost(String bucket, String key);

    /**
     * Deletes an object from the specified storage bucket using its key.
     *
     * @param bucket The name of the storage bucket.
     * @param key    The key (path) of the object to be deleted.
     */
    void deleteObject(String bucket, String key);
}
