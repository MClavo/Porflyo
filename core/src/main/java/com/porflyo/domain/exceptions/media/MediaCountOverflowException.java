package com.porflyo.domain.exceptions.media;

public final class MediaCountOverflowException extends MediaCountException {
    private final String key;
    private final int attempted;
    public MediaCountOverflowException(String key, int attempted) {
        super(409, "media_count_overflow", "Usage count overflow for: " + key + " (attempted=" + attempted + ")");
        this.key = key; this.attempted = attempted;
    }
    public String key() { return key; }
    public int attempted() { return attempted; }
}
