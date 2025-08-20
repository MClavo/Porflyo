package com.porflyo.exceptions.media;

public final class MediaChecksumMismatchException extends MediaException {
    private final String expectedMd5;
    private final String providedMd5;

    public MediaChecksumMismatchException(String expectedMd5, String providedMd5) {
        super(422, "media_checksum_mismatch", "MD5 mismatch: expected " + expectedMd5 + " but got " + providedMd5);
        this.expectedMd5 = expectedMd5; this.providedMd5 = providedMd5;
    }
    public String expectedMd5() { return expectedMd5; }
    public String providedMd5() { return providedMd5; }
}
