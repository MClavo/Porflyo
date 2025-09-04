package com.porflyo.services;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.porflyo.dto.PublicPortfolioView;
import com.porflyo.ports.input.PublicPortfolioQueryUseCase;
import com.porflyo.ports.output.PortfolioRepository;
import com.porflyo.ports.output.PortfolioUrlRepository;
import com.porflyo.model.portfolio.Portfolio;
import com.porflyo.model.portfolio.PortfolioUrl;
import com.porflyo.model.portfolio.Slug;

import jakarta.inject.Inject;

public class PublicPortfolioQueryService implements PublicPortfolioQueryUseCase {

    private static final Logger log = LoggerFactory.getLogger(PublicPortfolioQueryService.class);

    private final PortfolioUrlRepository urlRepository;
    private final PortfolioRepository portfolioRepository;

    @Inject
    public PublicPortfolioQueryService(PortfolioUrlRepository urlRepository, PortfolioRepository portfolioRepository) {
        this.urlRepository = urlRepository;
        this.portfolioRepository = portfolioRepository;
    }


    @Override
    public boolean isUrlAvailable(Slug slugUrl) {
        Optional<PortfolioUrl> fetchedUrl = urlRepository.findBySlug(slugUrl);
        return fetchedUrl.isEmpty();
    }

    @Override
    public Optional<PublicPortfolioView> getPublishedByUrl(Slug slugUrl) {
        Optional<PortfolioUrl> fetchedUrl = urlRepository.findBySlug(slugUrl);
        PortfolioUrl portfolioUrl = fetchedUrl.orElse(null);

        // The portfolio can be a draft, portfolio has to be public
        if(portfolioUrl == null || portfolioUrl.isPublic() == false) 
            return Optional.empty();

        Optional<Portfolio> portfolio = portfolioRepository.findById(
                portfolioUrl.userId(),
                portfolioUrl.portfolioId());

        Portfolio fetchedPortfolio = portfolio.orElse(null);

        // This should never happen. If it does fix ASAP.
        if(fetchedPortfolio == null || fetchedPortfolio.isPublished() == false) {
            if (fetchedPortfolio != null)
                log.warn("Portfolio: {}, is not consistent with slug: {}", fetchedPortfolio, slugUrl);
            else
                log.warn("No portfolio found for slug: {}", slugUrl);

            return Optional.empty();
        }

        return Optional.of(toPublicPortfolioView(fetchedPortfolio));

    }

    private PublicPortfolioView toPublicPortfolioView(Portfolio portfolio) {
        return new PublicPortfolioView(
                portfolio.id().value(),
                portfolio.template(),
                portfolio.title(),
                portfolio.description(),
                portfolio.sections()
        );
    }
}

