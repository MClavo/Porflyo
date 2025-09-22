import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { SavedCard } from "../../state/SavedCards.types";
import { CardPreviewPopup } from "./CardPreviewPopup";
import "./SavedCard.css";

export type SavedCardProps = {
  savedCard: SavedCard;
  onRename: (savedCardId: string, name: string) => void;
  onRemove: (savedCardId: string) => void;
  mode: "view" | "edit";
  template?: string; // Add template prop
};

export function SavedCardComponent({ savedCard, onRename, onRemove, mode, template = "template1" }: SavedCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(savedCard.name);

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
  const style = {
    opacity: isDragging ? 0.5 : 1, // Just make it semi-transparent when dragging
  };

  const handleRename = () => {
    if (tempName.trim() && tempName !== savedCard.name) {
      onRename(savedCard.id, tempName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setTempName(savedCard.name);
      setIsEditing(false);
    }
  };

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
          {isEditing ? (
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyPress}
              className="saved-card-name-input"
              autoFocus
            />
          ) : (
            <h4 
              className="saved-card-name"
              onClick={() => mode === "edit" && setIsEditing(true)}
              title={mode === "edit" ? "Click to edit name" : savedCard.name}
            >
              {savedCard.name}
            </h4>
          )}
          
          {mode === "edit" && (
            <div className="saved-card-controls">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="saved-card-btn saved-card-edit-btn"
                title="Rename"
              >
                ✏️
              </button>
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
