package com.porflyo.infrastructure.adapters.output.s3;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.porflyo.application.ports.output.MediaRepository;
import com.porflyo.domain.model.dto.PresignedPostDto;

import io.micronaut.context.annotation.Requires;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;

@Singleton
@Requires(beans = S3Client.class) // Only loads if S3Client is available
public class S3MediaRepository implements MediaRepository {

    private static final Logger logger = LoggerFactory.getLogger(S3MediaRepository.class);

    private final S3Client s3;
    private final PresignedPostGenerator presigner;

    @Inject
    public S3MediaRepository(S3Client s3, PresignedPostGenerator presigner) {
        this.s3 = s3;
        this.presigner = presigner;
    }

    @Override
    public PresignedPostDto generatePost(String bucket, String key) {
        PresignedPostDto presignedPost = presigner.generate(bucket, key);
        logger.debug("Generated presigned POST for bucket: {}, key: {}, url: {}",
                bucket, key, presignedPost.url());

        return presignedPost;
    }

    @Override
    public void deleteObject(String bucket, String key) {
        DeleteObjectRequest deleteReq = DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();

        s3.deleteObject(deleteReq);

        logger.debug("Deleted object from bucket: {}, key: {}", bucket, key);
    }

}
