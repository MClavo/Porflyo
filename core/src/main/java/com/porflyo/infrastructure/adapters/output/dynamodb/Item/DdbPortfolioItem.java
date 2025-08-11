package com.porflyo.infrastructure.adapters.output.dynamodb.Item;

import java.util.List;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public class DdbPortfolioItem {

    // ────────────────────────── Key & Index ──────────────────────────
    
    private String PK; // e.g., USER#123
    private String SK; // "PORTFOLIO#456"
    

    // ────────────────────────── Attributes ──────────────────────────

    private String portfolioId; 
    private String userId; 
    private String template;
    private String title;
    private String description;
    private List<Object> sections; 
    private List<String> media;

    private Integer modelVersion;
    private String desiredSlug; // Slug proposed by the user for their public URL
    private Boolean isPublished;

    private String createdAt; // ISO 8601 string
    private String updatedAt; // ISO 8601 string

    public DdbPortfolioItem() {}


    // ────────────────────────── getters & setters ──────────────────────────
    
    public String getPK() { return PK; }

    public void setPK(String pK) { PK = pK; }

    public String getSK() { return SK; }

    public void setSK(String sK) { SK = sK; }

    public String getPortfolioId() { return portfolioId; }

    public void setPortfolioId(String portfolioId) { this.portfolioId = portfolioId; }

    public String getUserId() { return userId; }

    public void setUserId(String userId) { this.userId = userId; }

    public String getTemplate() { return template; }

    public void setTemplate(String template) { this.template = template; }

    public String getTitle() { return title; }

    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }

    public void setDescription(String description) { this.description = description; }

    public List<Object> getSections() { return sections; }

    public void setSections(List<Object> sections) { this.sections = sections; }

    public List<String> getMedia() { return media; }

    public void setMedia(List<String> media) { this.media = media; }

    public Integer getModelVersion() { return modelVersion; }

    public void setModelVersion(Integer modelVersion) { this.modelVersion = modelVersion; }

    public String getDesiredSlug() { return desiredSlug; }

    public void setDesiredSlug(String desiredSlug) { this.desiredSlug = desiredSlug; }

    public Boolean getIsPublished() { return isPublished; }

    public void setIsPublished(Boolean isPublished) { this.isPublished = isPublished; }

    public String getCreatedAt() { return createdAt; }

    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }

    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
