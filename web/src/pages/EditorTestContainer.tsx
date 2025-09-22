import React, { useEffect, useReducer, useState } from "react";
import type { Mode } from "../components/cards/subcomponents/Fields.types";
import "../styles/EditorTest.css";
import EditorDndProvider from "../components/dnd/EditorDndProvider";
import { useSavedCards } from "../state/SavedCards.hooks";
import { portfolioReducer } from "../state/Portfolio.reducer";
import type { PortfolioState } from "../state/Portfolio.types";
import { createDragHandlers } from "../components/editor/dragHandlers";
import { demoInitialPortfolio } from "./editor/demoData";
import SavedSidebar from "../components/editor/SavedSidebar";
import LayoutPreview from "../components/portfolio/LayoutPreview";
import { templateList } from "../templates/Template.types";
import type { TemplateKey } from "../templates/Template.types";
import type { AnyCard } from "../state/Cards.types";
import type { SectionState } from "../state/Sections.types";
import SectionCard from "../components/sections/SectionCard";

// Keep exact demo data initialization used previously
const initialPortfolio: PortfolioState = {
  template: demoInitialPortfolio.template,
  title: demoInitialPortfolio.title,
  sections: demoInitialPortfolio.sections,
};

export default function EditorContainer({ 
  onPortfolioChange,
  showSidebarToggle,
  onSidebarToggle,
  sidebarOpen
}: { 
  onPortfolioChange?: (portfolio: PortfolioState) => void;
  showSidebarToggle?: boolean;
  onSidebarToggle?: () => void;
  sidebarOpen?: boolean;
} = {}) {
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

  const { state: savedCardsState, dispatch: savedCardsDispatch } =
    useSavedCards();

  useEffect(() => {
    dispatch({ type: "LOAD_PORTFOLIO", payload: initialPortfolio });
  }, []);

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
            dispatch({ type: "ADD_CARD", payload: { sectionId, cardType, initialData } });
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

  return (
    <div className="test-layout" data-mode={mode}>
      <header className="test-header">
        <h1>Settings</h1>
        <div className="header-controls">
          {showSidebarToggle && (
            <button
              className="sidebar-toggle"
              onClick={onSidebarToggle}
              aria-pressed={sidebarOpen}
              aria-label={sidebarOpen ? "Ocultar estado" : "Mostrar estado"}
            >
              {sidebarOpen ? "Hide" : "Show"}
            </button>
          )}
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
              savedCardsState={savedCardsState}
              savedCardsDispatch={savedCardsDispatch}
              mode={mode}
              template={portfolio.template}
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
    </div>
  );
}
