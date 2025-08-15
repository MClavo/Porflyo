package com.porflyo.application.ports.input;

import java.util.Optional;

import com.porflyo.application.dto.PublicPortfolioView;
import com.porflyo.domain.model.portfolio.Slug;

public interface PublicPortfolioQueryUseCase {
    Optional<PublicPortfolioView> getPublishedByUrl(Slug slugUrl);
}
