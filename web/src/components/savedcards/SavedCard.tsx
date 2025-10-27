import { useDraggable } from "@dnd-kit/core";
import type { SavedCard } from "../../state/SavedCards.types";
import { CardPreviewPopup } from "./CardPreviewPopup";
import "./SavedCard.css";

export type SavedCardProps = {
  savedCard: SavedCard;
  onRemove: (savedCardId: string) => void | Promise<void>;
  mode: "view" | "edit";
  template?: string; // Add template prop
};

export function SavedCardComponent({ savedCard, onRemove, mode, template = "template1" }: SavedCardProps) {

  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
  } = useDraggable({
    id: `saved-${savedCard.id}`,
    data: {
      type: "saved-card",
      savedCard: savedCard,
    },
  });

  // Don't apply transform to keep the card in place - only used for DragOverlay
  const style = {};

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <CardPreviewPopup savedCard={savedCard} template={template}>
      <div
        ref={setNodeRef}
        style={style}
        className={`saved-card ${isDragging ? "dragging" : ""}`}
        {...attributes}
        {...(mode === "edit" ? listeners : {})}
      >
        <div className="saved-card-header">
          <h4 
            className="saved-card-name"
            title={savedCard.name}
          >
            {savedCard.name}
          </h4>
          
          {mode === "edit" && (
            <div className="saved-card-controls">
              <button
                type="button"
                onClick={() => onRemove(savedCard.id)}
                className="saved-card-btn saved-card-remove-btn"
                title="Remove"
              >
                🗑️
              </button>
            </div>
          )}
        </div>

        <div className="saved-card-info">
          <div className="saved-card-meta">
            <span className="saved-card-type-badge">
              {savedCard.card.type}
            </span>
            <span className="saved-card-section">
              From: {savedCard.originSectionType}
            </span>
          </div>
          <div className="saved-card-date">
            Saved: {formatDate(savedCard.createdAt)}
          </div>
        </div>

        {mode === "edit" && (
          <div className="saved-card-hint">
            💡 Hover for preview • Drag to use
          </div>
        )}
      </div>
    </CardPreviewPopup>
  );
}
