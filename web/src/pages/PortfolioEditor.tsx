import React from "react";
import { useLocation } from "react-router-dom";
import { RepositoryDialog } from "../components/dialogs/RepositoryDialog";
import EditorCanvas from "../components/editor/EditorCanvas";
import { Notification } from "../components/notifications/Notification";
import SectionCard from "../components/sections/SectionCard";
import { ModernEditorHeader, ModernEditorSidebar } from "../components/portfolioEditor";
import { usePortfolioEditorState } from "../hooks/editor/usePortfolioEditorState";
import { useRepositoryFlow } from "../hooks/save/repository/useRepositoryFlow";
import type { CardType } from "../state/Cards.types";
import type { PortfolioState } from "../state/Portfolio.types";
import type { SectionState } from "../state/Sections.types";
import "../styles/pages/PortfolioEditor.css";

export default function PortfolioEditor({
  onPortfolioChange,
}: { onPortfolioChange?: (p: PortfolioState) => void } = {}) {
  const location = useLocation();
  const [notification, setNotification] = React.useState<{
    message: string;
    type: "success" | "error" | "info";
    isVisible: boolean;
  }>({ message: "", type: "success", isVisible: false });

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

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

  const repoFlow = useRepositoryFlow({
    dispatch: state.dispatch as unknown as import("react").Dispatch<unknown>,
    showNotification,
  });

  // Auto-close sidebar when switching to view mode
  React.useEffect(() => {
    if (state.ui.mode === 'view' && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [state.ui.mode, isSidebarOpen]);

  // Build runtime structures similar to previous implementation
  const sectionsMap: Record<string, React.ReactNode> = {};
  const allCardsById: Record<string, unknown> = {};

  if (state.data.portfolio?.sections) {
    for (const section of Object.values(state.data.portfolio.sections)) {
      Object.assign(allCardsById, section.cardsById);
    }

    for (const [sid, section] of Object.entries(state.data.portfolio.sections)) {
      const s = section as unknown as SectionState;

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
      {/* Sidebar */}
      <ModernEditorSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {/* Saved cards content - move this from the old layout */}
        <div className="saved-cards-placeholder">
          <p>Saved cards will go here</p>
        </div>
      </ModernEditorSidebar>

      <div className="portfolio-editor__container">
        {/* Modern Header - FIRST thing in container to be right below navbar */}
        <ModernEditorHeader
          portfolioTitle={state.data.portfolio.title}
          onTitleChange={state.actions.handleTitleChange}
          onSave={state.actions.handleSavePortfolio}
          isSaving={state.actions.isSaving}
          mode={state.ui.mode}
          onModeToggle={state.ui.toggleMode}
          selectedTemplate={state.ui.selectedTemplate}
          onTemplateSelect={(t) => {
            const templateKey = t as "template1" | "template2";
            state.ui.setSelectedTemplate(templateKey);
            state.dispatch({
              type: "SWITCH_TEMPLATE",
              payload: { template: templateKey },
            });
          }}
          slug={state.slug.slug}
          setSlug={state.slug.setSlug}
          currentSlug={state.data.currentSlug}
          isSlugAvailable={state.slug.isSlugAvailable}
          isCheckingSlug={state.slug.isCheckingSlug}
          onSlugAvailabilityChange={(available) => state.slug.handleSlugAvailabilityChange(available, false)}
          isPublished={state.publication.isPublished}
          setIsPublished={state.publication.setIsPublished}
          onPublish={state.publication.handlePublishClick}
          isPublishing={state.publication.isPublishing}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isEditMode={isEditMode}
        />

        {/* Main content area */}
        <main className={`portfolio-editor__main ${
          isSidebarOpen 
            ? 'portfolio-editor__main--with-sidebar' 
            : 'portfolio-editor__main--sidebar-collapsed'
        }`}>
          {/* Canvas */}
          <div className="portfolio-editor__canvas">
            <div className="portfolio-editor__canvas-container">
              <EditorCanvas
                portfolio={state.data.portfolio}
                sectionsMap={sectionsMap}
                allCardsById={allCardsById}
                mode={state.ui.mode}
                onDragStart={state.drag.handleDragStart}
                onDragEnd={state.drag.handleDragEnd}
                onImageUrlsReplaced={state.actions.handleImageUrlsReplaced}
              />
            </div>
          </div>
        </main>
      </div>

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
