package com.porflyo.exceptions.publicUrl;

public final class UrlNotFoundException extends PublicUrlException {
    private final String url;
    public UrlNotFoundException(String url) {
        super(404, "url_not_found", "URL not found: " + url);
        this.url = url;
    }
    public String url() { return url; }
}
