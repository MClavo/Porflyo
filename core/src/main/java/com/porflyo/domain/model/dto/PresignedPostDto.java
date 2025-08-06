package com.porflyo.domain.model.dto;

import java.util.Map;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Data Transfer Object for presigned POST requests.
 * <p>
 * This DTO contains the URL and fields required for uploading files to a storage service
 * using a presigned POST request.
 * </p>
 *
 * @param url    The presigned URL for the POST request.
 * @param fields The fields required for the POST request, typically including metadata and security tokens.
 */
@Serdeable
@Introspected
public record PresignedPostDto(
        String url,
        Map<String, String> fields
) {}