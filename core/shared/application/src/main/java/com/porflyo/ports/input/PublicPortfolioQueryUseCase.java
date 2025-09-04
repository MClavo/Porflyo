package com.porflyo.ports.input;

import java.util.Optional;

import com.porflyo.dto.PublicPortfolioView;
import com.porflyo.model.portfolio.Slug;

public interface PublicPortfolioQueryUseCase {
    boolean isUrlAvailable(Slug slugUrl);
    
    Optional<PublicPortfolioView> getPublishedByUrl(Slug slugUrl);
}
