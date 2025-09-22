import React, { useEffect, useReducer, useState } from "react";
import { useParams } from "react-router-dom";
import type { Mode } from "../components/cards/subcomponents/Fields.types";
import "../styles/EditorTest.css";
import EditorDndProvider from "../components/dnd/EditorDndProvider";
import { useSavedCards } from "../state/SavedCards.hooks";
import { useSavedSectionsContext } from "../hooks/useSavedSectionsContext";
import { portfolioReducer } from "../state/Portfolio.reducer";
import type { PortfolioState } from "../state/Portfolio.types";
import { createDragHandlers } from "./editor/dragHandlers";
import { initialEmptyPortfolio } from "./editor/initialPortfolio";
import { usePortfolioSave } from "./editor/usePortfolioSave";
import { usePortfoliosContext } from "../hooks/usePortfoliosContext";
import { mapPublicPortfolioDtoToPortfolioState } from "../api/mappers/portfolio.mappers";
import { useSlugManager } from "../hooks/useSlugManager";
import { usePublicationManager } from "../hooks/usePublicationManager";
import { SlugInput } from "../components/slug";
import { PortfolioTitleInput, PublicationSettings } from "../components/portfolio";
import { Notification } from "../components/notifications/Notification";
import { RepositoryDialog } from '../components/dialogs/RepositoryDialog';
import { useRepositoriesContext } from '../hooks/useRepositoriesContext';
import type { Repository } from '../api/types/repository.types';
import { mapRepositoryForCard } from '../api/types/repository.types';
import SavedSidebar from "./editor/SavedSidebar";
import LayoutPreview from "./editor/LayoutPreview";
import { templateList } from "../templates/Template.types";
import type { TemplateKey } from "../templates/Template.types";
import type { AnyCard } from "../state/Cards.types";
import type { SectionState } from "../state/Sections.types";
import SectionCard from "../components/sections/SectionCard";

// Keep exact empty portfolio initialization for new portfolios
const initialPortfolio: PortfolioState = {
  template: initialEmptyPortfolio.template,
  title: initialEmptyPortfolio.title,
  sections: initialEmptyPortfolio.sections,
};

export default function PortfolioEditor({ 
  onPortfolioChange
}: { 
  onPortfolioChange?: (portfolio: PortfolioState) => void;
} = {}) {
  // Get portfolio ID from URL params (if editing existing portfolio)
  const { id: portfolioId } = useParams<{ id: string }>();
  const isEditing = Boolean(portfolioId);

  const [mode, setMode] = useState<Mode>("view");
  const toggleMode = () => setMode((m) => (m === "view" ? "edit" : "view"));

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>(
    initialPortfolio.template
  );

  const [portfolio, dispatch] = useReducer(portfolioReducer, {
    template: selectedTemplate,
    title: "",
    sections: {},
  } as PortfolioState);

  // Load existing portfolio if editing
  const { portfolios, isLoading: portfoliosLoading } = usePortfoliosContext();
  const existingPortfolio = portfolioId ? portfolios.find(p => p.id === portfolioId) : null;
  const portfolioLoading = isEditing && portfoliosLoading;
  const portfolioError = portfolioId && !portfoliosLoading && !existingPortfolio ? 'Portfolio not found' : null;

  // Slug management
  const {
    slug,
    setSlug,
    updateSlugFromTitle,
    currentSlug
  } = useSlugManager({ isEditing, existingPortfolio });

  // Publication management
  const {
    isPublished,
    setIsPublished,
    handlePublish,
    isPublishing,
    updateNormalizedSlug
  } = usePublicationManager({ 
    portfolioId, 
    existingPortfolio,
    onSuccess: () => {
      showNotification('Publication settings updated successfully!', 'success');
      // The portfolio context should be updated elsewhere
    }
  });

  // State for slug availability (for publication button)
  const [isSlugAvailable, setIsSlugAvailable] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  const { state: savedCardsState } = useSavedCards();

  // Saved sections management - load from API on first visit
  const { loadSections, isLoaded: savedSectionsLoaded } = useSavedSectionsContext();

  // Load saved sections when entering editor for the first time
  useEffect(() => {
    if (!savedSectionsLoaded) {
      loadSections().catch(err => {
        console.error('Failed to load saved sections:', err);
        showNotification('Failed to load saved cards', 'error');
      });
    }
  }, [savedSectionsLoaded, loadSections]);

  // Portfolio save functionality
  const { savePortfolio, isSaving } = usePortfolioSave();

  // Repository management
  const { loadRepositories } = useRepositoriesContext();
  const [isRepositoryDialogOpen, setIsRepositoryDialogOpen] = useState(false);
  const [pendingCardSection, setPendingCardSection] = useState<string | null>(null);

  // Load repositories when entering editor for the first time
  useEffect(() => {
    loadRepositories().catch(err => {
      console.error('Failed to load repositories:', err);
      showNotification('Failed to load repositories', 'error');
    });
  }, [loadRepositories]);

  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  // Helper functions for notifications
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({
      message,
      type,
      isVisible: true
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  // Handler for title changes
  const handleTitleChange = (newTitle: string) => {
    dispatch({ type: "UPDATE_TITLE", payload: { title: newTitle } });
    // Auto-generate slug from title for new portfolios
    updateSlugFromTitle(newTitle);
  };

  // Handler for slug availability changes
  const handleSlugAvailabilityChange = (isAvailable: boolean, isChecking: boolean) => {
    setIsSlugAvailable(isAvailable);
    setIsCheckingSlug(isChecking);
    
    // Update normalized slug for publication when available
    if (isAvailable && !isChecking) {
      updateNormalizedSlug(slug);
    }
  };

  // Handler for image URL replacement after saving cards
  const handleImageUrlsReplaced = (urlMapping: Record<string, string>) => {
    dispatch({ type: "REPLACE_IMAGE_URLS", payload: { urlMapping } });
  };

  // Handler for publication
  const handlePublishClick = async () => {
    try {
      await handlePublish(slug);
    } catch (err) {
      console.error('Failed to update publication settings:', err);
      showNotification('Failed to update publication settings. Please try again.', 'error');
    }
  };

  // Handler for saving portfolio
  const handleSavePortfolio = async () => {
    try {
      await savePortfolio(portfolio, portfolioId); // Pass portfolioId for updates
      showNotification('Portfolio saved successfully!', 'success');
    } catch (err) {
      console.error('Failed to save portfolio:', err);
      showNotification('Failed to save portfolio. Please try again.', 'error');
    }
  };

  // Repository selection handlers
  const handleRepositorySelect = (repository: Repository) => {
    if (!pendingCardSection) return;

    // Map repository to project card data
    const mappedRepo = mapRepositoryForCard(repository);
    const initialData = {
      title: mappedRepo.name,
      description: mappedRepo.description,
      techTitle: 'Technologies:',
      technologies: mappedRepo.topics, // Use topics as initial technologies
      images: [],
      repoUrl: mappedRepo.html_url,
      liveUrl: mappedRepo.homepage,
      stars: mappedRepo.stargazers_count,
      forks: mappedRepo.forks_count,
    };

    // Create the project card with repository data
    dispatch({ 
      type: "ADD_CARD", 
      payload: { 
        sectionId: pendingCardSection, 
        cardType: 'project', 
        initialData 
      } 
    });

    // Reset dialog state
    setIsRepositoryDialogOpen(false);
    setPendingCardSection(null);
    showNotification('Project card created from repository!', 'success');
  };

  const handleRepositoryDialogClose = () => {
    setIsRepositoryDialogOpen(false);
    setPendingCardSection(null);
  };

  useEffect(() => {
    if (isEditing && existingPortfolio) {
      // Load existing portfolio data
      const mappedPortfolio = mapPublicPortfolioDtoToPortfolioState(existingPortfolio);
      dispatch({ type: "LOAD_PORTFOLIO", payload: mappedPortfolio });
      setSelectedTemplate(mappedPortfolio.template);
    } else if (!isEditing) {
      // Load empty portfolio for new portfolio
      dispatch({ type: "LOAD_PORTFOLIO", payload: initialPortfolio });
    }
  }, [isEditing, existingPortfolio]);

  useEffect(() => {
    onPortfolioChange?.(portfolio);
  }, [portfolio, onPortfolioChange]);

  // Build runtime structures
  const sectionsMap: Record<string, React.ReactNode> = {};
  const allCardsById: Record<string, AnyCard> = {};

  if (portfolio?.sections) {
    for (const section of Object.values(portfolio.sections)) {
      Object.assign(allCardsById, section.cardsById);
    }

    for (const [sid, section] of Object.entries(portfolio.sections)) {
      const s = section as SectionState;
      
      sectionsMap[sid] = (
        <SectionCard
          key={sid}
          mode={mode}
          id={sid}
          type={s.type}
          title={s.title}
          maxCards={s.maxCards}
          allowedTypes={s.allowedTypes}
          cardsById={s.cardsById}
          cardsOrder={s.cardsOrder}
          onPatch={(patch) => {
            if (patch.title !== undefined) {
              dispatch({
                type: "RENAME_SECTION",
                payload: { sectionId: sid, title: String(patch.title) },
              });
            }
            if (
              patch.allowedTypes !== undefined ||
              patch.maxCards !== undefined
            ) {
              dispatch({
                type: "CONFIGURE_SECTION",
                payload: {
                  sectionId: sid,
                  allowedTypes: patch.allowedTypes!,
                  maxCards: patch.maxCards,
                },
              });
            }
          }}
          onCardPatch={(cardId, patch) => {
            const currentCard = portfolio.sections?.[sid]?.cardsById?.[cardId];
            if (!currentCard) return;
            dispatch({
              type: "PATCH_CARD",
              payload: {
                sectionId: sid,
                cardId,
                cardType: currentCard.type,
                patch,
              },
            });
          }}
          onAddCard={(sectionId, cardType, initialData) => {
            if (cardType === 'project') {
              // Open repository dialog for project cards
              setPendingCardSection(sectionId);
              setIsRepositoryDialogOpen(true);
            } else {
              // Regular card creation for non-project cards
              dispatch({ type: "ADD_CARD", payload: { sectionId, cardType, initialData } });
            }
          }}
          onRemoveCard={(sectionId, cardId) => {
            dispatch({ type: "REMOVE_CARD", payload: { sectionId, cardId } });
          }}
        />
      );
    }
  }

  const { handleDragStart, handleDragEnd } = createDragHandlers({
    portfolio,
    dispatch,
    savedCardsState,
  });

  // layout rendered via LayoutPreview component below

  // Show loading state when loading existing portfolio
  if (isEditing && portfolioLoading) {
    return (
      <div className="test-layout" data-mode={mode}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading portfolio...</p>
        </div>
      </div>
    );
  }

  // Show error state when failed to load portfolio
  if (isEditing && portfolioError) {
    return (
      <div className="test-layout" data-mode={mode}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Error loading portfolio: {portfolioError}</p>
          <button onClick={() => window.history.back()}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="test-layout" data-mode={mode}>
      <header className="test-header">
        <h1>Settings</h1>
        
        <PortfolioTitleInput
          value={portfolio.title}
          onChange={handleTitleChange}
        />

        <div className="save-button-section">
          <button
            className="save-button"
            disabled={!portfolio.title || portfolio.title.trim() === "" || isSaving}
            onClick={handleSavePortfolio}
          >
            {isSaving ? "Saving..." : "Save Portfolio"}
          </button>
        </div>

        <SlugInput
          value={slug}
          onChange={setSlug}
          currentSlug={currentSlug}
          onAvailabilityChange={handleSlugAvailabilityChange}
        />

        {/* Publication Settings - only show for existing portfolios */}
        {isEditing && (
          <>
            {/* Debug info - temporary */}
            <div style={{ padding: '0.5rem', background: '#f0f0f0', fontSize: '0.75rem', marginBottom: '1rem' }}>
              <strong>Debug Info:</strong><br />
              Portfolio ID: {portfolioId}<br />
              Slug: "{slug}"<br />
              Is Published: {isPublished ? 'Yes' : 'No'}<br />
              Slug Available: {isSlugAvailable ? 'Yes' : 'No'}<br />
              Checking Slug: {isCheckingSlug ? 'Yes' : 'No'}
            </div>
            
            <PublicationSettings
              isPublished={isPublished}
              onPublishedChange={setIsPublished}
              slug={slug}
              isSlugAvailable={isSlugAvailable}
              isCheckingSlug={isCheckingSlug}
              onPublish={handlePublishClick}
              isPublishing={isPublishing}
            />
          </>
        )}
        
        <div className="header-controls">
          <button
            className="mode-toggle"
            onClick={toggleMode}
            aria-pressed={mode === "edit"}
          >
            {mode === "view" ? "View" : "Edit"}
          </button>

          <select
            id="template-select"
            value={selectedTemplate}
            onChange={(e) => {
              const v = e.target.value as TemplateKey;
              setSelectedTemplate(v);
              dispatch({ type: "SWITCH_TEMPLATE", payload: { template: v } });
            }}
            aria-label="Select template"
          >
            {templateList.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main className="test-main">
        <EditorDndProvider
          template={portfolio.template}
          mode={mode}
          cardsById={allCardsById}
          sectionsById={portfolio.sections}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="main-content">
            <SavedSidebar
              mode={mode}
              template={portfolio.template}
              onImageUrlsReplaced={handleImageUrlsReplaced}
            />

            <div className="layout-preview">
              <LayoutPreview
                portfolio={portfolio}
                sectionsMap={sectionsMap}
                isEditable={mode === "edit"}
              />
            </div>
          </div>
        </EditorDndProvider>
      </main>

      {/* Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      {/* Repository Selection Dialog */}
      <RepositoryDialog
        isOpen={isRepositoryDialogOpen}
        onClose={handleRepositoryDialogClose}
        onSelectRepo={handleRepositorySelect}
      />
    </div>
  );
}
