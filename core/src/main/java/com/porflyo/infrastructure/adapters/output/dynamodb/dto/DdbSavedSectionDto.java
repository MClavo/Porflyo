package com.porflyo.infrastructure.adapters.output.dynamodb.dto;

import java.util.List;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public class DdbSavedSectionDto {

    // ────────────────────────── Key & Index ──────────────────────────
   
    private String PK; // USER#123
    private String SK; // SSECTION#456


    // ────────────────────────── Attributes ──────────────────────────

    private String sectionId;
    private String userId;
    private String name;

    private String sectionType;
    private String title;
    private Object content;
    private List<String> media;

    private Integer version;

    public DdbSavedSectionDto() {}


    // ────────────────────────── getters & setters ──────────────────────────

    public String getPK() { return PK; }

    public void setPK(String pK) { PK = pK; }

    public String getSK() { return SK; }

    public void setSK(String sK) { SK = sK; }

    public String getSectionId() { return sectionId; }

    public void setSectionId(String sectionId) { this.sectionId = sectionId; }

    public String getUserId() { return userId; }

    public void setUserId(String userId) { this.userId = userId; }

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    public String getSectionType() { return sectionType; }

    public void setSectionType(String sectionType) { this.sectionType = sectionType; }

    public String getTitle() { return title; }

    public void setTitle(String title) { this.title = title; }

    public Object getContent() { return content; }

    public void setContent(Object content) { this.content = content; }

    public List<String> getMedia() { return media; }

    public void setMedia(List<String> media) { this.media = media; }

    public Integer getVersion() { return version; }

    public void setVersion(Integer version) { this.version = version; }
}
