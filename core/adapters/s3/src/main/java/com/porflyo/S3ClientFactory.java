package com.porflyo;

import java.net.URI;

import io.micronaut.context.annotation.Factory;
import io.micronaut.context.annotation.Requires;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
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
    
    private AwsBasicCredentials fakeCreds = AwsBasicCredentials.create("test", "test");


    // ────────────────────────── LOCAL ──────────────────────────

    @Singleton
    @Named("lowS3Client")
    @Requires(env = {"local", "integration"})
    S3Client localS3Client() {
        Region region = Region.of(s3Config.region());
        return S3Client.builder()
            .region(region)
            .endpointOverride(URI.create(s3Config.endpoint()))
            .credentialsProvider(StaticCredentialsProvider.create(fakeCreds))
            .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build())
            .httpClient(UrlConnectionHttpClient.builder().build())
            .build();
    }

    @Singleton
    @Requires(env = {"local", "integration"})
    S3Presigner localS3Presigner() {
        Region region = Region.of(s3Config.region());
        return S3Presigner.builder()
            .region(region)
            .endpointOverride(URI.create(s3Config.endpoint()))
            .credentialsProvider(StaticCredentialsProvider.create(fakeCreds))
            .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build())
            .build();
    }

    
    // ────────────────────────── PRODUCTION ──────────────────────────

    @Singleton
    @Named("lowS3Client")
    @Requires(notEnv = {"local", "integration"})
    S3Client prodS3Client() {
        Region region = Region.of(s3Config.region());
        return S3Client.builder()
            .region(region)
            .credentialsProvider(DefaultCredentialsProvider.builder().build())
            .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(false).build())
            .httpClient(UrlConnectionHttpClient.builder().build())
            .build();
    }
    

    @Singleton
    @Requires(notEnv = {"local", "integration"})
    S3Presigner prodS3Presigner() {
        Region region = Region.of(s3Config.region());
        return S3Presigner.builder()
            .region(region)
            .credentialsProvider(DefaultCredentialsProvider.builder().build())
            .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(false).build())
            .build();
    }

}
