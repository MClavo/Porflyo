package com.porflyo.infrastructure.adapters.output.s3;

import static org.junit.jupiter.api.Assertions.assertEquals;
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
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.testcontainers.containers.localstack.LocalStackContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import com.porflyo.application.ports.output.MediaRepository;
import com.porflyo.domain.model.dto.PresignedPostDto;

import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import io.micronaut.test.support.TestPropertyProvider;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import software.amazon.awssdk.services.s3.S3Client;

@MicronautTest(environments = {"s3-integration"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Testcontainers
class S3MediaRepositoryIntegrationTest implements TestPropertyProvider {

    @Container
    @SuppressWarnings("resource")
    static LocalStackContainer S3 = new LocalStackContainer(DockerImageName.parse("localstack/localstack:latest"))
        .withServices(LocalStackContainer.Service.S3);

    @Inject
    MediaRepository mediaRepository;

    @Inject
    @Named("lowS3Client")
    S3Client s3client;                               

    private static final String BUCKET = "media-test";
    private static final String KEY    = "uploads/test.txt";

    @Override
    public Map<String, String> getProperties() {
        if (!S3.isRunning()) {
            S3.start();
        }
        String s3Url = "http://" + S3.getHost() + ":" + S3.getMappedPort(4566);
        return Map.of(
            "s3.endpoint", s3Url,
            "micronaut.test.resources.enabled", "false"
        );
    }

    // Test file to upload
    private static final File testFile = new File("src/test/resources/S3Test.txt");


    @Test
    void presignedPutAndDeleteRoundTrip() throws Exception {
        // Given
        String md5 = md5Base64(testFile);

        // When
        PresignedPostDto dto = mediaRepository.generatePost(
                BUCKET, 
                KEY, 
                "text/plain", 
                testFile.length(), 
                md5);

        // Then
        assertNotNull(dto.url(), "URL must not be null");
        assertNotNull(dto.fields(), "Fields must not be null");

        
        // Upload the file using the presigned URL (PUT method)
        uploadWithPresignedPut(dto, testFile.toPath());

        // Verify the file was uploaded
        var listed = s3client.listObjectsV2(b -> b.bucket(BUCKET).prefix(KEY));
        assertEquals(1, listed.contents().size(), "Object should exist");

        // Test get method
        Object retrievedObject = mediaRepository.get(BUCKET, KEY);
        assertNotNull(retrievedObject, "Retrieved object should not be null");

        /* ---------- Delete via repository ---------- */
        mediaRepository.delete(BUCKET, KEY);

        listed = s3client.listObjectsV2(b -> b.bucket(BUCKET).prefix(KEY));
        assertTrue(listed.contents().isEmpty(), "Object should be deleted");
    }


    private static String md5Base64(File file) throws Exception {
        // 1) Read the entire file into a byte array
        byte[] data = Files.readAllBytes(file.toPath());
        // 2) Create the MD5 digest
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] digest = md.digest(data);
        // 3) Convert to Base64 as S3 expects Base64 for Content-MD5
        return java.util.Base64.getEncoder().encodeToString(digest);
    }


    public static void uploadWithPresignedPut(PresignedPostDto dto, Path file) throws IOException, InterruptedException {
        // Read file content
        byte[] fileBytes = Files.readAllBytes(file);

        // Build the PUT request with the presigned URL
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(URI.create(dto.url()))
                .PUT(HttpRequest.BodyPublishers.ofByteArray(fileBytes));

        // Add any signed headers to the request, but skip restricted headers
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

        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            System.out.println("Upload succeeded: " + response.statusCode());
        } else {
            throw new IOException("Upload failed with HTTP " + response.statusCode() + ": " + response.body());
        }
    }
}
