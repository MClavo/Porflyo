package com.porflyo.application.ports.output;

import java.util.Optional;

import com.porflyo.domain.model.ids.PortfolioId;
import com.porflyo.domain.model.ids.UserId;
import com.porflyo.domain.model.portfolio.PortfolioUrl;
import com.porflyo.domain.model.portfolio.Slug;

public interface PortfolioUrlRepository {
    
    // Slug → { userId, portfolioId, isPublic }
    Optional<PortfolioUrl> findBySlug(Slug slug);

    // Only creates one with that slug
    boolean reserve(Slug slug, UserId userId, PortfolioId portfolioId, boolean isPublic);

    // Deletes the mapping (frees the slug)
    void release(Slug slug);

    void changeSlugAtomic(Slug oldSlug, Slug newSlug,
                          UserId userId, PortfolioId portfolioId, boolean isPublic);


    void updateVisibility(Slug slug, boolean isPublic);
}