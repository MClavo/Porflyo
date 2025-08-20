package com.porflyo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.micronaut.context.annotation.Requires;
import io.micronaut.context.event.ApplicationEventListener;
import io.micronaut.context.event.StartupEvent;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.BucketAlreadyExistsException;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;

/**
 * !!!! NEVER use this in production !!!!
 * <p>
 * Ensures the S3 bucket is created at application startup.
 * <p>
 * This is only active in test and development environments.
 * </p>
 * !!!! NEVER use this in production !!!!
 */
@Singleton
@Requires(beans = {S3Config.class})
@Requires(env = {"s3-integration", "local"}) // Only loads in s3-integration and local environments
public class S3Bootstrap implements ApplicationEventListener<StartupEvent> {

    private static final Logger logger = LoggerFactory.getLogger(S3Bootstrap.class);

    private final S3Client s3Client;
    private final S3Config s3Config;

    @Inject
    public S3Bootstrap(@Named("lowS3Client") S3Client s3Client, S3Config s3Config) {
        this.s3Client = s3Client;
        this.s3Config = s3Config;
    }

    @Override
    public void onApplicationEvent(StartupEvent event) {
        try {
            String bucketName = s3Config.bucketName();
            logger.info("Creating S3 bucket: {} for test/development environment", bucketName);
            
            CreateBucketRequest createRequest = CreateBucketRequest.builder()
                    .bucket(bucketName)
                    .build();
                    
            s3Client.createBucket(createRequest);
            logger.info("S3 bucket created successfully: {}", bucketName);
            
        } catch (BucketAlreadyExistsException e) {
            logger.debug("S3 bucket already exists: {}", s3Config.bucketName());
        } catch (Exception e) {
            logger.error("Failed to create S3 bucket: {}", s3Config.bucketName(), e);
            throw new RuntimeException("Could not create S3 bucket for test/development", e);
        }
    }
}
