package com.porflyo.infrastructure.adapters.output.s3;

import java.util.logging.Logger;

import com.porflyo.infrastructure.configuration.S3Config;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
public class S3UrlBuilder {

    private static final Logger log = Logger.getLogger(S3UrlBuilder.class.getName());
    private final S3Config s3Config;

    private static final String S3_URL_FORMAT = "https://%s.s3.amazonaws.com/%s";

    @Inject
    public S3UrlBuilder(S3Config s3Config) {
        this.s3Config = s3Config;
    }

    /**
     * Builds the complete public URL for an S3 object key
     * 
     * @param key The S3 object key
     * @return The complete public URL
     */
    public String buildPublicUrl(String key) {
        if (key == null || key.trim().isEmpty())
            return null;

        String endpoint = s3Config.endpoint().trim();
        String url;

        // LOCAL AWS Format: https://<endpoint>/<bucket-name>/<key>
        if (!endpoint.isEmpty()) {
            url = String.format("%s/%s/%s", endpoint, s3Config.bucketName(), key);
        } else {
            url = String.format(S3_URL_FORMAT, s3Config.bucketName(), key);
        }

        log.info("Building S3 public URL: " + url);
        return url;
    }

    /**
     * Extracts the S3 key from a complete S3 URL
     * 
     * @param url The complete S3 URL
     * @return The S3 key, or null if the URL is not a valid S3 URL
     */
    public String extractKeyFromUrl(String url) {
        if (url == null || url.trim().isEmpty())
            return null;

        try {
            // Expected format: https://bucket-name.s3.amazonaws.com/key
            String bucketPrefix = String.format(S3_URL_FORMAT, s3Config.bucketName(), "");
            if (url.startsWith(bucketPrefix))
                return url.substring(bucketPrefix.length());

            return null;
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid S3 URL format: " + url, e);
        }
    }
}
