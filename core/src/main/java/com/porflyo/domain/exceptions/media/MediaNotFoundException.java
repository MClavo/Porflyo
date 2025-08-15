package com.porflyo.domain.exceptions.media;

public final class MediaNotFoundException extends MediaException {
    private final String key;
    public MediaNotFoundException(String key) {
        super(404, "media_not_found", "Media not found: " + key);
        this.key = key;
    }
    public String key() { return key; }
}
