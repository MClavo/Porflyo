package com.porflyo.domain.exceptions.quota;

public final class QuotaExceededException extends QuotaException {
    private final String resource;  // e.g., "portfolios", "saved_sections", "media"
    private final int attempted;

    public QuotaExceededException(String resource, int attempted) {
        super(429, "quota_exceeded", "Quota exceeded for " + resource + " (attempted=" + attempted + ")");
        this.resource = resource; this.attempted = attempted;
    }
    public String resource() { return resource; }
    public int attempted()   { return attempted; }
}