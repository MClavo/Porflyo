package com.porflyo.exceptions.media;

public final class MediaCountUnderflowException extends MediaCountException {
    private final String key;
    public MediaCountUnderflowException(String key) {
        super(409, "media_count_underflow", "Usage count would go below zero for: " + key);
        this.key = key;
    }
    public String key() { return key; }
}