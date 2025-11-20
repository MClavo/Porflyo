import type { DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import type { PortfolioState } from "../../state/Portfolio.types";
import type { Action } from "../../state/Portfolio.actions";
import type { SavedCardsState } from "../../state/SavedCards.types";
import type { SectionState } from "../../state/Sections.types";
import type { AnyCard } from "../../state/Cards.types";

export function createDragHandlers(args: {
  portfolio: PortfolioState;
  dispatch: React.Dispatch<Action>;
  savedCardsState: SavedCardsState;
}) {
  const { portfolio, dispatch, savedCardsState } = args;

  const handleDragStart = () => {
    // no op for now
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    // clear previews if nothing relevant
    if (!over || !active) {
      // clear all previews
      for (const sectionId of Object.keys(portfolio.sections || {})) {
        dispatch({ type: "SET_DRAG_PREVIEW", payload: { sectionId, index: null, previewCard: null } });
      }
      return;
    }

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    const savedCardId = activeIdStr.startsWith("saved-") ? activeIdStr.replace("saved-", "") : null;
    const savedCard = savedCardId ? savedCardsState.savedCards?.[savedCardId] : null;

    // Only handle previews for saved cards being dragged in
    if (!activeIdStr.startsWith("saved-")) {
      // if internal drag, clear previews
      for (const sectionId of Object.keys(portfolio.sections || {})) {
        dispatch({ type: "SET_DRAG_PREVIEW", payload: { sectionId, index: null, previewCard: null } });
      }
      return;
    }

    // Find the section that contains the overId (either card id or section id)
    if (!portfolio?.sections) return;

    for (const [sectionId, section] of Object.entries(portfolio.sections)) {
      const s = section as SectionState;

      // Only show preview if this section accepts the saved card type
      const acceptsSaved = savedCard ? s.allowedTypes.includes(savedCard.card.type) : false;
      if (!acceptsSaved) {
        // clear preview for this section
        dispatch({ type: "SET_DRAG_PREVIEW", payload: { sectionId, index: null, previewCard: null } });
        continue;
      }

      if (overIdStr === sectionId) {
        // over the empty area of the section -> place at end
        dispatch({ type: "SET_DRAG_PREVIEW", payload: { sectionId, index: s.cardsOrder.length, previewCard: savedCard?.card ?? null } });
        continue;
      }

      const cardIndex = s.cardsOrder.indexOf(overIdStr);
      if (cardIndex !== -1) {
        // Show insertion before the card we are over
        dispatch({ type: "SET_DRAG_PREVIEW", payload: { sectionId, index: cardIndex, previewCard: savedCard?.card ?? null } });
      } else {
        // clear preview for this section
        dispatch({ type: "SET_DRAG_PREVIEW", payload: { sectionId, index: null, previewCard: null } });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Clear any transient previews for all sections
      for (const sectionId of Object.keys(portfolio.sections || {})) {
        dispatch({ type: "SET_DRAG_PREVIEW", payload: { sectionId, index: null, previewCard: null } });
      }

    if (!over || active.id === over.id) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    const isDropAreaData = (v: unknown): v is { onCardDropped?: (card: AnyCard, originSectionId: string, originSectionTitle: string) => void } => {
      if (!v || typeof v !== "object") return false;
      const obj = v as Record<string, unknown>;
      const od = obj["onCardDropped"];
      return od === undefined || typeof od === "function";
    };

    const tryHandleDropToSavedArea = (): boolean => {
      if (overIdStr !== "saved-cards-area" || activeIdStr.startsWith("saved-")) return false;
      if (!portfolio?.sections) return false;

      for (const [sectionId, section] of Object.entries(portfolio.sections)) {
        const card = section.cardsById[activeIdStr];
        if (!card) continue;
        const dropData = over.data?.current as unknown;
        if (isDropAreaData(dropData) && typeof dropData?.onCardDropped === "function") {
          dropData.onCardDropped(card, sectionId, section.title);
        }
        return true;
      }

      return false;
    };

    const tryHandleSavedCardToSection = (): boolean => {
      if (!activeIdStr.startsWith("saved-")) return false;

      const savedCardId = activeIdStr.replace("saved-", "");
      const savedCard = savedCardsState.savedCards?.[savedCardId];
      if (!savedCard || !portfolio?.sections) return false;

      for (const [sectionId, section] of Object.entries(portfolio.sections)) {
        // section is typed as SectionState
        const s = section as SectionState;
        if (!s.cardsOrder.includes(overIdStr) && sectionId !== overIdStr) continue;

        if (!s.allowedTypes.includes(savedCard.card.type)) return true;

        // Create new card pre-populated with saved card data
        const initialData = JSON.parse(JSON.stringify(savedCard.card.data));
        // If there is a preview index for this section, insert at that position
        const insertIndex = (s as SectionState).previewIndex ?? null;
        if (typeof insertIndex === 'number') {
          dispatch({ type: "ADD_CARD", payload: { sectionId, cardType: savedCard.card.type, initialData, index: insertIndex } });
        } else {
          dispatch({ type: "ADD_CARD", payload: { sectionId, cardType: savedCard.card.type, initialData } });
        }

        return true;
      }

      return false;
    };

    const tryHandleReorderWithinSection = (): boolean => {
      if (!portfolio?.sections) return false;

      for (const [sectionId, section] of Object.entries(portfolio.sections)) {
        if (!section.cardsOrder.includes(activeIdStr)) continue;

        const oldIndex = section.cardsOrder.indexOf(activeIdStr);
        const newIndex = section.cardsOrder.indexOf(overIdStr);
        if (oldIndex !== -1 && newIndex !== -1) {
          dispatch({ type: "MOVE_CARD", payload: { sectionId, from: oldIndex, to: newIndex } });
        }
        return true;
      }

      return false;
    };

    if (tryHandleDropToSavedArea()) return;
    if (tryHandleSavedCardToSection()) return;
    tryHandleReorderWithinSection();
  };

  return { handleDragStart, handleDragOver, handleDragEnd };
}
