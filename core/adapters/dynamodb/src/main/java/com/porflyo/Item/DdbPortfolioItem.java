package com.porflyo.Item;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public class DdbPortfolioItem {

    // ────────────────────────── Key & Index ──────────────────────────
    
    private String PK; // e.g., USER#123
    private String SK; // "PORTFOLIO#456"
    

    // ────────────────────────── Attributes ──────────────────────────

    private String template;
    private String title;
    private byte[] description;     // Compressed description for WCU optimization
    private byte[] sections;    // Compressed sections JSON for WCU optimization

    private Integer modelVersion;
    private String desiredSlug; // Slug proposed by the user for their public URL
    private Boolean isPublished;

    public DdbPortfolioItem() {}

    // ────────────────────────── getters & setters ──────────────────────────
    
    public String getPK() { return PK; }

    public void setPK(String pK) { PK = pK; }

    public String getSK() { return SK; }

    public void setSK(String sK) { SK = sK; }

    public String getTemplate() { return template; }

    public void setTemplate(String template) { this.template = template; }

    public String getTitle() { return title; }

    public void setTitle(String title) { this.title = title; }

    public byte[] getDescription() { return description; }

    public void setDescription(byte[] description) { this.description = description; }

    public byte[] getSections() { return sections; }

    public void setSections(byte[] sections) { this.sections = sections; }

    public Integer getModelVersion() { return modelVersion; }

    public void setModelVersion(Integer modelVersion) { this.modelVersion = modelVersion; }

    public String getDesiredSlug() { return desiredSlug; }

    public void setDesiredSlug(String desiredSlug) { this.desiredSlug = desiredSlug; }

    public Boolean getIsPublished() { return isPublished; }

    public void setIsPublished(Boolean isPublished) { this.isPublished = isPublished; }
}
