package com.porflyo.ports;

import java.net.URI;
import java.util.Optional;

import com.porflyo.dto.PresignedPostDto;

import jakarta.validation.constraints.NotNull;

/**
 * Port interface for media operations, such as generating presigned URLs for file uploads
 * and deleting objects from storage.
 */
public interface MediaRepository {

    
    /**
     * Resolves the URL associated with the given key.
     *
     * @param key the unique identifier used to retrieve the corresponding URL
     * @return the resolved URL as a String
     */
    String resolveUrl(String key);

    /**
     * Extracts the S3 key from a complete S3 URL.
     *
     * @param url the complete S3 URL to extract the key from
     * @return the S3 key, or null if the URL is not a valid S3 URL
     */
    String extractKeyFromUrl(String url);


    /**
     * Only available for the backend, used to upload files when the user is first
     * created
     */
    void putFromUrl(@NotNull String key, @NotNull URI url);
    
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
    PresignedPostDto generatePut(@NotNull String key, @NotNull String contentType, @NotNull long size, @NotNull String md5);


    /**
     * Mainly used in tests.
     */
    @NotNull
    Optional<Object> get(String key);

    /**
     * Deletes an object from storage using the specified key.
     * Does not verify if the object is used in more than one place.
     */
    void delete(String key);
    
}
