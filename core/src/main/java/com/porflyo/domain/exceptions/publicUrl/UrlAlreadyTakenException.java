package com.porflyo.domain.exceptions.publicUrl;

public final class UrlAlreadyTakenException extends PublicUrlException {
    private final String url;
    public UrlAlreadyTakenException(String url) {
        super(409, "url_taken", "URL already taken: " + url);
        this.url = url;
    }
    public String url() { return url; }
}