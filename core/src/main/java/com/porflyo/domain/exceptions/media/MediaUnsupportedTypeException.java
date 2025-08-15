package com.porflyo.domain.exceptions.media;

public final class MediaUnsupportedTypeException extends MediaException {
    private final String contentType;
    public MediaUnsupportedTypeException(String contentType) {
        super(415, "media_unsupported_type", "Unsupported media type: " + contentType);
        this.contentType = contentType;
    }
    public String contentType() { return contentType; }
}
