package com.porflyo;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.File;
import java.util.Map;

import org.junit.jupiter.api.TestInstance;
import org.testcontainers.containers.localstack.LocalStackContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import com.porflyo.ports.MediaRepositoryContract;

import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import io.micronaut.test.support.TestPropertyProvider;
import jakarta.annotation.PostConstruct;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import software.amazon.awssdk.services.s3.S3Client;

@MicronautTest(environments = {"integration"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Testcontainers
class S3MediaRepositoryIntegrationTest
        extends MediaRepositoryContract
        implements TestPropertyProvider {

    @Container
    @SuppressWarnings("resource")
    static LocalStackContainer S3 = new LocalStackContainer(DockerImageName.parse("localstack/localstack:latest"))
        .withServices(LocalStackContainer.Service.S3);

    @Inject
    S3MediaRepository injectedRepository;

    @Inject
    @Named("lowS3Client")
    S3Client s3client;

    private static final String BUCKET = "porflyo-media-test";
    private static final String KEY = "uploads/test.txt";
    private static final File TEST_FILE = new File("src/test/resources/S3Test.txt");

    protected S3MediaRepositoryIntegrationTest() {
        super(null);
    }

    @PostConstruct
    void init() {
        this.repository = injectedRepository;
    }

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

    @Override
    protected File getTestFile() {
        return TEST_FILE;
    }

    @Override
    protected String getTestKey() {
        return KEY;
    }

    @Override
    protected String getTestContentType() {
        return "text/plain";
    }

    @Override
    protected void verifyObjectDeleted(String key) {
        var listed = s3client.listObjectsV2(b -> b.bucket(BUCKET).prefix(key));
        assertTrue(listed.contents().isEmpty(), "Object should be deleted but still exists in S3");
    }
}
