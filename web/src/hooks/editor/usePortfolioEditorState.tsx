import { useEffect, useMemo, useReducer } from 'react';
import { useParams } from 'react-router-dom';
import { mapPublicPortfolioDtoToPortfolioState } from '../../api/mappers/portfolio.mappers';
// mode type previously used when this hook owned UI state
import type { AnyCard } from '../../state/Cards.types';
import { portfolioReducer } from '../../state/Portfolio.reducer';
import type { PortfolioState } from '../../state/Portfolio.types';
import { initialEmptyPortfolio } from '../../components/portfolio/initialPortfolio';
import { usePortfolioSave } from '../save/usePortfolioSave';

import { usePortfolioLoader } from './usePortfolioLoader';
import { useEditorMode } from './useEditorMode';
import { useEditorDrag } from './useEditorDrag';
import { useSlug } from '../publication/useSlug';
import { useSavedCards } from '../../state/SavedCards.hooks';
import { usePublicationManager } from '../publication/usePublicationManager';

const initialPortfolio: PortfolioState = {
  template: initialEmptyPortfolio.template,
  title: initialEmptyPortfolio.title,
  sections: initialEmptyPortfolio.sections,
};

export function usePortfolioEditorState({ onPortfolioChange, showNotification }: {
  onPortfolioChange?: (p: PortfolioState) => void;
  showNotification: (msg: string, type?: 'success'|'error'|'info') => void;
}) {
  const { id: portfolioId } = useParams<{ id: string }>();
  const isEditing = Boolean(portfolioId);

  const { mode, toggleMode, selectedTemplate, setSelectedTemplate } = useEditorMode();

  const [portfolio, dispatch] = useReducer(portfolioReducer, {
    template: selectedTemplate,
    title: '',
    sections: {},
  } as PortfolioState);
  // Loader for existing portfolio
  const { existingPortfolio, portfolioLoading, portfolioError } = usePortfolioLoader(portfolioId || null);

  const { slug, setSlug, updateSlugFromTitle, currentSlug, isSlugAvailable, isCheckingSlug, handleSlugAvailabilityChange } = useSlug({ isEditing, existingPortfolio });

  const { isPublished, setIsPublished, handlePublish, isPublishing, updateNormalizedSlug } = usePublicationManager({
    portfolioId,
    existingPortfolio,
    onSuccess: () => {
      showNotification('Publication settings updated successfully!', 'success');
    }
  });

  const { state: savedCardsState } = useSavedCards();

  // Load existing portfolio into reducer
  useEffect(() => {
    if (isEditing && existingPortfolio) {
      const mappedPortfolio = mapPublicPortfolioDtoToPortfolioState(existingPortfolio);
      dispatch({ type: 'LOAD_PORTFOLIO', payload: mappedPortfolio });
      setSelectedTemplate(mappedPortfolio.template);
    } else if (!isEditing) {
      dispatch({ type: 'LOAD_PORTFOLIO', payload: initialPortfolio });
    }
  }, [isEditing, existingPortfolio, setSelectedTemplate]);

  // Sync selectedTemplate with portfolio.template
  useEffect(() => {
    if (portfolio?.template !== selectedTemplate) {
      dispatch({
        type: "SWITCH_TEMPLATE",
        payload: { template: selectedTemplate },
      });
    }
  }, [selectedTemplate, portfolio?.template]);

  useEffect(() => {
    onPortfolioChange?.(portfolio);
  }, [portfolio, onPortfolioChange]);

  const allCardsById: Record<string, AnyCard> = {};
  if (portfolio?.sections) {
    for (const section of Object.values(portfolio.sections)) {
      Object.assign(allCardsById, section.cardsById);
    }
  }

  const sectionsMap = useMemo(() => portfolio?.sections ?? {}, [portfolio]);

  const { handleDragStart, handleDragEnd } = useEditorDrag({ portfolio, dispatch: dispatch as unknown as React.Dispatch<unknown>, savedCardsState });

  const handleTitleChange = (newTitle: string) => {
    dispatch({ type: 'UPDATE_TITLE', payload: { title: newTitle } });
    updateSlugFromTitle(newTitle);
  };
  const handleImageUrlsReplaced = (urlMapping: Record<string, string>) => {
    dispatch({ type: 'REPLACE_IMAGE_URLS', payload: { urlMapping } });
  };

  const handlePublishClick = async () => {
    try {
      await handlePublish(slug);
    } catch (err) {
      console.error('Failed to update publication settings:', err);
      showNotification('Failed to update publication settings. Please try again.', 'error');
    }
  };

  const { savePortfolio, isSaving } = usePortfolioSave();

  const handleSavePortfolio = async () => {
    try {
      await savePortfolio(portfolio, portfolioId);
      showNotification('Portfolio saved successfully!', 'success');
    } catch (err) {
      console.error('Failed to save portfolio:', err);
      showNotification('Failed to save portfolio. Please try again.', 'error');
    }
  };

  // wrapper to keep previous behavior: when slug is available and check finished, normalize it
  const handleSlugAvailabilityChangeLocal = (isAvailable: boolean, isChecking: boolean) => {
    handleSlugAvailabilityChange(isAvailable, isChecking);
    if (isAvailable && !isChecking) {
      updateNormalizedSlug(slug);
    }
  };

  return {
    ui: {
      mode,
      toggleMode,
      selectedTemplate,
      setSelectedTemplate,
    },
    data: {
      portfolio,
      portfolioLoading,
      portfolioError,
      allCardsById,
      sectionsMap,
      currentSlug,
    },
    slug: {
      slug,
      setSlug,
      isSlugAvailable,
      isCheckingSlug,
      handleSlugAvailabilityChange: handleSlugAvailabilityChangeLocal,
      updateSlugFromTitle,
    },
    publication: {
      isPublished,
      setIsPublished,
      isPublishing,
      handlePublishClick,
    },
    actions: {
      handleTitleChange,
      handleImageUrlsReplaced,
      handleSavePortfolio,
      isSaving,
    },
    drag: {
      handleDragStart,
      handleDragEnd,
    },
    // keep dispatch top-level for simple consumers that need to call reducer directly
    dispatch,
  } as const;
}
