package com.porflyo.testing.data;

import java.util.List;

import com.porflyo.domain.model.ids.SectionId;
import com.porflyo.domain.model.portfolio.PortfolioSection;
import com.porflyo.domain.model.portfolio.SavedSection;

public final class SectionTestData {

    // ────────────────────────── PortfolioSection ──────────────────────────
    public static final String SECTION_TYPE = "text";
    public static final String SECTION_TITLE = "Test Section";
    public static final Object SECTION_CONTENT = "This is a test section content.";
    public static final String SECTION_MEDIA = "media.png";

    public static final PortfolioSection DEFAULT_PORTFOLIO_SECTION = new PortfolioSection(
        SECTION_TYPE,
        SECTION_TITLE,
        SECTION_CONTENT,
        List.of(SECTION_MEDIA)
    );


    // ────────────────────────── SavedSection ──────────────────────────
    public static final SectionId DEFAULT_SECTION_ID = new SectionId("section-123");
    public static final String DEFAULT_SAVED_SECTION_NAME = "My Saved Section";
    public static final Integer DEFAULT_SAVED_SECTION_VERSION = 1;

    public static final SavedSection DEFAULT_SAVED_SECTION = new SavedSection(
        DEFAULT_SECTION_ID,
        TestData.DEFAULT_USER_ID,
        DEFAULT_SAVED_SECTION_NAME,
        DEFAULT_PORTFOLIO_SECTION,
        DEFAULT_SAVED_SECTION_VERSION
    );
}
