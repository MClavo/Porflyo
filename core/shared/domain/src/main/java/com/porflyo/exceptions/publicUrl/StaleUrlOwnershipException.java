package com.porflyo.exceptions.publicUrl;

public final class StaleUrlOwnershipException extends PublicUrlException {
    private final String url;
    public StaleUrlOwnershipException(String url) {
        super(409, "url_stale", "URL is no longer owned: " + url);
        this.url = url;
    }
    public String url() { return url; }
}