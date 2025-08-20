package com.porflyo.dto;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record PresignRequestDto(
    String key,
    String contentType,
    long size,
    String md5
) {}
