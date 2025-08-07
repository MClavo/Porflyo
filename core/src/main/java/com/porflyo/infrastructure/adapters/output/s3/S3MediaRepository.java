package com.porflyo.infrastructure.adapters.output.s3;

import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.porflyo.application.ports.output.MediaRepository;
import com.porflyo.domain.model.dto.PresignedPostDto;
import com.porflyo.infrastructure.configuration.S3Config;

import io.micronaut.context.annotation.Requires;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

@Singleton
@Requires(beans = S3Client.class) // Only loads if S3Client is available
public class S3MediaRepository implements MediaRepository {

    private static final Logger logger = LoggerFactory.getLogger(S3MediaRepository.class);
    
    private final S3Client s3;
    private final S3Presigner presigner;
    private final S3Config s3Config;

    @Inject
    public S3MediaRepository(S3Client s3, S3Presigner presigner, S3Config s3Config) {
        this.s3 = s3;
        this.presigner = presigner;
        this.s3Config = s3Config;
    }

    @Override
    public PresignedPostDto generatePost(String bucket, String key, String contentType, long size, String md5) {
        try {
            PutObjectRequest putReq = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(contentType)
                    .contentLength(size)
                    .contentMD5(md5)
                    .build();

            PutObjectPresignRequest presignReq = PutObjectPresignRequest.builder()
                    .putObjectRequest(putReq)
                    .signatureDuration(Duration.ofMinutes(s3Config.expiration()))
                    .build();

            PresignedPutObjectRequest presigned = presigner.presignPutObject(presignReq);

            logger.debug("Generated presigned POST for bucket: {}, key: {}", bucket, key);

            return new PresignedPostDto(
                    presigned.url().toString(),
                    presigned.signedHeaders());

        } catch (Exception e) {
            logger.error("Failed to generate presigned POST for bucket: {}, key: {}", bucket, key, e);
            throw e;
        }
    }

    @Override
    public Object get(String bucket, String key) {
        try {
            GetObjectRequest getReq = GetObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build();

            Object item = s3.getObject(getReq);
            logger.debug("Retrieving object from bucket: {}, key: {}", bucket, key);
            return item;

        } catch (Exception e) {
            logger.error("Failed to retrieve object from bucket: {}, key: {}", bucket, key, e);
            throw e;
        }
    }

    @Override
    public void delete(String bucket, String key) {
        try {
            DeleteObjectRequest deleteReq = DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build();

            s3.deleteObject(deleteReq);
            logger.debug("Deleted object from bucket: {}, key: {}", bucket, key);

        } catch (Exception e) {
            logger.error("Failed to delete object from bucket: {}, key: {}", bucket, key, e);
            throw e;
        }
    }
}
