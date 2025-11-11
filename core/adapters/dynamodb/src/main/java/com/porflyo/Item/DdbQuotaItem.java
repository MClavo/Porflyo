package com.porflyo.Item;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;



/**
 * Represents the DynamoDB item for user quotas.
 * This class is used to save and verify user quotas instead of 
 * querying all the items in the database directly.
 */
@Serdeable
@Introspected
public class DdbQuotaItem {
    // ────────────────────────── Key & Index ──────────────────────────

    private String PK; // e.g., USER#123
    private String SK; // "QUOTA"


    // ────────────────────────── Attributes ──────────────────────────
    private Integer savedSectionCount;
    private Integer portfolioCount;

    public DdbQuotaItem() {}

    // ────────────────────────── getters & setters ──────────────────────────

    public String getPK() {
        return PK;
    }
    public void setPK(String pK) {
        PK = pK;
    }
    public String getSK() {
        return SK;
    }
    public void setSK(String sK) {
        SK = sK;
    }
    public Integer getSavedSectionCount() {
        return savedSectionCount;
    }
    public void setSavedSectionCount(Integer savedSectionCount) {
        this.savedSectionCount = savedSectionCount;
    }
    public Integer getPortfolioCount() {
        return portfolioCount;
    }
    public void setPortfolioCount(Integer portfolioCount) {
        this.portfolioCount = portfolioCount;
    }
    

    

}
