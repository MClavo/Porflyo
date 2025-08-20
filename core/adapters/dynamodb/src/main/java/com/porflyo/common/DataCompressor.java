package com.porflyo.common;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

import com.github.javaparser.quality.NotNull;

import io.micronaut.core.type.Argument;
import io.micronaut.serde.ObjectMapper;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
public final class DataCompressor {

    private final ObjectMapper objectMapper;

    @Inject
    public DataCompressor(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    // ────────────────────────── Compress ──────────────────────────
    public byte[] compress(@NotNull Object item) throws IOException {
        if (item == null) {
            throw new IllegalArgumentException("Object to compress cannot be null");
        }

        String data = objectMapper.writeValueAsString(item);

        // Compress with GZIP
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (GZIPOutputStream gos = new GZIPOutputStream(baos)) {
            gos.write(data.getBytes(StandardCharsets.UTF_8));
        }
        return baos.toByteArray();
    }


    // ────────────────────────── Decompress ──────────────────────────
    public <T> T decompress(@NotNull byte[] compressedData, @NotNull Class<T> clazz) throws IOException {
        return decompressDataStream(compressedData, Argument.of(clazz));
    }

    public <T> List<T> decompressList(byte[] compressedData, Class<T> clazz) throws IOException {
        return decompressDataStream(compressedData, Argument.listOf(clazz));
    }


    public <K, V> Map<K, V> decompressMap(byte[] compressedData, Class<K> keyClass, Class<V> valueClass) throws IOException {
        return decompressDataStream(compressedData, Argument.mapOf(keyClass, valueClass));
    }

    private <T> T decompressDataStream(byte[] compressedData, Argument<T> type) throws IOException {
        // Decompress with GZIP
        ByteArrayInputStream bais = new ByteArrayInputStream(compressedData);
        try (GZIPInputStream gis = new GZIPInputStream(bais)) {
            String json = new String(gis.readAllBytes(), StandardCharsets.UTF_8);
            return objectMapper.readValue(json, type);
        }
    }

}
