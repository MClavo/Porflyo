package com.porflyo.exceptions.publicUrl;

public class UrlInvalidFormatException extends PublicUrlException {
    private final String provided;
    public UrlInvalidFormatException(String provided) {
        super(400, "url_invalid_format", "URL format is invalid: " + provided);
        this.provided = provided;
    }
    public String provided() { return provided; }
}
