package com.porflyo.usecase;


import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.BDDMockito.willThrow;
import static org.mockito.Mockito.mock;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.porflyo.dto.PortfolioPatchDto;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.portfolio.Portfolio;
import com.porflyo.model.portfolio.PortfolioSection;
import com.porflyo.model.portfolio.Slug;
import com.porflyo.ports.PortfolioRepository;
import com.porflyo.ports.PortfolioUrlRepository;
import com.porflyo.ports.QuotaRepository;
import com.porflyo.ports.SlugGeneratorPort;

@ExtendWith(MockitoExtension.class)
@DisplayName("PortfolioUseCase Tests")
class PortfolioUseCaseTest {

    @Mock PortfolioRepository portfolioRepository;
    @Mock PortfolioUrlRepository portfolioUrlRepository;
    @Mock MediaUseCase mediaUseCase;
    @Mock QuotaRepository quotaRepository;
    @Mock SlugGeneratorPort slugGenerator;
    @Mock MetricsUseCase metricsUseCase;

    @InjectMocks PortfolioUseCase portfolioUseCase;

    private final UserId userId = new UserId("u1");
    private final PortfolioId pid = new PortfolioId("p1");

    @BeforeEach
    void setup() {
    }

    // ────────────────────────── createDraft ──────────────────────────

    @Test
    @DisplayName("should increase quota and save draft when creating a portfolio")
    void should_increase_quota_and_save_when_createDraft() {
        // given
        Portfolio draft = mock(Portfolio.class);
        given(draft.userId()).willReturn(userId);

        // when
        portfolioUseCase.createDraft(draft);

        // then
        then(quotaRepository).should().updatePortfolioCount(userId, +1);
        then(portfolioRepository).should().save(draft);
    }

    @Test
    @DisplayName("should rollback quota if saving draft fails")
    void should_rollback_quota_when_createDraft_fails() {
        // given
        Portfolio draft = mock(Portfolio.class);
        given(draft.userId()).willReturn(userId);
        willThrow(new RuntimeException("boom")).given(portfolioRepository).save(draft);

        // when
        assertThatThrownBy(() -> portfolioUseCase.createDraft(draft))
            .isInstanceOf(RuntimeException.class);

        // then (best-effort rollback)
        then(quotaRepository).should().updatePortfolioCount(userId, +1);
        then(quotaRepository).should().updatePortfolioCount(userId, -1);
    }

    // ────────────────────────── patchPortfolio (media delta) ──────────────────────────

    @Test
    @DisplayName("should increment/decrement media counters when sections change")
    void should_update_media_counters_when_sections_change() {
        // given current portfolio with sections [a, a, b]
        Portfolio current = mock(Portfolio.class);
        List<PortfolioSection> oldSections = List.of(
            new PortfolioSection("t","T","C", List.of("a", "a")),
            new PortfolioSection("t","T","C", List.of("b"))
        );
        given(current.sections()).willReturn(oldSections);
        given(portfolioRepository.findById(userId, pid)).willReturn(Optional.of(current));

        // and patch replaces sections with [a, c, c]
        List<PortfolioSection> newSections = List.of(
            new PortfolioSection("t","T","C", List.of("a", "c", "c"))
        );
        PortfolioPatchDto patch = new PortfolioPatchDto(
            Optional.empty(), Optional.empty(), Optional.empty(),
            Optional.of(newSections), Optional.empty()
        );

        Portfolio persisted = mock(Portfolio.class);
        given(portfolioRepository.patch(eq(userId), eq(pid), eq(patch))).willReturn(persisted);

        // when
        Portfolio result = portfolioUseCase.patchPortfolio(userId, pid, patch);

        // then
        assertThat(result).isSameAs(persisted);

        // old counts: a×2, b×1
        // new counts: a×1, c×2
        // delta: a -1 -> dec("a"), b -1 -> dec("b"), c +2 -> inc("c","c")
        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<String>> incCap = ArgumentCaptor.forClass((Class<List<String>>) (Class<?>) List.class);
        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<String>> decCap = ArgumentCaptor.forClass((Class<List<String>>) (Class<?>) List.class);

        then(mediaUseCase).should().incrementUsage(eq(userId), incCap.capture());
        then(mediaUseCase).should().decrementUsageAndDeleteUnused(eq(userId), decCap.capture());

        assertThat(incCap.getValue()).containsExactly("c","c");
        assertThat(decCap.getValue()).containsExactlyInAnyOrder("a","b");
    }

    @Test
    @DisplayName("should not touch media counters when sections not provided in patch")
    void should_not_touch_media_when_sections_absent() {
        // given
        Portfolio current = mock(Portfolio.class);
        given(portfolioRepository.findById(userId, pid)).willReturn(Optional.of(current));
        PortfolioPatchDto patch = new PortfolioPatchDto(
            Optional.empty(), Optional.empty(), Optional.empty(),
            Optional.empty(), Optional.empty()
        );
        Portfolio persisted = mock(Portfolio.class);
        given(portfolioRepository.patch(eq(userId), eq(pid), eq(patch))).willReturn(persisted);

        // when
        Portfolio result = portfolioUseCase.patchPortfolio(userId, pid, patch);

        // then
        assertThat(result).isSameAs(persisted);
        then(mediaUseCase).shouldHaveNoInteractions();
    }

    // ────────────────────────── setUrlAndVisibility ──────────────────────────

    @Test
    @DisplayName("should change slug and update visibility, then persist")
    void should_change_slug_and_update_visibility_when_differs() {
        // given
        Slug old = new Slug("old");
        Slug normalized = new Slug("new");
        Portfolio current = mock(Portfolio.class);

        given(slugGenerator.normalize("New ")).willReturn(normalized);
        given(portfolioRepository.findById(userId, pid)).willReturn(Optional.of(current));
        given(current.reservedSlug()).willReturn(old);
        given(current.isPublished()).willReturn(false);

        Portfolio persisted = mock(Portfolio.class);
        given(portfolioRepository.setUrlAndVisibility(userId, pid, normalized, true)).willReturn(persisted);

        // when
        var result = portfolioUseCase.setUrlAndVisibility(userId, pid, "New ", true);

        // then
        then(portfolioUrlRepository).should()
            .changeSlugAtomic(old, normalized, userId, pid, false);
        then(portfolioUrlRepository).should().updateVisibility(normalized, true);
        then(portfolioRepository).should().setUrlAndVisibility(userId, pid, normalized, true);

        assertThat(result).isSameAs(persisted);
    }

    @Test
    @DisplayName("should only persist when slug and visibility are unchanged")
    void should_only_persist_when_slug_and_visibility_unchanged() {
        // given
        Slug same = new Slug("same");
        Portfolio current = mock(Portfolio.class);

        given(slugGenerator.normalize("same")).willReturn(same);
        given(portfolioRepository.findById(userId, pid)).willReturn(Optional.of(current));
        given(current.reservedSlug()).willReturn(same);
        given(current.isPublished()).willReturn(true);

        Portfolio persisted = mock(Portfolio.class);
        given(portfolioRepository.setUrlAndVisibility(userId, pid, same, true)).willReturn(persisted);

        // when
        var result = portfolioUseCase.setUrlAndVisibility(userId, pid, "same", true);

        // then
        then(portfolioUrlRepository).shouldHaveNoInteractions();
        then(portfolioRepository).should().setUrlAndVisibility(userId, pid, same, true);
        assertThat(result).isSameAs(persisted);
    }

    // ────────────────────────── delete ──────────────────────────

    @Test
    @DisplayName("should decrement media, release slug, delete and update quota when deleting portfolio")
    void should_cleanup_and_delete_when_delete() {
        // given
        Slug reserved = new Slug("pub");
        Portfolio current = mock(Portfolio.class);
        given(current.reservedSlug()).willReturn(reserved);
        given(current.media()).willReturn(List.of("a","b"));

        given(portfolioRepository.findById(userId, pid)).willReturn(Optional.of(current));

        // when
        portfolioUseCase.delete(userId, pid);

        // then
        then(mediaUseCase).should().decrementUsageAndDeleteUnused(userId, List.of("a","b"));
        then(portfolioUrlRepository).should().release(reserved);
        then(portfolioRepository).should().delete(userId, pid);
        then(quotaRepository).should().updatePortfolioCount(userId, -1);
    }
}

