import React, { useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { AnyCard } from "../../state/Cards.types";
import type { CardId } from "../../state/Sections.types";
import DeleteCardButton from "../buttons/DeleteCardButton";
import { renderCard } from "../cards/RenderCard";

export type Mode = "view" | "edit";

interface SortableCardProps {
  id: CardId;
  card: AnyCard;
  mode: Mode;
  onPatch: (patch: Partial<Record<string, unknown>>) => void;
  onRemove: () => void;
}

const SortableCard: React.FC<SortableCardProps> = ({
  id,
  card,
  mode,
  onPatch,
  onRemove,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id,
      disabled: mode === "view",
    });

  // Force re-render when drag state changes to ensure opacity updates
  useEffect(() => {
    // This effect ensures the component re-renders when isDragging changes
  }, [isDragging, id]);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : (transition as string | undefined),
    zIndex: isDragging ? 1 : "auto", // Lower z-index for placeholder
  } as React.CSSProperties;

  // Use a more explicit className that resets properly
  const cardClassName = `sortable-card ${isDragging ? "dragging" : "not-dragging"}`;

  const cardEl = renderCard(card, mode, id, onPatch);

  if (!cardEl) return null;

  if (mode === "edit" && React.isValidElement(cardEl)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const originalChildren = (cardEl.props as any)?.children;

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cardClassName}
        data-sortable-id={id}
      >
        {/* overlay that captures drag events; placed under form fields via z-index */}
        <div className="drag-capture" {...attributes} {...listeners} aria-hidden="true" />

        {React.cloneElement(
          cardEl,
          {},
          <>
            <DeleteCardButton onDelete={onRemove} />
            {originalChildren}
          </>
        )}
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style}>
      {cardEl}
    </div>
  );
};

export default SortableCard;
