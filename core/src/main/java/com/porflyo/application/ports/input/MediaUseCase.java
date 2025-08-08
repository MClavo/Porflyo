package com.porflyo.application.ports.input;

import java.io.InputStream;

import com.porflyo.domain.model.dto.PresignedPostDto;

/**
 * Use case interface for media operations, such as generating presigned URLs for file uploads
 * and deleting objects from storage.
 */
public interface MediaUseCase {

    /**
     * Puts an object with the given key.
     *
     * @param key    The key (path) where the file will be stored.
     * @param file   The file to be stored.
     */
    void put(String key, InputStream file);


    /**
     * Creates a presigned POST request for uploading files to a specified key.
     *
     * @param key         The key (path) where the file will be uploaded.
     * @param contentType The content type of the file.
     * @param size       The size of the file.
     * @param md5       The MD5 checksum of the file.
     * @return A PresignedPostDto containing the URL and fields for the presigned POST request.
     */
    PresignedPostDto createPresignedPut(String key, String contentType, long size, String md5);

    /**
     * Retrieves an object from the specified storage using its key.
     *
     * @param key    The key (path) of the object to be retrieved.
     * @return The retrieved object.
     */
    Object get(String key);



    /**
     * Deletes an object from the specified storage using its key.
     *
     * @param key    The key (path) of the object to be deleted.
     */
    void delete(String key);
}
