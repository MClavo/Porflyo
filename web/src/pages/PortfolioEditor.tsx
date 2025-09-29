import React from "react";
import { RepositoryDialog } from "../components/dialogs/RepositoryDialog";
import Controls from "../components/editor/Controls";
import EditorCanvas from "../components/editor/EditorCanvas";
import PublicationPanel from "../components/editor/PublicationPanel";
import SlugRow from "../components/editor/SlugRow";
import TitleAndSave from "../components/editor/TitleAndSave";
import { Notification } from "../components/notifications/Notification";
import SectionCard from "../components/sections/SectionCard";
import { usePortfolioEditorState } from "../hooks/editor/usePortfolioEditorState";
import { useRepositoryFlow } from "../hooks/save/repository/useRepositoryFlow";
import type { CardType } from "../state/Cards.types";
import type { PortfolioState } from "../state/Portfolio.types";
import type { SectionState } from "../state/Sections.types";
import "../styles/EditorTest.css";

export default function PortfolioEditor({
  onPortfolioChange,
}: { onPortfolioChange?: (p: PortfolioState) => void } = {}) {
  const [notification, setNotification] = React.useState<{
    message: string;
    type: "success" | "error" | "info";
    isVisible: boolean;
  }>({ message: "", type: "success", isVisible: false });

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
      <div className="test-layout" data-mode={state.ui.mode}>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p>Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (state.data.portfolioError) {
    return (
      <div className="test-layout" data-mode={state.ui.mode}>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p>Error loading portfolio: {state.data.portfolioError}</p>
          <button onClick={() => window.history.back()}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
  <div className="test-layout" data-mode={state.ui.mode}>
      <header className="test-header">
        <h1>Settings</h1>

        <TitleAndSave
          portfolioTitle={state.data.portfolio.title}
          onTitleChange={state.actions.handleTitleChange}
          onSave={state.actions.handleSavePortfolio}
          isSaving={state.actions.isSaving}
        />

        <SlugRow
          slug={state.slug.slug}
          setSlug={state.slug.setSlug}
          currentSlug={state.data.currentSlug}
          onAvailabilityChange={state.slug.handleSlugAvailabilityChange}
        />

  {Boolean(state.data.portfolioError === null) && (
          <>
            <PublicationPanel
              isPublished={state.publication.isPublished}
              setIsPublished={state.publication.setIsPublished}
              slug={state.slug.slug}
              isSlugAvailable={state.slug.isSlugAvailable}
              isCheckingSlug={state.slug.isCheckingSlug}
              onPublish={state.publication.handlePublishClick}
              isPublishing={state.publication.isPublishing}
            />
          </>
        )}

        <Controls
          mode={state.ui.mode}
          toggleMode={state.ui.toggleMode}
          selectedTemplate={state.ui.selectedTemplate}
          onSelectTemplate={(t) => {
            state.ui.setSelectedTemplate(t);
            state.dispatch({
              type: "SWITCH_TEMPLATE",
              payload: { template: t },
            });
          }}
        />
      </header>

      <EditorCanvas
        portfolio={state.data.portfolio}
        sectionsMap={sectionsMap}
        allCardsById={allCardsById}
        mode={state.ui.mode}
        onDragStart={state.drag.handleDragStart}
        onDragEnd={state.drag.handleDragEnd}
        onImageUrlsReplaced={state.actions.handleImageUrlsReplaced}
      />

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
