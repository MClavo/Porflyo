package com.porflyo.application.ports.output;

import com.porflyo.domain.model.dto.PresignedPostDto;

/**
 * Port interface for media operations, such as generating presigned URLs for file uploads
 * and deleting objects from storage.
 */
public interface MediaRepository {

    /**
     * Puts an object into the specified storage bucket with the given key.
     *
     * @param bucket The name of the storage bucket.
     * @param key    The key (path) where the object will be stored.
     * @param object The object to be stored.
     */
    void put(String bucket, String key, Object object);

    /**
     * Generates a presigned POST request for uploading files to a specified bucket and key.
     *
     * @param bucket The name of the storage bucket.
     * @param key    The key (path) where the file will be uploaded.
     * @return A PresignedPostDto containing the URL and fields for the presigned POST request.
     */
    PresignedPostDto generatePut(String bucket, String key, String contentType, long size, String md5);


    /**
     * Retrieves an object from the specified storage bucket using its key.
     *
     * @param bucket The name of the storage bucket.
     * @param key    The key (path) of the object to be retrieved.
     * 
     * Note: The return type is Object for simplicity, but it should be replaced with a specific type
     * @return The retrieved object.
     */
    Object get(String bucket, String key);

    /**
     * Deletes an object from the specified storage bucket using its key.
     *
     * @param bucket The name of the storage bucket.
     * @param key    The key (path) of the object to be deleted.
     */
    void delete(String bucket, String key);
    
}
