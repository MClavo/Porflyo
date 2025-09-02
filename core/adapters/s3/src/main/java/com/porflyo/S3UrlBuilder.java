package com.porflyo;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
public class S3UrlBuilder {

    private final S3Config s3Config;

    @Inject
    public S3UrlBuilder(S3Config s3Config) {
        this.s3Config = s3Config;
    }

    private final String productionBaseUrl = "https://media.porflyo.com/";

    /** Build public URL for an S3 object key. */
    public String buildPublicUrl(String key) {
        if (key == null || key.isBlank())
            return null;

        final String bucket = s3Config.bucketName();
        final String endpoint = trimToEmpty(s3Config.endpoint());
        final String safeKey = encodePath(key);

        final String url;
        if (!endpoint.isEmpty()) {
            // Local / LocalStack -> http(s)://endpoint/bucket/key
            url = stripTrailingSlash(endpoint) + "/" + bucket + "/" + safeKey;

        } else {
            // Prod -> https://media.porflyo.com/key
            url = productionBaseUrl + safeKey;
        }

        return url;
    }

    /** Extract the S3 key from a URL produced by this builder. */
    public String extractKeyFromUrl(String url) {
        if (url == null || url.isBlank())
            return null;

        final String bucket = s3Config.bucketName();
        final String endpoint = trimToEmpty(s3Config.endpoint());

        if (!endpoint.isEmpty()) {
            // {endpoint}/{bucket}/{key}
            final String base = stripTrailingSlash(endpoint) + "/" + bucket + "/";
            return url.startsWith(base) ? url.substring(base.length()) : null;

        } else {
            // Prod -> https://media.porflyo.com/key
            return url.startsWith(productionBaseUrl) ? url.substring(productionBaseUrl.length()) : null;
        }
    }

    // ────────────────────── helpers ──────────────────────

    private static String trimToEmpty(String s) {
        return s == null ? "" : s.trim();
    }

    private static String stripTrailingSlash(String s) {
        return (s.endsWith("/")) ? s.substring(0, s.length() - 1) : s;
    }

    /** Encode each path segment; keep '/' separators. */
    private static String encodePath(String key) {
        String[] parts = key.split("/");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            if (i > 0)
                sb.append('/');
            String enc = URLEncoder.encode(parts[i], StandardCharsets.UTF_8).replace("+", "%20");
            sb.append(enc);
        }
        return sb.toString();
    }
}
