package com.porflyo.Item;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Represents the media items in the DynamoDB database. 
 * This class is used to control when to delete media items based on their usage.
 * <p>
 * @implNote {@link #mediaCount} is a compressed representation of {@code Map<String, Integer>}.
 * All the media items are stored in a compressed format to optimize storage and retrieval costs.
 * 
 */
@Serdeable
@Introspected
public class DdbMediaCountItem {
    
    // ────────────────────────── Key & Index ──────────────────────────

    private String PK;  // e.g., USER#123
    private String SK;  // "MEDIA"


    // ────────────────────────── Attributes ──────────────────────────

    private byte[] mediaCount;      // Map<String, Integer>

    public DdbMediaCountItem() {}


    // ────────────────────────── getters & setters ──────────────────────────

    public String getPK() { return PK; }

    public void setPK(String pK) { PK = pK; }

    public String getSK() { return SK; }

    public void setSK(String sK) { SK = sK; }

    public byte[] getMediaCount() { return mediaCount; }

    public void setMediaCount(byte[] mediaCountList) { this.mediaCount = mediaCountList; }
}
