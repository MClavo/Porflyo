package com.porflyo.Item;

import java.util.List;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public class DdbPortfolioMetricsItem {
    
    // ────────────────────────── Key & Index ──────────────────────────

    private String Pk; // "P#{portfolioId}"
    private String Sk; // "M#{yyyy-MM}#{shard}" 


    // ────────────────────────── Attributes ──────────────────────────
    private String version;
    private List<Integer> dayIntegers;

    // Engagement
    private List<Integer> activeTime;
    private List<Integer> views;
    private List<Integer> qualityVisits;
    private List<Integer> emailCopies;
    private List<Integer> socialClicks;
    private List<Integer> deviceViews; 

    // Interaction
    private List<Integer> totalScrollScore;
    private List<Integer> totalScrollTime;
    private List<Integer> ttfiSumMs;
    private List<Integer> ttfiCount;

    // Projects
    private List<Integer> viewTime;
    private List<Integer> exposures;
    private List<Integer> codeViews;
    private List<Integer> liveViews;

    public DdbPortfolioMetricsItem() {}


    // ────────────────────────── getters & setters ──────────────────────────

    public String getPK() {
        return Pk;
    }

    public void setPK(String pk) {
        Pk = pk;
    }

    public String getSK() {
        return Sk;
    }

    public void setSK(String sk) {
        Sk = sk;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
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

    public List<Integer> getQualityVisits() {
        return qualityVisits;
    }

    public void setQualityVisits(List<Integer> qualityVisits) {
        this.qualityVisits = qualityVisits;
    }

    public List<Integer> getEmailCopies() {
        return emailCopies;
    }

    public void setEmailCopies(List<Integer> emailCopies) {
        this.emailCopies = emailCopies;
    }

    public List<Integer> getSocialClicks() {
        return socialClicks;
    }

    public void setSocialClicks(List<Integer> socialClicks) {
        this.socialClicks = socialClicks;
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

    public List<Integer> getTotalScrollTime() {
        return totalScrollTime;
    }

    public void setTotalScrollTime(List<Integer> totalScrollTime) {
        this.totalScrollTime = totalScrollTime;
    }

    public List<Integer> getTtfiSumMs() {
        return ttfiSumMs;
    }

    public void setTtfiSumMs(List<Integer> ttfiSumMs) {
        this.ttfiSumMs = ttfiSumMs;
    }

    public List<Integer> getTtfiCount() {
        return ttfiCount;
    }

    public void setTtfiCount(List<Integer> ttfiCount) {
        this.ttfiCount = ttfiCount;
    }

    public List<Integer> getViewTime() {
        return viewTime;
    }

    public void setViewTime(List<Integer> viewTime) {
        this.viewTime = viewTime;
    }

    public List<Integer> getExposures() {
        return exposures;
    }

    public void setExposures(List<Integer> exposures) {
        this.exposures = exposures;
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
