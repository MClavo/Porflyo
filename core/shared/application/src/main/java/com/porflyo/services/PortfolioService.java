package com.porflyo.services;

import static java.util.Objects.requireNonNull;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Set;

import com.porflyo.dto.PortfolioPatchDto;
import com.porflyo.ports.input.MediaUseCase;
import com.porflyo.ports.input.PortfolioUseCase;
import com.porflyo.ports.output.PortfolioRepository;
import com.porflyo.ports.output.PortfolioUrlRepository;
import com.porflyo.ports.output.QuotaRepository;
import com.porflyo.ports.output.SlugGeneratorPort;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.portfolio.Portfolio;
import com.porflyo.model.portfolio.PortfolioSection;
import com.porflyo.model.portfolio.Slug;

import io.micronaut.core.annotation.NonNull;
import io.micronaut.core.annotation.Nullable;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import jakarta.validation.constraints.NotNull;

/**
 * Application service that orchestrates portfolio lifecycle: - Persistence via
 * PortfolioRepository - Slug mapping & visibility via PortfolioUrlRepository -
 * Media usage counters & storage via MediaUseCase - Quotas via QuotaRepository
 */
@Singleton
public class PortfolioService implements PortfolioUseCase {

    // ────────────────────────── Dependencies ──────────────────────────
    private final PortfolioRepository portfolioRepository;
    private final PortfolioUrlRepository portfolioUrlRepository;
    private final MediaUseCase mediaUseCase;
    private final QuotaRepository quotaRepository;
    private final SlugGeneratorPort slugGenerator;

    @Inject
    public PortfolioService(
            PortfolioRepository portfolioRepository,
            PortfolioUrlRepository portfolioUrlRepository,
            MediaUseCase mediaUseCase,
            QuotaRepository quotaRepository,
            SlugGeneratorPort slugGenerator) {

        this.portfolioRepository = requireNonNull(portfolioRepository);
        this.portfolioUrlRepository = requireNonNull(portfolioUrlRepository);
        this.mediaUseCase = requireNonNull(mediaUseCase);
        this.quotaRepository = requireNonNull(quotaRepository);
        this.slugGenerator = requireNonNull(slugGenerator);
    }


    // ────────────────────────── Create ──────────────────────────
    
    /**
     * Creates a draft portfolio. Drafts are expected to be unpublished and may have
     * empty slug. Enforces user quota for portfolios.
     */
    @Override
    public void createDraft(@NonNull Portfolio portfolio) {

        requireNonNull(portfolio, "portfolio");
        UserId owner = requireNonNull(portfolio.userId(), "portfolio.userId");

        // Quota check (throws if exceeded)
        quotaRepository.updatePortfolioCount(owner, +1);

        try {
            portfolioRepository.save(portfolio);
        } catch (RuntimeException ex) {
            // Rollback quota if persistence fails
            safeRollbackPortfolioQuota(owner);
            throw ex;
        }
    }


    // ────────────────────────── Read ──────────────────────────
    
    @Override
    public Optional<Portfolio> findById(@NonNull UserId userId, @NonNull PortfolioId portfolioId) {
        requireNonNull(userId, "userId");
        requireNonNull(portfolioId, "portfolioId");
        return portfolioRepository.findById(userId, portfolioId);
    }

    @Override
    public List<Portfolio> listByOwner(@NonNull UserId userId) {
        requireNonNull(userId, "userId");
        return portfolioRepository.findByUserId(userId);
    }


    // ────────────────────────── Patch ──────────────────────────
    
    /**
     * Applies a partial update and keeps media usage counters consistent. If the
     * patch contains a media list, compute delta vs current: - increment counters
     * for added keys - decrement counters (and delete in storage) for removed keys
     */
    @Override
    public Portfolio patchPortfolio(
            @NotNull UserId userId,
            @NotNull PortfolioId portfolioId,
            @NotNull PortfolioPatchDto patch) {

        requireNonNull(userId, "userId");
        requireNonNull(portfolioId, "portfolioId");
        requireNonNull(patch, "patch");

        Portfolio current = portfolioRepository.findById(userId, portfolioId)
                .orElseThrow(() -> new NoSuchElementException("Portfolio not found"));

        // If the patch contains sections, update media counters accordingly
        patch.sections().ifPresent(newSections -> 
            updateMediaCountersOnSectionsChange(userId, current.sections(), newSections));

        // Persist patch (repo applies Optionals as partial update)
        return portfolioRepository.patch(userId, portfolioId, patch);
    }


    // ────────────────────────── Slug & Visibility ──────────────────────────
    
    /**
     * Sets slug and visibility orchestrating: - URL mapping (slug ↔ portfolio) as
     * the source of truth for public access - Portfolio item reflection
     * (slug/published) for convenience/reads
     *
     * The operation is designed to be idempotent with conditional writes + retries
     * in repositories.
     */
    @Override
    public Portfolio setUrlAndVisibility(
            @NonNull UserId userId,
            @NonNull PortfolioId portfolioId,
            @NonNull String url,
            boolean published) {

        requireNonNull(userId, "userId");
        requireNonNull(portfolioId, "id");
        requireNonNull(url, "url");

        Slug slugUrl = slugGenerator.normalize(url);

        // Load current (to know previous slug, if any)
        Portfolio current = portfolioRepository.findById(userId, portfolioId).orElse(null);

        if (current == null){
            portfolioUrlRepository.reserve(slugUrl, userId, portfolioId, published);
            return portfolioRepository.setUrlAndVisibility(userId, portfolioId, slugUrl, published);
        } 

        Slug oldSlug = current.reservedSlug();

        if (!equalsSlug(oldSlug, slugUrl)) 
            portfolioUrlRepository.changeSlugAtomic(
                oldSlug, 
                slugUrl,
                userId, 
                portfolioId, 
                current.isPublished());
        
        // Update visibility in URL mapping
        if (current.isPublished() != published) 
            portfolioUrlRepository.updateVisibility(slugUrl, published);
        
        
        return portfolioRepository.setUrlAndVisibility(userId, portfolioId, slugUrl, published);
    }


    // ────────────────────────── Delete ──────────────────────────
    
    /**
     * Deletes a portfolio: - decrements media usage and deletes from storage keys
     * that reach zero - releases slug mapping (if any) - updates quota
     */
    @Override
    public void delete(@NonNull UserId userId, @NonNull PortfolioId portfolioId) {
        requireNonNull(userId, "userId");
        requireNonNull(portfolioId, "portfolioId");

        Portfolio current = portfolioRepository.findById(userId, portfolioId)
                .orElseThrow(() -> new NoSuchElementException("Portfolio not found"));

        // Media usage handling
        List<String> mediaKeys = safeList(current.media());
        if (!mediaKeys.isEmpty()) 
            mediaUseCase.decrementUsageAndDeleteUnused(userId, mediaKeys);
        
        // Release slug mapping if present
        Slug slug = current.reservedSlug();
        if (slug != null) 
            portfolioUrlRepository.release(slug);
        

        // Delete portfolio and update quota
        portfolioRepository.delete(userId, portfolioId);
        quotaRepository.updatePortfolioCount(userId, -1);
    }

    
    // ────────────────────────── Helpers ──────────────────────────

    private static boolean equalsSlug(Slug a, Slug b) {
        if (a == b) return true;
        if (a == null || b == null) return false;
        return a.value().equals(b.value());
    }

    private static <T> List<T> safeList(@Nullable List<T> list) {
        return list == null ? List.of() : list;
    }

    private void safeRollbackPortfolioQuota(UserId owner) {
        try {
            quotaRepository.updatePortfolioCount(owner, -1);
        } catch (Exception ignore) {
            // best-effort rollback;
        }
    }

    private static Map<String, Integer> mediaFrequencyFromSections(List<PortfolioSection> sections) {
        Map<String, Integer> freq = new HashMap<>();
        for (PortfolioSection s : sections) {
            List<String> media = s.media() == null ? List.of() : s.media();
            for (String key : media) {
                if (key == null || key.isBlank())
                    continue;
                freq.merge(key, 1, Integer::sum);
            }
        }
        return freq;
    }

    private static List<String> expandByFrequency(Map<String, Integer> counts) {
        List<String> out = new ArrayList<>(counts.values().stream().mapToInt(Integer::intValue).sum());
        counts.forEach((k, n) -> {
            for (int i = 0; i < n; i++)
                out.add(k);
        });
        return out;
    }

    /**
     * Computes the multiset difference in media keys between old and new sections,
     * incrementing and decrementing global usage counters accordingly.
     */
    private void updateMediaCountersOnSectionsChange(
            UserId userId,
            List<PortfolioSection> oldSections,
            List<PortfolioSection> newSections) {
        Map<String, Integer> oldCounts = mediaFrequencyFromSections(safeList(oldSections));
        Map<String, Integer> newCounts = mediaFrequencyFromSections(safeList(newSections));

        Map<String, Integer> toInc = new HashMap<>();
        Map<String, Integer> toDec = new HashMap<>();

        Set<String> allKeys = new HashSet<>();
        allKeys.addAll(oldCounts.keySet());
        allKeys.addAll(newCounts.keySet());

        for (String key : allKeys) {
            int oldC = oldCounts.getOrDefault(key, 0);
            int newC = newCounts.getOrDefault(key, 0);
            int delta = newC - oldC;
            if (delta > 0)
                toInc.put(key, delta);
            if (delta < 0)
                toDec.put(key, -delta);
        }

        if (!toInc.isEmpty()) {
            mediaUseCase.incrementUsage(userId, expandByFrequency(toInc));
        }
        if (!toDec.isEmpty()) {
            mediaUseCase.decrementUsageAndDeleteUnused(userId, expandByFrequency(toDec));
        }
    }
}
