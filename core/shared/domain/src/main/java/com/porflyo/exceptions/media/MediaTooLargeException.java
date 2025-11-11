package com.porflyo.exceptions.media;

public final class MediaTooLargeException extends MediaException {
    private final long size;
    private final long maxAllowed;

    public MediaTooLargeException(long size, long maxAllowed) {
        super(413, "media_too_large", "Media too large: " + size + " bytes (max " + maxAllowed + ")");
        this.size = size; this.maxAllowed = maxAllowed;
    }
    public long size() { return size; }
    public long maxAllowed() { return maxAllowed; }
}
