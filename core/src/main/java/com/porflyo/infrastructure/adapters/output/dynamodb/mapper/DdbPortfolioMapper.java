package com.porflyo.infrastructure.adapters.output.dynamodb.mapper;

import static com.porflyo.infrastructure.adapters.output.dynamodb.common.DdbKeys.USER_PK_PREFIX;
import static com.porflyo.infrastructure.adapters.output.dynamodb.common.DdbKeys.USER_PORTFOLIO_SK_PREFIX;
import static com.porflyo.infrastructure.adapters.output.dynamodb.common.DdbKeys.idFrom;
import static com.porflyo.infrastructure.adapters.output.dynamodb.common.DdbKeys.pk;
import static com.porflyo.infrastructure.adapters.output.dynamodb.common.DdbKeys.sk;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import com.porflyo.application.dto.PortfolioPatchDto;
import com.porflyo.domain.model.ids.PortfolioId;
import com.porflyo.domain.model.ids.UserId;
import com.porflyo.domain.model.portfolio.Portfolio;
import com.porflyo.domain.model.portfolio.PortfolioSection;
import com.porflyo.domain.model.portfolio.Slug;
import com.porflyo.infrastructure.adapters.output.dynamodb.Item.DdbPortfolioItem;
import com.porflyo.infrastructure.adapters.output.dynamodb.common.DataCompressor;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
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

        item.setTemplate(portfolio.template());
        item.setTitle(portfolio.title());
        item.setDescription(description);

        item.setSections(sections);

        item.setModelVersion(portfolio.modelVersion());
        item.setDesiredSlug(portfolio.reservedSlug().value());
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

        List<String> media = new ArrayList<>();

        for(var s : sections)
            media.addAll(s.media());

        return new Portfolio(
            new PortfolioId(portfolioId),
            new UserId(userId),
            item.getTemplate(),
            item.getTitle(),
            description,
            sections,
            media,
            item.getModelVersion(),
            new Slug(item.getDesiredSlug()),
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
