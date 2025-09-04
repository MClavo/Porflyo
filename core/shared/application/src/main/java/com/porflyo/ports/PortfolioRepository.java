package com.porflyo.ports;

import java.util.List;
import java.util.Optional;

import com.porflyo.dto.PortfolioPatchDto;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.portfolio.Portfolio;
import com.porflyo.model.portfolio.Slug;

import jakarta.validation.constraints.NotNull;

/*
 * Portfolio repository interface for managing user portfolios.
 * 
 */
public interface PortfolioRepository {

    /**
     * Saves a portfolio, or a draft portfolio if it's not yet published.
     *
     * @param portfolio the portfolio to save
     */
    void save(@NotNull Portfolio portfolio);

    /**
     * Finds a portfolio by its ID.
     *
     * @param userId the ID of the user
     * @param id     the ID of the portfolio
     * @return the found portfolio, or an empty optional if not found
     */
    @NotNull Optional<Portfolio> findById(UserId userId, PortfolioId id);

    /**
     * Finds all portfolios for a user.
     *
     * @param userId the ID of the user
     * @return the list of found portfolios
     */
    @NotNull List<Portfolio> findByUserId(UserId userId);

    /**
     * Patches a portfolio.
     *
     * @param userId      the ID of the user
     * @param portfolioId the ID of the portfolio
     * @param patch       the patch data
     * @return the patched portfolio
     */
    @NotNull Portfolio patch(
        @NotNull UserId userId,
        @NotNull PortfolioId portfolioId,
        @NotNull PortfolioPatchDto patch
    );

    /**
     * Sets the URL and visibility for the portfolio.
     * <p>
     * IMPORTANT!!! 
     * Does not change the public URL and public visibility,
     * that depends on {@link PortfolioUrlRepository}
     *
     * @param userId  the ID of the user
     * @param id      the ID of the portfolio
     * @param slugUrl the new slug URL
     * @param published whether the portfolio is published
     * @return the updated portfolio
     */
    @NotNull Portfolio setUrlAndVisibility(
        UserId userId,
        PortfolioId id,
        Slug slugUrl,
        boolean published);

    /**
     * Deletes a portfolio.
     *
     * @param userId      the ID of the user
     * @param portfolioId the ID of the portfolio
     */
    void delete(UserId userId, PortfolioId portfolioId);
}
