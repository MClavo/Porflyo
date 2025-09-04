package com.porflyo.ports.output;

import java.util.Optional;

import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.portfolio.PortfolioUrl;
import com.porflyo.model.portfolio.Slug;

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