package com.porflyo.Item;

import java.util.List;

public class DdbSlotMetricsItem {
    
    // ────────────────────────── Key & Index ──────────────────────────

    private String pk; // "P#{portfolioId}"
    private String sk; // "S#{slotId}"

    
    private String date; // "yyyy-MM-dd"


    // ────────────────────────── Projects ──────────────────────────

    private List<Integer> projectId;
    private List<Integer> viewTime;
    private List<Integer> TTFI;           // Time To First Interaction
    private List<Integer> codeViews;
    private List<Integer> liveViews;


    // ────────────────────────── HeatMap ──────────────────────────

    private String version;
    private Integer columns;
    private byte[] heatmap;         // Compressed heatmap data (Indexes, Values, Counts)
 

    public DdbSlotMetricsItem() {}


    // ────────────────────────── getters & setters ──────────────────────────

    public String getPk() {
        return pk;
    }

    public void setPk(String pk) {
        this.pk = pk;
    }

    public String getSk() {
        return sk;
    }

    public void setSk(String sk) {
        this.sk = sk;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public List<Integer> getProjectId() {
        return projectId;
    }

    public void setProjectId(List<Integer> projectId) {
        this.projectId = projectId;
    }

    public List<Integer> getViewTime() {
        return viewTime;
    }

    public void setViewTime(List<Integer> viewTime) {
        this.viewTime = viewTime;
    }

    public List<Integer> getTTFI() {
        return TTFI;
    }

    public void setTTFI(List<Integer> tTFI) {
        TTFI = tTFI;
    }

    public List<Integer> getCodeViews() {
        return codeViews;
    }

    public void setCodeViews(List<Integer> codeViews) {
        this.codeViews = codeViews;
    }

    public List<Integer> getLiveViews() {
        return liveViews;
    }

    public void setLiveViews(List<Integer> liveViews) {
        this.liveViews = liveViews;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public Integer getColumns() {
        return columns;
    }

    public void setColumns(Integer columns) {
        this.columns = columns;
    }

    public byte[] getHeatmap() {
        return heatmap;
    }

    public void setHeatmap(byte[] heatmap) {
        this.heatmap = heatmap;
    }

    

}
