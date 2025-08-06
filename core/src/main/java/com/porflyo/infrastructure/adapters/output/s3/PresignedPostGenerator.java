package com.porflyo.infrastructure.adapters.output.s3;

import java.nio.charset.StandardCharsets;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import com.porflyo.domain.model.dto.PresignedPostDto;
import com.porflyo.infrastructure.configuration.S3Config;

import io.micronaut.context.annotation.Requires;
import jakarta.inject.Singleton;

@Singleton
@Requires(classes = S3Config.class)
public class PresignedPostGenerator {

    private static final DateTimeFormatter DATE_STAMP = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final DateTimeFormatter AMZ_DATE  = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'");
    private static final String HMAC_SHA256 = "HmacSHA256";

    private final S3Config config;

    public PresignedPostGenerator(S3Config config) {
        this.config = config;
    }

    /**
     * Generates a presigned POST policy and signature for a given bucket/key.
     * <p>
     * Policy: {@link https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-HTTPPOSTConstructPolicy.html}
     *
     * @param bucket the S3 bucket name
     * @param key    the object key prefix (you can include folders)
     * @return a DTO containing the POST URL and the set of form fields
     */
    public PresignedPostDto generate(String bucket, String key) {
        try {
            // Now in UTC
            ZonedDateTime now      = ZonedDateTime.now(ZoneOffset.UTC);
            String dateStamp       = now.format(DATE_STAMP);
            String amzDate         = now.format(AMZ_DATE);

            // Credential scope
            String credentialScope = String.join("/",
                config.accessKey(),     // CRITICAL: IMPLEMENT DefaultCredentialsProvider
                dateStamp,
                config.region(),
                "s3",
                "aws4_request"
            );

            // Policy JSON
            String expiration = now
                .plusMinutes(config.expiration())
                .format(DateTimeFormatter.ISO_INSTANT);

            String policy = "{"
                + "\"expiration\":\"" + expiration + "\","
                + "\"conditions\":["
                + "{\"bucket\":\"" + bucket + "\"},"
                + "[\"starts-with\",\"$key\",\"" + key + "\"],"
                + "{\"x-amz-algorithm\":\"AWS4-HMAC-SHA256\"},"
                + "{\"x-amz-credential\":\"" + config.accessKey() + "/" + credentialScope + "\"},"
                + "{\"x-amz-date\":\"" + amzDate + "\"}"
                + "]"
                + "}";

            // Base64 encode
            String policyBase64 = Base64.getEncoder()
                .encodeToString(policy.getBytes(StandardCharsets.UTF_8));

            // Derive signing key
            byte[] kSecret  = ("AWS4" + config.secretKey()).getBytes(StandardCharsets.UTF_8);
            byte[] kDate    = hmacSha256(kSecret, dateStamp);
            byte[] kRegion  = hmacSha256(kDate,    config.region());
            byte[] kService = hmacSha256(kRegion,  "s3");
            byte[] kSigning = hmacSha256(kService, "aws4_request");

            // Sign the policy
            byte[] sigBytes  = hmacSha256(kSigning, policyBase64);
            String signature = toHex(sigBytes);

            // Build form fields
            Map<String, String> fields = new LinkedHashMap<>();
            fields.put("key",             key);
            fields.put("policy",          policyBase64);
            fields.put("x-amz-algorithm", "AWS4-HMAC-SHA256");
            fields.put("x-amz-credential", config.accessKey() + "/" + credentialScope);
            fields.put("x-amz-date",      amzDate);
            fields.put("x-amz-signature", signature);

            // Construct the endpoint URL
            String url = config.endpoint() + "/" + bucket;

            return new PresignedPostDto(url, fields);

        } catch (Exception e) {
            throw new RuntimeException("Unable to generate presigned POST", e);
        }
    }

    private byte[] hmacSha256(byte[] key, String data) throws Exception {
        Mac mac = Mac.getInstance(HMAC_SHA256);
        mac.init(new SecretKeySpec(key, HMAC_SHA256));
        return mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
    }

    private String toHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b & 0xff));
        }
        return sb.toString();
    }
}
