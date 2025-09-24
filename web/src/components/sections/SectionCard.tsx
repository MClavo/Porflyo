
import React from "react";
import { useDroppable } from "@dnd-kit/core";

import {
  SortableContext,
} from "@dnd-kit/sortable";

// useSortable and CSS were moved to the dedicated SortableCard component
import type { AnyCard, CardPatchByType, CardType } from "../../state/Cards.types";

import type {
  CardId,
  SectionId,
  SectionState,
  SectionType,
} from "../../state/Sections.types";

import AddCardButton, { type CardTypeOption } from "../buttons/AddCardButton";
import { renderCard } from "../cards/RenderCard";
import { Title, type Mode } from "../cards/subcomponents";
import SortableCard from "../dnd/SortableCard";
import "./SectionCard.css";

// SortableCard moved to ../dnd/SortableCard

interface SectionCardProps {
  mode?: Mode;
  id: SectionId;
  type: SectionType;
  title: string;
  /*  columns: number;
  rows: number; */
  maxCards?: number; // Computed as rows * columns
  allowedTypes: CardType[];
  cardsById: Record<CardId, AnyCard>;
  cardsOrder: CardId[];
  onPatch?: (patch: Partial<SectionState>) => void;
  onCardPatch?: (
    cardId: CardId,
    patch: Partial<Record<string, unknown>>
  ) => void;
  onAddCard?: (sectionId: SectionId, cardType: CardType, initialData?: CardPatchByType[CardType]) => void;
  onRemoveCard?: (sectionId: SectionId, cardId: CardId) => void;
/*   onMoveCard?: (sectionId: SectionId, from: number, to: number) => void;
  onDragStart?: (event: DragStartEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void; */
}

const SectionCard: React.FC<SectionCardProps> = ({
  mode = "view",
  id,
  type,
  title,
  maxCards,
  allowedTypes = [],
  cardsById = {} as Record<CardId, AnyCard>,
  cardsOrder = [] as CardId[],
  onPatch,
  onCardPatch,
  onAddCard,
  onRemoveCard,
}) => {
  const sectionType = "section-" + type;

  // make the section container droppable so saved cards can be dropped even when empty
  const { setNodeRef: setSectionNodeRef, isOver: isOverSection } = useDroppable({
    id,
    data: {
      type: "section",
      accepts: allowedTypes,
    },
  });

  function renderCards() {
    return cardsOrder.map((cardId) => {
      const card = cardsById[cardId];
      if (!card) return null;

      return (
        <SortableCard
          key={cardId}
          id={cardId}
          card={card}
          mode={mode}
          onPatch={(patch) => onCardPatch?.(cardId, patch)}
          onRemove={() => onRemoveCard?.(id, cardId)}
        />
      );
    });
  }

  if (mode === "view") {
    // In view mode, render without DnD context
    return (
      <>
        <Title
          mode={mode}
          value={title}
          required
          className={`section-title ${sectionType}`}
          maxLength={60}
          onChange={(v) => onPatch?.({ title: v })}
        />

  <div ref={setSectionNodeRef} className={`section-cards ${sectionType} ${isOverSection ? "drop-over" : ""}`}>
          {cardsOrder.map((cardId) => {
            const card = cardsById[cardId];
            if (!card) return null;

            const cardEl = renderCard(card, mode, cardId, (patch) =>
              onCardPatch?.(cardId, patch)
            );

            return <React.Fragment key={cardId}>{cardEl}</React.Fragment>;
          })}
        </div>
      </>
    );
  }

  return (
    <>
      <Title
        mode={mode}
        value={title}
        required
        className={`section-title ${sectionType}`}
        maxLength={60}
        onChange={(v) => onPatch?.({ title: v })}
      />

      {/* add card button placed under the title and above the cards */}
      {mode === "edit" &&
        (typeof maxCards === "undefined" ||
          cardsOrder.length < (maxCards ?? 0)) && (
          <div className="section-add-card">
            <AddCardButton
              allowedTypes={allowedTypes as CardTypeOption[]}
              onAdd={(t) => onAddCard?.(id, t as CardType)}
            />
          </div>
        )}

      {/* cards list with DnD context */}
      <SortableContext items={cardsOrder}>
        <div ref={setSectionNodeRef} className={`section-cards ${sectionType} ${isOverSection ? "drop-over" : ""}`}>{renderCards()}</div>
      </SortableContext>
    </>
  );
};

export default SectionCard;
