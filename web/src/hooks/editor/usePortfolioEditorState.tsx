import { useEffect, useMemo, useReducer } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAuthContext } from '../ui/useAuthContext';
import { usePortfoliosContext } from '../ui/usePortfoliosContext';
import { mapPublicPortfolioDtoToPortfolioState } from '../../api/mappers/portfolio.mappers';
import { useMedia } from '../../api/hooks/useMedia';
// mode type previously used when this hook owned UI state
import type { AnyCard } from '../../state/Cards.types';
import { portfolioReducer } from '../../state/Portfolio.reducer';
import type { PortfolioState } from '../../state/Portfolio.types';
import { createInitialEmptyPortfolio } from '../../components/portfolio/initialPortfolio';
import { usePortfolioSave } from '../save/usePortfolioSave';

import { usePortfolioLoader } from './usePortfolioLoader';
import { useEditorMode } from './useEditorMode';
import { useEditorDrag } from './useEditorDrag';
import { useSlug } from '../publication/useSlug';
import { useSavedCards } from '../../state/SavedCards.hooks';
import { usePublicationManager } from '../publication/usePublicationManager';

// This will be computed dynamically based on whether we have user data

export function usePortfolioEditorState({ onPortfolioChange, showNotification }: {
  onPortfolioChange?: (p: PortfolioState) => void;
  showNotification: (msg: string, type?: 'success'|'error'|'info') => void;
}) {
  const { id: portfolioId } = useParams<{ id: string }>();
  const location = useLocation();
  const { user } = useAuthContext();
  const { updatePortfolio } = usePortfoliosContext();
  const isEditing = Boolean(portfolioId);
  const isCreatingNew = location.pathname.includes('/portfolios/new');
  const shouldStartInEditMode = isEditing || isCreatingNew;

  const { mode, toggleMode, selectedTemplate, setSelectedTemplate } = useEditorMode(
    shouldStartInEditMode ? 'edit' : 'view', 
    location.pathname // Use pathname as reset key
  );

  const [portfolio, dispatch] = useReducer(portfolioReducer, createInitialEmptyPortfolio());
  // Loader for existing portfolio
  const { existingPortfolio, portfolioLoading, portfolioError } = usePortfolioLoader(portfolioId || null);

  const { slug, setSlug, updateSlugFromTitle, currentSlug, isSlugAvailable, isCheckingSlug, handleSlugAvailabilityChange, lastVerifiedSlug } = useSlug({ isEditing, existingPortfolio });

  const { isPublished, setIsPublished, handlePublish, isPublishing, updateNormalizedSlug, hasChanges } = usePublicationManager({
    portfolioId,
    existingPortfolio,
    currentSlug: slug,
    onSuccess: () => {
      showNotification('Publication settings updated successfully!', 'success');
    },
    updatePortfolioInCache: updatePortfolio
  });

  const { state: savedCardsState } = useSavedCards();
  const { processPortfolioImages } = useMedia();

  // Combined effect to handle all portfolio loading scenarios
  useEffect(() => {
    if (isEditing && existingPortfolio) {
      // Load existing portfolio

      const mappedPortfolio = mapPublicPortfolioDtoToPortfolioState(existingPortfolio);
      dispatch({ type: 'LOAD_PORTFOLIO', payload: mappedPortfolio });
      setSelectedTemplate(mappedPortfolio.template);
    } else if (isCreatingNew) {
      // Create new portfolio - always reset to clean state
      // Pass user data to pre-populate about section if available
      const initialPortfolio = createInitialEmptyPortfolio(user);
      dispatch({ type: 'LOAD_PORTFOLIO', payload: initialPortfolio });
      setSelectedTemplate(initialPortfolio.template);
    } else if (!isEditing && !isCreatingNew) {
      // Fallback for other scenarios

      const initialPortfolio = createInitialEmptyPortfolio();
      dispatch({ type: 'LOAD_PORTFOLIO', payload: initialPortfolio });
      setSelectedTemplate(initialPortfolio.template);
    }
  }, [isEditing, existingPortfolio, isCreatingNew, user, setSelectedTemplate, location.pathname]);

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
      // First, upload all blob images in the portfolio
      const urlMapping = await processPortfolioImages(portfolio);
      
      // If there are any blob images, update the portfolio state with S3 URLs
      if (Object.keys(urlMapping).length > 0) {
        dispatch({
          type: 'REPLACE_IMAGE_URLS',
          payload: { urlMapping }
        });
      }

      // Note: The reducer updates the state synchronously, but we need to save
      // the updated portfolio. We'll use the portfolio from the next render cycle
      // by waiting a tick, or we can construct the updated portfolio manually.
      // For simplicity, we'll create a temporary updated portfolio object.
      let portfolioToSave = portfolio;
      if (Object.keys(urlMapping).length > 0) {
        // Create a deep copy and apply the URL replacements
        portfolioToSave = JSON.parse(JSON.stringify(portfolio)) as PortfolioState;
        
        // Apply URL replacements to the copy
        Object.values(portfolioToSave.sections).forEach(section => {
          Object.values(section.cardsById).forEach(card => {
            if (card.data) {
              replaceUrlsInObject(card.data as Record<string, unknown>, urlMapping);
            }
          });
          
          // Also update parsedContent for about sections
          if (section.parsedContent && typeof section.parsedContent === 'object') {
            replaceUrlsInObject(section.parsedContent as Record<string, unknown>, urlMapping);
          }
        });
      }

      // Now save the portfolio with all S3 URLs
      const result = await savePortfolio(portfolioToSave, portfolioId);
      showNotification('Portfolio saved successfully!', 'success');
      return result;
    } catch (err) {
      console.error('Failed to save portfolio:', err);
      showNotification('Failed to save portfolio. Please try again.', 'error');
      throw err;
    }
  };

  // Helper function to replace URLs in an object recursively
  const replaceUrlsInObject = (obj: Record<string, unknown>, urlMapping: Record<string, string>): void => {
    Object.keys(obj).forEach(key => {
      const value = obj[key];

      if (typeof value === 'string' && urlMapping[value]) {
        obj[key] = urlMapping[value];
      } else if (Array.isArray(value)) {
        obj[key] = value.map(item =>
          typeof item === 'string' && urlMapping[item] ? urlMapping[item] : item
        );
      } else if (value && typeof value === 'object') {
        replaceUrlsInObject(value as Record<string, unknown>, urlMapping);
      }
    });
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
      lastVerifiedSlug,
    },
    publication: {
      isPublished,
      setIsPublished,
      isPublishing,
      handlePublishClick,
      hasChanges,
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
