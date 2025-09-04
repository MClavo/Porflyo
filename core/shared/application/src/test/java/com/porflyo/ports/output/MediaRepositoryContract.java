package com.porflyo.ports.output;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.porflyo.dto.PresignedPostDto;

public abstract class MediaRepositoryContract {
    protected MediaRepository repository;

    protected MediaRepositoryContract(MediaRepository repository) {
        this.repository = repository;
    }

    /**
     * Subclasses should provide a test file for upload tests.
     * The file should exist and be readable.
     */
    protected abstract File getTestFile();

    /**
     * Subclasses should provide a test key for upload operations.
     */
    protected abstract String getTestKey();

    /**
     * Subclasses should provide the expected content type for the test file.
     */
    protected abstract String getTestContentType();

    @Test
    @DisplayName("should generate presigned URL with valid fields")
    protected void shouldGeneratePresignedUrl_whenValidParameters() throws Exception {
        // Given
        File testFile = getTestFile();
        String key = getTestKey();
        String contentType = getTestContentType();
        String md5 = calculateMd5Base64(testFile);

        // When
        PresignedPostDto dto = repository.generatePut(key, contentType, testFile.length(), md5);

        // Then
        assertNotNull(dto.url(), "URL must not be null");
        assertNotNull(dto.fields(), "Fields must not be null");
        assertTrue(dto.url().startsWith("http"), "URL should be a valid HTTP URL");
    }

    @Test
    @DisplayName("should upload file with presigned URL and retrieve it")
    protected void shouldUploadAndRetrieve_whenUsingPresignedUrl() throws Exception {
        // Given
        File testFile = getTestFile();
        String key = getTestKey();
        String contentType = getTestContentType();
        String md5 = calculateMd5Base64(testFile);

        // When
        PresignedPostDto dto = repository.generatePut(key, contentType, testFile.length(), md5);
        uploadWithPresignedPut(dto, testFile.toPath());

        // Then
        Optional<Object> retrievedObject = repository.get(key);
        assertTrue(retrievedObject.isPresent(), "Retrieved object should exist");
        assertNotNull(retrievedObject.get(), "Retrieved object should not be null");
    }

    @Test
    @DisplayName("should upload, retrieve and delete file successfully")
    protected void shouldUploadRetrieveAndDelete_whenValidOperations() throws Exception {
        // Given
        File testFile = getTestFile();
        String key = getTestKey();
        String contentType = getTestContentType();
        String md5 = calculateMd5Base64(testFile);

        // When
        PresignedPostDto dto = repository.generatePut(key, contentType, testFile.length(), md5);
        uploadWithPresignedPut(dto, testFile.toPath());

        // Verify upload
        Optional<Object> retrievedObject = repository.get(key);
        assertTrue(retrievedObject.isPresent(), "Object should exist after upload");

        // Delete
        repository.delete(key);

        // Then
        verifyObjectDeleted(key);
    }

    @Test
    @DisplayName("should resolve URL for given key")
    protected void shouldResolveUrl_whenValidKey() {
        // Given
        String key = getTestKey();

        // When
        String url = repository.resolveUrl(key);

        // Then
        assertNotNull(url, "Resolved URL should not be null");
        assertTrue(url.contains(key), "URL should contain the key");
    }

    /**
     * Subclasses should implement this method to verify that an object has been deleted.
     * This might involve checking the storage directly or using repository methods.
     */
    protected abstract void verifyObjectDeleted(String key);

    /**
     * Calculates MD5 hash in Base64 format for the given file.
     */
    private static String calculateMd5Base64(File file) throws Exception {
        byte[] data = Files.readAllBytes(file.toPath());
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] digest = md.digest(data);
        return java.util.Base64.getEncoder().encodeToString(digest);
    }

    /**
     * Uploads a file using the presigned PUT URL.
     */
    private static void uploadWithPresignedPut(PresignedPostDto dto, Path file) throws IOException, InterruptedException {
        byte[] fileBytes = Files.readAllBytes(file);

        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(URI.create(dto.url()))
                .PUT(HttpRequest.BodyPublishers.ofByteArray(fileBytes));

        // Add signed headers, but skip restricted ones
        Set<String> restrictedHeaders = Set.of("content-length", "host", "connection");
        for (Map.Entry<String, List<String>> entry : dto.fields().entrySet()) {
            String headerName = entry.getKey().toLowerCase();
            if (!restrictedHeaders.contains(headerName)) {
                for (String value : entry.getValue()) {
                    requestBuilder.header(entry.getKey(), value);
                }
            }
        }

        HttpRequest request = requestBuilder.build();
        HttpClient client = HttpClient.newHttpClient();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IOException("Upload failed with HTTP " + response.statusCode() + ": " + response.body());
        }
    }
}
