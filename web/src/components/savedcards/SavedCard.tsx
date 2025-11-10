import { useDraggable } from "@dnd-kit/core";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { BiCalendar } from "react-icons/bi";
import { IoMdArrowRoundForward } from "react-icons/io";
import type { SavedCard } from "../../state/SavedCards.types";
import { CardPreviewPopup } from "./CardPreviewPopup";
import { ConfirmDialog } from "../dialogs";
import "./SavedCard.css";

export type SavedCardProps = {
  savedCard: SavedCard;
  onRemove: (savedCardId: string) => void | Promise<void>;
  mode: "view" | "edit";
  template?: string; // Add template prop
};

export function SavedCardComponent({ savedCard, onRemove, mode, template = "template1" }: SavedCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onRemove(savedCard.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to remove saved card:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  return (
    <>
      <CardPreviewPopup savedCard={savedCard} template={template}>
      <div
        ref={setNodeRef}
        style={style}
        className={`saved-card ${isDragging ? "dragging" : ""}`}
        {...attributes}
        {...(mode === "edit" ? listeners : {})}
      >
        <div className="saved-card-header">
          <h4 className="saved-card-name" title={savedCard.name}>
            {savedCard.name}
          </h4>
          
          {mode === "edit" && (
            <div className="saved-card-controls">
              <button
                type="button"
                onClick={handleDeleteClick}
                className="saved-card-btn saved-card-remove-btn"
                title="Remove"
              >
                <FaTrash />
              </button>
            </div>
          )}
        </div>

        <div className="saved-card-info">
          <span className="saved-card-section">
            <IoMdArrowRoundForward />
            {savedCard.originSectionType}
          </span>
          <span className="saved-card-date">
            <BiCalendar />
            {formatDate(savedCard.createdAt)}
          </span>
        </div>
      </div>
    </CardPreviewPopup>

    <ConfirmDialog
      isOpen={showDeleteDialog}
      title="Remove Saved Card"
      message={`Are you sure you want to remove "${savedCard.name}"? This action cannot be undone.`}
      confirmText="Remove"
      cancelText="Cancel"
      onConfirm={handleConfirmDelete}
      onCancel={handleCancelDelete}
      variant="danger"
      isLoading={isDeleting}
    />
  </>
  );
}
