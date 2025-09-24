package com.porflyo.Item;

import java.util.List;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public class DdbPortfolioMetricsItem {
    
    // ────────────────────────── Key & Index ──────────────────────────

    private String pk; // "P#{portfolioId}"
    private String sk; // "M#{yyyy-MM}#{segment}" 


    // ────────────────────────── Attributes ──────────────────────────
    
    private List<Integer> dayIntegers;

    // Engagement
    private List<Integer> activeTime;
    private List<Integer> views;
    private List<Integer> emailCopies;
    private List<Integer> deviceViews; 

    // Scroll
    private List<Integer> totalScrollScore;
    private List<Integer> maxScrollScore;
    private List<Integer> totalScrollTime;
    private List<Integer> maxScrollTime;

    // Projects
    private List<Integer> viewTime;
    private List<Integer> TTFI;
    private List<Integer> codeViews;
    private List<Integer> liveViews;

    public DdbPortfolioMetricsItem() {}


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

    public List<Integer> getDayIntegers() {
        return dayIntegers;
    }

    public void setDayIntegers(List<Integer> dayIntegers) {
        this.dayIntegers = dayIntegers;
    }

    public List<Integer> getActiveTime() {
        return activeTime;
    }

    public void setActiveTime(List<Integer> activeTime) {
        this.activeTime = activeTime;
    }

    public List<Integer> getViews() {
        return views;
    }

    public void setViews(List<Integer> views) {
        this.views = views;
    }

    public List<Integer> getEmailCopies() {
        return emailCopies;
    }

    public void setEmailCopies(List<Integer> emailCopies) {
        this.emailCopies = emailCopies;
    }

    public List<Integer> getDeviceViews() {
        return deviceViews;
    }

    public void setDeviceViews(List<Integer> deviceViews) {
        this.deviceViews = deviceViews;
    }

    public List<Integer> getTotalScrollScore() {
        return totalScrollScore;
    }

    public void setTotalScrollScore(List<Integer> totalScrollScore) {
        this.totalScrollScore = totalScrollScore;
    }

    public List<Integer> getMaxScrollScore() {
        return maxScrollScore;
    }

    public void setMaxScrollScore(List<Integer> maxScrollScore) {
        this.maxScrollScore = maxScrollScore;
    }

    public List<Integer> getTotalScrollTime() {
        return totalScrollTime;
    }

    public void setTotalScrollTime(List<Integer> totalScrollTime) {
        this.totalScrollTime = totalScrollTime;
    }

    public List<Integer> getMaxScrollTime() {
        return maxScrollTime;
    }

    public void setMaxScrollTime(List<Integer> maxScrollTime) {
        this.maxScrollTime = maxScrollTime;
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
}
