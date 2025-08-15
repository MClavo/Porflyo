package com.porflyo.testing.data;

import java.util.List;

import com.porflyo.domain.model.ids.PortfolioId;
import com.porflyo.domain.model.ids.SectionId;
import com.porflyo.domain.model.portfolio.Portfolio;
import com.porflyo.domain.model.portfolio.PortfolioSection;
import com.porflyo.domain.model.portfolio.PortfolioUrl;
import com.porflyo.domain.model.portfolio.SavedSection;
import com.porflyo.domain.model.portfolio.Slug;

public final class PortfolioTestData {

    // ────────────────────────── PortfolioSection ──────────────────────────
    public static final String SECTION_TYPE = "text";
    public static final String SECTION_TITLE = "Test Section";
    public static final String SECTION_CONTENT = "This is a test section content.";
    public static final List<String> SECTION_MEDIA = List.of("media.png", "media2.png");

    public static final PortfolioSection DEFAULT_PORTFOLIO_SECTION = new PortfolioSection(
        SECTION_TYPE,
        SECTION_TITLE,
        SECTION_CONTENT,
        SECTION_MEDIA
    );

    public static final List<String> SECTION_MEDIA_2 = List.of("media4.png", "media5.png", "media6.png");

    public static final PortfolioSection DEFAULT_PORTFOLIO_SECTION2 = new PortfolioSection(
        "test",
        "Test Section 2",
        "This is a test section content.",
        SECTION_MEDIA_2
    );


    // ────────────────────────── SavedSection ──────────────────────────
    public static final SectionId DEFAULT_SECTION_ID = new SectionId("section-123");
    public static final String DEFAULT_SAVED_SECTION_NAME = "My Saved Section";
    public static final int DEFAULT_SAVED_SECTION_VERSION = 1;

    public static final SavedSection DEFAULT_SAVED_SECTION = new SavedSection(
        DEFAULT_SECTION_ID,
        TestData.DEFAULT_USER_ID,
        DEFAULT_SAVED_SECTION_NAME,
        DEFAULT_PORTFOLIO_SECTION,
        DEFAULT_SAVED_SECTION_VERSION
    );


    // ────────────────────────── Portfolio ──────────────────────────
    public static final PortfolioId DEFAULT_PORTFOLIO_ID = new PortfolioId("portfolio-123");
    public static final String DEFAULT_PORTFOLIO_TEMPLATE = "Default Template";
    public static final String DEFAULT_PORTFOLIO_TITLE = "Test Portfolio";
    public static final String DEFAULT_PORTFOLIO_DESCRIPTION = "This is a test portfolio description.";
    public static final List<PortfolioSection> DEFAULT_PORTFOLIO_SECTIONS = List.of(
        DEFAULT_PORTFOLIO_SECTION,
        DEFAULT_PORTFOLIO_SECTION2
    );

    public static final List<String> DEFAULT_PORTFOLIO_MEDIA = List.copyOf(
        new java.util.ArrayList<>() {{
            addAll(SECTION_MEDIA);
            addAll(SECTION_MEDIA_2);
        }}
    );

    public static final int DEFAULT_PORTFOLIO_MODEL_VERSION = 1;
    public static final Slug DEFAULT_PORTFOLIO_DESIRED_SLUG = new Slug("test-portfolio");
    public static final Boolean DEFAULT_PORTFOLIO_IS_PUBLISHED = true;

    public static final Portfolio DEFAULT_PORTFOLIO = new Portfolio(
        DEFAULT_PORTFOLIO_ID,
        TestData.DEFAULT_USER_ID,
        DEFAULT_PORTFOLIO_TEMPLATE,
        DEFAULT_PORTFOLIO_TITLE,
        DEFAULT_PORTFOLIO_DESCRIPTION,
        DEFAULT_PORTFOLIO_SECTIONS,
        DEFAULT_PORTFOLIO_MEDIA,
        DEFAULT_PORTFOLIO_MODEL_VERSION,
        DEFAULT_PORTFOLIO_DESIRED_SLUG,
        DEFAULT_PORTFOLIO_IS_PUBLISHED
    );

    // ────────────────────────── PortfolioURL ──────────────────────────
    public static final PortfolioUrl DEFAULT_PORTFOLIO_URL = new PortfolioUrl(
        TestData.DEFAULT_USER_ID,
        DEFAULT_PORTFOLIO_ID,
        DEFAULT_PORTFOLIO_DESIRED_SLUG,
        true
    );

}
