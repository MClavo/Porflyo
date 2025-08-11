package com.porflyo.infrastructure.adapters.output.dynamodb.Item;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Represents a media item in the DynamoDB database. 
 * This class is used to control when to delete media items based on their usage.
 */
@Serdeable
@Introspected
public class DdbMediaItem {
    
    // ────────────────────────── Key & Index ──────────────────────────

    private String PK;  // e.g., USER#123
    private String SK;  // "MEDIA#456"


    // ────────────────────────── Attributes ──────────────────────────

    private String mediaId;
    private Integer useCount;
    private Integer size;
    private String type;

    private String createdAt; // ISO 8601 string

    public DdbMediaItem() {}


    // ────────────────────────── getters & setters ──────────────────────────

    public String getPK() { return PK; }

    public void setPK(String pK) { PK = pK; }

    public String getSK() { return SK; }

    public void setSK(String sK) { SK = sK; }

    public String getMediaId() { return mediaId; }

    public void setMediaId(String mediaId) { this.mediaId = mediaId; }

    public Integer getUseCount() { return useCount; }

    public void setUseCount(Integer useCount) { this.useCount = useCount; }

    public Integer getSize() { return size; }

    public void setSize(Integer size) { this.size = size; }

    public String getType() { return type; }

    public void setType(String type) { this.type = type; }

    public String getCreatedAt() { return createdAt; }

    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
