package com.porflyo.infrastructure.adapters.input.lambda.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.application.ports.input.MediaUseCase;
import com.porflyo.domain.model.dto.PresignedPostDto;
import com.porflyo.infrastructure.adapters.input.lambda.api.dto.PresignRequestDto;
import com.porflyo.infrastructure.adapters.input.lambda.utils.LambdaHttpUtils;
import com.porflyo.infrastructure.configuration.S3Config;

import io.micronaut.json.JsonMapper;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
public class MediaLambdaHandler {
    private final Logger log = LoggerFactory.getLogger(MediaLambdaHandler.class);   
    private final JsonMapper jsonMapper;
    private final MediaUseCase mediaService;
    private final S3Config s3Config;
    
    @Inject
    public MediaLambdaHandler(JsonMapper jsonMapper, MediaUseCase mediaService, S3Config s3Config) {
        this.jsonMapper = jsonMapper;
        this.mediaService = mediaService;
        this.s3Config = s3Config;
    }

    public APIGatewayV2HTTPResponse handleMediaRequest(APIGatewayV2HTTPEvent input) {
    try {
        String method = input.getRequestContext().getHttp().getMethod();
        String key = input.getPathParameters().get("key");
        String body = input.getBody();

        return processMediaRequest(method, key, body);

    } catch (Exception e) {
        log.error("Error processing media request", e);
        return LambdaHttpUtils.createErrorResponse(500, "Internal Server Error");
    }
}


    // ────────────────────────── Gateway ──────────────────────────

    private APIGatewayV2HTTPResponse processMediaRequest(String method, String key, String body) {
        log.debug("Processing media request: {} {}", method, key);

        switch (method.toLowerCase()) {
            case "post":
                return generatePresignedPut(body);

            case "delete":
                return deleteMediaObject(key);
        
            default:
                log.warn("Invalid method request: {}", method);
                return LambdaHttpUtils.createErrorResponse(404, "Not Found");
        }
    }



    // ────────────────────────── Media Management ────────────────────────── 

    /**
     * Generates a presigned PUT URL for uploading media files.
     *
     * @param body The request body containing bucket, key, contentType, size, and md5.
     * @return An APIGatewayV2HTTPResponse with the presigned URL and fields.
     */
    APIGatewayV2HTTPResponse generatePresignedPut(String body) {
        try {
            // Parse the request body to extract bucket, key, contentType, size, and md5
            PresignRequestDto requestDto = jsonMapper.readValue(body, PresignRequestDto.class);
            
            // Generate the presigned PUT URL
            PresignedPostDto result = mediaService.createPresignedPut(
                requestDto.key(),
                requestDto.contentType(),
                requestDto.size(),
                requestDto.md5()
            );

            log.debug("Generated presigned PUT URL for key: {}", requestDto.key());
            return LambdaHttpUtils.createResponse(200, jsonMapper.writeValueAsString(result));
        } catch (Exception e) {
            log.error("Failed to generate presigned PUT URL", e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal Server Error");
        }
    }

    /**
     * Deletes a media object based on the provided key.
     *
     * @param key The key of the media object to delete.
     * @return An APIGatewayV2HTTPResponse indicating success or failure.
     */
    private APIGatewayV2HTTPResponse deleteMediaObject(String key) {
        try {
            mediaService.delete(key);
            
            log.debug("Deleted media object with key: {}", key);
            return LambdaHttpUtils.createResponse(204, "No Content");
        } catch (Exception e) {
            log.error("Failed to delete media object", e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal Server Error");
        }
    }

}
