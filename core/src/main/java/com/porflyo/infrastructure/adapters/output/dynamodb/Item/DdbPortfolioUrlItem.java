package com.porflyo.infrastructure.adapters.output.dynamodb.Item;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public final class DdbPortfolioUrlItem {
    
    // ────────────────────────── Key & Index ──────────────────────────

    private String PK; // e.g., URL#<slug>
    private String SK; // e.g., SLUG

    
    // ────────────────────────── Attributes ──────────────────────────
    private String portfolioId; // e.g. PORTFOLIO#<portfolioId>
    private String userId;  // e.g. USER#<userId>
    private boolean isPublic;

    public DdbPortfolioUrlItem() {}


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

    public String getPortfolioId() {
        return portfolioId;
    }

    public void setPortfolioId(String portfolioId) {
        this.portfolioId = portfolioId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public boolean isPublic() {
        return isPublic;
    }

    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }
}
