package com.porflyo.domain.exceptions.media;

public final class MediaInUseException extends MediaException {
    private final String key;
    public MediaInUseException(String key) {
        super(409, "media_in_use", "Media is still referenced: " + key);
        this.key = key;
    }
    public String key() { return key; }
}