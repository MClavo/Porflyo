import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import type { SavedCard } from "../../state/SavedCards.types";
import type { AnyCard } from "../../state/Cards.types";
import { SavedCardComponent } from "./SavedCard";
import { SaveCardDialog } from "./SaveCardDialog";
import "./SavedCards.css";

export type SavedCardsProps = {
  savedCards: Record<string, SavedCard>;
  mode: "view" | "edit";
  onSave: (card: AnyCard, originSectionId: string, originSectionType: string, name: string) => void;
  onRename: (savedCardId: string, name: string) => void;
  onRemove: (savedCardId: string) => void;
  onUse: (savedCardId: string, targetSectionId: string) => void;
  template?: string; // Add template prop
};

export function SavedCards({ 
  savedCards, 
  mode, 
  onSave,
  onRename, 
  onRemove,
  template = "template1"
}: SavedCardsProps) {
  const [pendingCard, setPendingCard] = useState<{
    card: AnyCard;
    originSectionId: string;
    originSectionType: string;
  } | null>(null);


  const { setNodeRef, isOver } = useDroppable({
    id: "saved-cards-area",
    data: {
      type: "saved-cards-area",
      accepts: ["job", "project", "text"], // Explicitly specify what types we accept
      onCardDropped: (card: AnyCard, originSectionId: string, originSectionType: string) => {
        setPendingCard({ card, originSectionId, originSectionType });
      }
    },
  });


  const savedCardsList = Object.values(savedCards);

  const handleSaveCard = (name: string) => {
    if (pendingCard) {
      onSave(pendingCard.card, pendingCard.originSectionId, pendingCard.originSectionType, name);
      setPendingCard(null);
    }
  };

  const handleCancelSave = () => {
    setPendingCard(null);
  };

  return (
    <>
      <div className="saved-cards-container">
        {mode === "edit" && (
          <div className="saved-cards-hint">
            Drop cards here to save them
          </div>
        )}

        <div
          ref={setNodeRef}
          className={`saved-cards-area ${isOver ? "drop-over" : ""} ${
            savedCardsList.length === 0 ? "empty" : ""
          }`}
        >
          {savedCardsList.length === 0 ? (
            <div className="saved-cards-empty">
              <div className="saved-cards-empty-icon">📦</div>
              <div className="saved-cards-empty-text">
                No saved cards yet
              </div>
              {mode === "edit" && (
                <div className="saved-cards-empty-hint">
                  Drag a card here to save it
                </div>
              )}
            </div>
          ) : (
            <div className="saved-cards-list">
              {savedCardsList
                .sort((a, b) => b.createdAt - a.createdAt) // Most recent first
                .map((savedCard) => (
                  <SavedCardComponent
                    key={savedCard.id}
                    savedCard={savedCard}
                    onRename={onRename}
                    onRemove={onRemove}
                    mode={mode}
                    template={template}
                  />
                ))}
            </div>
          )}
        </div>

        {mode === "edit" && savedCardsList.length > 0 && (
          <div className="saved-cards-actions">
            <button
              type="button"
              onClick={() => {
                if (confirm("Are you sure you want to clear all saved cards?")) {
                  savedCardsList.forEach((savedCard) => {
                    onRemove(savedCard.id);
                  });
                }
              }}
              className="saved-cards-clear-btn"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      <SaveCardDialog
        isOpen={!!pendingCard}
        card={pendingCard?.card || null}
        originSectionId={pendingCard?.originSectionId || ""}
        originSectionType={pendingCard?.originSectionType || ""}
        onSave={handleSaveCard}
        onCancel={handleCancelSave}
      />
    </>
  );
}
