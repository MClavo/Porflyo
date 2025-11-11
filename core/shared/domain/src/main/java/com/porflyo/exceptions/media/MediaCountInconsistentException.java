package com.porflyo.exceptions.media;

public final class MediaCountInconsistentException extends MediaCountException {
    private final String reason;
    public MediaCountInconsistentException(String reason) {
        super(409, "media_count_inconsistent", "Inconsistent media count state: " + reason);
        this.reason = reason;
    }
    public String reason() { return reason; }
}
