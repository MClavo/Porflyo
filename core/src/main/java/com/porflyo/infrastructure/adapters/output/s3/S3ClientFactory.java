package com.porflyo.infrastructure.adapters.output.s3;

import java.net.URI;

import com.porflyo.infrastructure.configuration.S3Config;

import io.micronaut.context.annotation.Factory;
import io.micronaut.context.annotation.Requires;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;


/**
 * Supplies a shared {@link S3Client} and {@link S3Presigner} for the entire application.
 * 
 */
@Factory
@Requires(beans = S3Config.class) // Only loads if S3Config is available
public class S3ClientFactory {

    private final S3Config s3Config;

    @Inject
    public S3ClientFactory(S3Config s3Config) {
        this.s3Config = s3Config;
    }
    
    @Singleton
    @Named("lowS3Client")
    public S3Client createS3Client() {

        String endpoint = s3Config.endpoint();
        Region region = Region.of(s3Config.region());

        AwsBasicCredentials fakeCreds = AwsBasicCredentials.create("test", "test");

        return S3Client.builder()
            .region(region)
            .endpointOverride(URI.create(endpoint))
            .credentialsProvider(StaticCredentialsProvider.create(fakeCreds))
            .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build())
            .build();
    }

    @Singleton
    public S3Presigner createPresigner(@Named("lowS3Client") S3Client low) {
        String endpoint = s3Config.endpoint();
        Region region = Region.of(s3Config.region());
        
        AwsBasicCredentials fakeCreds = AwsBasicCredentials.create("test", "test");
        
        // For presigner to work with LocalStack, we need to configure it explicitly
        return S3Presigner.builder()
            .region(region)
            .endpointOverride(URI.create(endpoint))
            .credentialsProvider(StaticCredentialsProvider.create(fakeCreds))
            .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build())
            .build();
    }
}
