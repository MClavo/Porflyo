package com.porflyo.mapper;

import static com.porflyo.common.DdbKeys.USER_PK_PREFIX;
import static com.porflyo.common.DdbKeys.USER_PORTFOLIO_SK_PREFIX;
import static com.porflyo.common.DdbKeys.idFrom;
import static com.porflyo.common.DdbKeys.pk;
import static com.porflyo.common.DdbKeys.sk;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import com.porflyo.Item.DdbPortfolioItem;
import com.porflyo.common.DataCompressor;
import com.porflyo.dto.PortfolioPatchDto;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.portfolio.Portfolio;
import com.porflyo.model.portfolio.PortfolioSection;
import com.porflyo.model.portfolio.Slug;

import jakarta.inject.Inject;

public final class DdbPortfolioMapper {

    private final DataCompressor dataCompressor;

    @Inject
    public DdbPortfolioMapper(DataCompressor dataCompressor) {
        this.dataCompressor = dataCompressor;
    }

    // ────────────────────────── Domain -> ITEM ──────────────────────────
    public DdbPortfolioItem toItem(Portfolio portfolio) {

        // Compress description and sections to reduce WCU
        byte[] description = null;
        byte[] sections = null;

        try {
            if (portfolio.description() != null) {
                description = dataCompressor.compress(portfolio.description());
            }
            sections = dataCompressor.compress(portfolio.sections());
        } catch (Exception e) {
            throw new RuntimeException("Failed to compress portfolio data", e);
        }

        String PK = pk(USER_PK_PREFIX, portfolio.userId().value());
        String SK = sk(USER_PORTFOLIO_SK_PREFIX, portfolio.id().value());

        DdbPortfolioItem item = new DdbPortfolioItem();
        item.setPK(PK);
        item.setSK(SK);

        item.setCreatedAt(portfolio.createdAt().toString());
        item.setTemplate(portfolio.template());
        item.setTitle(portfolio.title());
        item.setDescription(description);

        item.setSections(sections);

        item.setModelVersion(portfolio.modelVersion());

        String slug = "";
        if (portfolio.reservedSlug() != null){
            slug = portfolio.reservedSlug().value();
        }

        item.setDesiredSlug(slug);
        item.setIsPublished(portfolio.isPublished());

        return item;
    }


    // ────────────────────────── ITEM -> Domain ──────────────────────────
    public Portfolio toDomain(DdbPortfolioItem item) {

        // Decompress sections and description
        String description = null;
        List<PortfolioSection> sections = null;

        try {
            description = dataCompressor.decompress(item.getDescription(), String.class);
            sections = dataCompressor.decompressList(item.getSections(), PortfolioSection.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to decompress portfolio data", e);
        }

        String portfolioId = idFrom(USER_PORTFOLIO_SK_PREFIX, item.getSK());
        String userId = idFrom(USER_PK_PREFIX, item.getPK());

        // Defensive: if sections is null or empty, use empty list and no media
        if (sections == null) {
            sections = List.of();
        }

        List<String> media = new ArrayList<>();
        for (var s : sections) {
            if (s != null && s.media() != null) {
                media.addAll(s.media());
            }
        }

        Slug slug = null;
        if (item.getDesiredSlug() != null && !item.getDesiredSlug().isBlank()) {
            slug = new Slug(item.getDesiredSlug());
        }

        return new Portfolio(
            new PortfolioId(portfolioId),
            new UserId(userId),
            LocalDate.parse(item.getCreatedAt()),
            item.getTemplate(),
            item.getTitle(),
            description,
            sections,
            media,
            item.getModelVersion(),
            slug,
            item.getIsPublished()
        );
    }


    // ────────────────────────── Patch -> Item ──────────────────────────
    public DdbPortfolioItem patchToItem(UserId userId, PortfolioId portfolioId, PortfolioPatchDto patch) {

        // Compress description and sections to reduce WCU
        byte[] description = null;
        byte[] sections = null;

        try {
            if (patch.description().isPresent()) 
                description = dataCompressor.compress(patch.description().get());

            if (patch.sections().isPresent()) 
                sections = dataCompressor.compress(patch.sections().get());
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to compress portfolio data", e);
        }

        String PK = pk(USER_PK_PREFIX, userId.value());
        String SK = sk(USER_PORTFOLIO_SK_PREFIX, portfolioId.value());

        DdbPortfolioItem item = new DdbPortfolioItem();
        item.setPK(PK);
        item.setSK(SK);

        item.setTemplate(getAttribute(patch.template()));
        item.setTitle(getAttribute(patch.title()));
        item.setDescription(description);
        item.setSections(sections);

        item.setModelVersion(getAttribute(patch.modelVersion()));

        item.setDesiredSlug(null);
        item.setIsPublished(null);

        return item;
    }

    // ────────────────────────── Private Methods ──────────────────────────
    private <T> T getAttribute(Optional<T> attribute) {
        return attribute.orElse(null);
    }

    public DdbPortfolioItem slugAndVisibilityToItem(UserId userId, PortfolioId id, Slug slug, boolean published) {

        String PK = pk(USER_PK_PREFIX, userId.value());
        String SK = sk(USER_PORTFOLIO_SK_PREFIX, id.value());

        DdbPortfolioItem item = new DdbPortfolioItem();
        item.setPK(PK);
        item.setSK(SK);

        item.setDesiredSlug(slug.value());
        item.setIsPublished(published);
        
        item.setTemplate(null);
        item.setTitle(null);
        item.setDescription(null);
        item.setSections(null);
        item.setModelVersion(null);

        return item;
    }

}
