package com.porflyo.infrastructure.adapters.output.dynamodb.Item;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public class DdbSavedSectionItem {

    // ────────────────────────── Key & Index ──────────────────────────
   
    private String PK; // USER#123
    private String SK; // SSECTION#456


    // ────────────────────────── Attributes ──────────────────────────
    private String name;

    private byte[] section; // Compressed Section for WCU optimization

    private Integer version;

    public DdbSavedSectionItem() {}

    // ────────────────────────── getters & setters ──────────────────────────

    public String getPK() { return PK; }

    public void setPK(String pK) { PK = pK; }

    public String getSK() { return SK; }

    public void setSK(String sK) { SK = sK; }

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    public byte[] getSection() { return section; }

    public void setSection(byte[] section) { this.section = section; }

    public Integer getVersion() { return version; }

    public void setVersion(Integer version) { this.version = version; }
}
