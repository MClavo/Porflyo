import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RepositoryDialog } from "../components/dialogs/RepositoryDialog";
import EditorDndProvider from "../components/dnd/EditorDndProvider";
import LayoutPreview from "../components/portfolio/LayoutPreview";
import { Notification } from "../components/notifications/Notification";
import SectionCard from "../components/sections/SectionCard";
import { AboutSection } from "../components/sections/AboutSection";
import type { AboutSectionData } from "../components/sections/AboutSection.types";
import { SavedCards } from "../components/savedcards/SavedCards";
import { EditorHeader as EditorHeader, EditorSidebar as EditorSidebar } from "../components/portfolioEditor";
import { usePortfolioEditorState } from "../hooks/editor/usePortfolioEditorState";
import { useRepositoryFlow } from "../hooks/save/repository/useRepositoryFlow";
import { useSavedCards } from "../state/SavedCards.hooks";
import { useSavedSectionsContext } from "../hooks/ui/useSavedSectionsContext";
import { useMedia } from "../api/hooks/useMedia";
import { type TemplateKey } from "../templates/Template.types";
import type { CardType, CardPatchByType } from "../state/Cards.types";
import type { PortfolioState } from "../state/Portfolio.types";
import type { SectionState } from "../state/Sections.types";
import type { AnyCard } from "../state/Cards.types";
import "../styles/pages/PortfolioEditor.css";

export default function PortfolioEditor({
  onPortfolioChange,
}: { onPortfolioChange?: (p: PortfolioState) => void } = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [notification, setNotification] = React.useState<{
    message: string;
    type: "success" | "error" | "info";
    isVisible: boolean;
  }>({ message: "", type: "success", isVisible: false });

  // Check if we're in edit mode (has portfolio ID) or new mode
  const isEditMode = location.pathname.includes('/edit');

  const showNotification = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => setNotification({ message, type, isVisible: true });
  const hideNotification = () =>
    setNotification((prev) => ({ ...prev, isVisible: false }));

  const state = usePortfolioEditorState({
    onPortfolioChange,
    showNotification,
  });

  // Sidebar is automatically open in edit mode, closed in view mode
  const isSidebarOpen = state.ui.mode === 'edit';

  const repoFlow = useRepositoryFlow({
    dispatch: state.dispatch as unknown as import("react").Dispatch<unknown>,
    showNotification,
  });

  // Saved cards state and actions
  const savedCardsContext = useSavedCards();
  
  // Saved sections from API
  const savedSectionsContext = useSavedSectionsContext();

  // Media hook for uploading images
  const { processCardImages } = useMedia();

  // Track if we've loaded saved sections to avoid reloading
  const hasLoadedSavedSections = React.useRef(false);

  // Sync saved sections from API to saved cards when they load for the first time
  React.useEffect(() => {
    if (
      savedSectionsContext.sections.length > 0 && 
      !savedSectionsContext.isLoading && 
      !hasLoadedSavedSections.current
    ) {
      savedCardsContext.loadFromSavedSections(savedSectionsContext.sections);
      hasLoadedSavedSections.current = true;
    }
  }, [savedSectionsContext.sections, savedSectionsContext.isLoading, savedCardsContext]);

  // Saved cards handlers
  const handleSaveCard = async (card: AnyCard, originSectionId: string, originSectionType: string, name: string) => {
    try {
      // First, upload any blob images and get the card with updated S3 URLs
      const { card: cardWithUploadedImages, urlMapping } = await processCardImages(card);
      
      // Update the portfolio state with new URLs (replaces blobs in all cards)
      if (Object.keys(urlMapping).length > 0) {
        state.dispatch({
          type: 'REPLACE_IMAGE_URLS',
          payload: { urlMapping }
        });
      }
      
      // Now save the card with the S3 URLs
      const savedSection = await savedCardsContext.saveCard(cardWithUploadedImages, originSectionId, originSectionType, name);
      
      // Also add to saved sections context
      savedSectionsContext.addSection(savedSection);
      
      showNotification("Card saved successfully", "success");
    } catch (error) {
      console.error("Error saving card:", error);
      showNotification("Failed to save card", "error");
    }
  };

  const handleRemoveCard = async (savedCardId: string) => {
    try {
      const savedCard = savedCardsContext.state.savedCards[savedCardId];
      await savedCardsContext.removeCard(savedCardId);
      
      // Also remove from saved sections context if it has an apiId
      if (savedCard?.apiId) {
        savedSectionsContext.removeSection(savedCard.apiId);
      }
      
      showNotification("Card removed successfully", "success");
    } catch {
      showNotification("Failed to remove card", "error");
    }
  };

  // Helper function to convert saved card to initialData format
  const convertSavedCardToInitialData = (card: AnyCard): CardPatchByType[CardType] | undefined => {
    switch (card.type) {
      case 'text':
        return card as CardPatchByType['text'];
      case 'project':
        return card as CardPatchByType['project'];
      case 'job':
        return card as CardPatchByType['job'];
      default:
        return undefined;
    }
  };

  const handleUseCard = (savedCardId: string, targetSectionId: string) => {
    const savedCard = savedCardsContext.state.savedCards[savedCardId];
    if (savedCard) {
      const initialData = convertSavedCardToInitialData(savedCard.card);
      // Add the card to the target section
      state.dispatch({
        type: "ADD_CARD",
        payload: {
          sectionId: targetSectionId,
          cardType: savedCard.card.type as CardType,
          initialData
        }
      });
      showNotification("Card added to section", "success");
    }
  };

  // Wrapper for save that handles navigation after creating a new portfolio
  const handleSaveWithNavigation = async () => {
    try {
      const result = await state.actions.handleSavePortfolio();
      // If we're creating a new portfolio (not in edit mode), redirect to edit page
      if (!isEditMode && result?.portfolioId) {
        navigate(`/portfolios/${result.portfolioId}/edit`);
      }
    } catch (err) {
      // Error is already handled in handleSavePortfolio
      console.error('Save failed:', err);
    }
  };

  // Build runtime structures similar to previous implementation
  const sectionsMap: Record<string, React.ReactNode> = {};
  const allCardsById: Record<string, unknown> = {};

  if (state.data.portfolio?.sections) {
    for (const section of Object.values(state.data.portfolio.sections)) {
      Object.assign(allCardsById, section.cardsById);
    }

    for (const [sid, section] of Object.entries(state.data.portfolio.sections)) {
      const s = section as unknown as SectionState;

      // Special handling for 'about' section - render AboutSection component instead of SectionCard
      if (s.type === 'about') {
        const aboutData = (s.parsedContent as AboutSectionData) || {
          name: '',
          email: '',
          description: '',
          profileImage: null,
          socials: {},
        };

        sectionsMap[sid] = (
          <AboutSection
            key={sid}
            mode={state.ui.mode}
            data={aboutData}
            onPatch={(patch) => {
              state.dispatch({
                type: 'PATCH_SECTION_CONTENT',
                payload: { sectionId: sid, data: patch }
              });
            }}
          />
        );
        continue; // Skip regular SectionCard rendering
      }

      // In view mode, skip sections that have no cards
      if (state.ui.mode === 'view' && (!s.cardsOrder || s.cardsOrder.length === 0)) {
        continue;
      }

      // Regular sections with cards
      sectionsMap[sid] = (
        <SectionCard
          key={sid}
          mode={state.ui.mode}
          id={sid}
          type={s.type}
          title={s.title}
          maxCards={s.maxCards}
          allowedTypes={s.allowedTypes}
          cardsById={s.cardsById}
          cardsOrder={s.cardsOrder}
          onPatch={(patch) => {
            const p = patch as Partial<SectionState>;
            if (typeof p.title === 'string') {
              state.dispatch({ type: 'RENAME_SECTION', payload: { sectionId: sid, title: p.title } });
            }
            if (p.allowedTypes || typeof p.maxCards !== 'undefined') {
              state.dispatch({ type: 'CONFIGURE_SECTION', payload: { sectionId: sid, allowedTypes: p.allowedTypes ?? [], maxCards: p.maxCards } });
            }
          }}
          onCardPatch={(cardId, patch) => {
            const card = s.cardsById?.[cardId];
            const cardType = card?.type as unknown as CardType;
            state.dispatch({ type: 'PATCH_CARD', payload: { sectionId: sid, cardId, cardType, patch } });
          }}
          onAddCard={(sectionId, cardType, initialData) => {
            if (cardType === 'project') {
              // open repository dialog flow which will dispatch ADD_CARD when repo selected
              repoFlow.openForSection(sectionId);
              return;
            }

            state.dispatch({ type: 'ADD_CARD', payload: { sectionId, cardType, initialData } });
          }}
          onRemoveCard={(sectionId, cardId) => {
            state.dispatch({ type: 'REMOVE_CARD', payload: { sectionId, cardId } });
          }}
        />
      );
    }
  }

  // loading / error states
  if (state.data.portfolioLoading) {
    return (
      <div className="portfolio-editor">
        <div className="portfolio-editor__loading">
          <div className="portfolio-editor__loading-spinner"></div>
          <p>Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (state.data.portfolioError) {
    return (
      <div className="portfolio-editor">
        <div className="portfolio-editor__error">
          <div>
            <p className="portfolio-editor__error-message">
              Error loading portfolio: {state.data.portfolioError}
            </p>
            <button 
              className="portfolio-editor__error-button"
              onClick={() => window.history.back()}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-editor">
      <EditorHeader
        portfolioTitle={state.data.portfolio.title}
        onTitleChange={state.actions.handleTitleChange}
        onSave={handleSaveWithNavigation}
        isSaving={state.actions.isSaving}
        mode={state.ui.mode}
        onModeToggle={state.ui.toggleMode}
        selectedTemplate={state.ui.selectedTemplate}
        onTemplateSelect={(t: TemplateKey) => {
          state.ui.setSelectedTemplate(t);
        }}
        slug={state.slug.slug}
        setSlug={state.slug.setSlug}
        currentSlug={state.data.currentSlug}
        isSlugAvailable={state.slug.isSlugAvailable}
        isCheckingSlug={state.slug.isCheckingSlug}
        onSlugAvailabilityChange={(available: boolean) => state.slug.handleSlugAvailabilityChange(available, false)}
        lastVerifiedSlug={state.slug.lastVerifiedSlug}
        isPublished={state.publication.isPublished}
        setIsPublished={state.publication.setIsPublished}
        onPublish={state.publication.handlePublishClick}
        isPublishing={state.publication.isPublishing}
        hasChanges={state.publication.hasChanges}
        isEditMode={isEditMode}
      />

      <EditorDndProvider
        template={state.data.portfolio.template}
        mode={state.ui.mode}
        // @ts-expect-error - runtime shape matches expected AnyCard; narrow types later if needed
        cardsById={allCardsById as Record<string, unknown>}
        sectionsById={state.data.portfolio.sections}
        onDragStart={state.drag.handleDragStart}
        onDragEnd={state.drag.handleDragEnd}
      >
        <EditorSidebar
          isOpen={isSidebarOpen}
          mode={state.ui.mode}
        >
          <SavedCards
            savedCards={savedCardsContext.state.savedCards}
            mode={state.ui.mode}
            onSave={handleSaveCard}
            onRemove={handleRemoveCard}
            onUse={handleUseCard}
            template={state.ui.selectedTemplate}
          />
        </EditorSidebar>

        <main className="portfolio-content">
          <LayoutPreview 
            portfolio={state.data.portfolio} 
            sectionsMap={sectionsMap as unknown as Record<string, React.ReactNode>} 
            isEditable={state.ui.mode === 'edit'} 
          />
        </main>
      </EditorDndProvider>

      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      <RepositoryDialog
        isOpen={repoFlow.isRepositoryDialogOpen}
        onClose={repoFlow.close}
        onSelectRepo={repoFlow.handleRepositorySelect}
      />
    </div>
  );
}
