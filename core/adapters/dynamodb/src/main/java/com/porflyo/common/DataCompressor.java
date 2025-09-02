package com.porflyo.common;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;


import io.micronaut.core.type.Argument;
import io.micronaut.json.JsonMapper;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
public final class DataCompressor {

    private final JsonMapper jsonMapper;

    @Inject
    public DataCompressor(JsonMapper jsonMapper) {
        this.jsonMapper = jsonMapper;
    }

    // ────────────────────────── Compress ──────────────────────────
    public byte[] compress(Object item) throws IOException {
        if (item == null) {
            throw new IllegalArgumentException("Object to compress cannot be null");
        }

        String data = jsonMapper.writeValueAsString(item);

        // Compress with GZIP
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (GZIPOutputStream gos = new GZIPOutputStream(baos)) {
            gos.write(data.getBytes(StandardCharsets.UTF_8));
        }
        return baos.toByteArray();
    }


    // ────────────────────────── Decompress ──────────────────────────
    public <T> T decompress(byte[] compressedData, Class<T> clazz) throws IOException {
        if (compressedData == null) {
            return null;
        }

        return decompressDataStream(compressedData, Argument.of(clazz));
    }

    public <T> List<T> decompressList(byte[] compressedData, Class<T> clazz) throws IOException {
        if (compressedData == null) {
            return List.of();
        }

        try {
            return decompressDataStream(compressedData, Argument.listOf(clazz));
        } catch (RuntimeException | IOException e) {
            // Fallback: sometimes the stored JSON is a single object instead of an array.
            // Try to decode a single object and wrap it into a list.
            try {
                T single = decompressDataStream(compressedData, Argument.of(clazz));
                return List.of(single);
            } catch (Exception ex) {
                // If fallback fails, rethrow the original exception as IOException to keep signature
                if (e instanceof IOException) throw (IOException) e;
                throw new IOException("Failed to decompress list and single-object fallback failed", e);
            }
        }
    }


    public <K, V> Map<K, V> decompressMap(byte[] compressedData, Class<K> keyClass, Class<V> valueClass) throws IOException {
        if (compressedData == null) {
            return Map.of();
        }

        return decompressDataStream(compressedData, Argument.mapOf(keyClass, valueClass));
    }

    private <T> T decompressDataStream(byte[] compressedData, Argument<T> type) throws IOException {
        // Decompress with GZIP
        ByteArrayInputStream bais = new ByteArrayInputStream(compressedData);
        try (GZIPInputStream gis = new GZIPInputStream(bais)) {
            String json = new String(gis.readAllBytes(), StandardCharsets.UTF_8);
            return jsonMapper.readValue(json, type);
        }
    }

}
