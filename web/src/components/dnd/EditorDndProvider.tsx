import React from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { renderCard } from "../cards/RenderCard";
import DragHandle from "./DragHandle";
import type { AnyCard } from "../../state/Cards.types";
import type { CardId } from "../../state/Sections.types";
import type { TemplateKey } from "../../templates/Template.types";
import type { Mode } from "../cards/subcomponents/Fields.types";
import { useSavedCards } from "../../state/SavedCards.hooks";

// Import all template styles
import.meta.glob('../../templates/**/*.css');

interface EditorDndProviderProps {
  children: React.ReactNode;
  template: TemplateKey;
  mode: Mode;
  cardsById: Record<CardId, AnyCard>;
  sectionsById?: Record<string, { cardsOrder: CardId[] }>; // To determine card section
  onDragStart?: (event: DragStartEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
}

const EditorDndProvider: React.FC<EditorDndProviderProps> = ({
  children,
  template,
  mode,
  cardsById,
  sectionsById,
  onDragStart,
  onDragEnd,
  
}) => {
  const { state: savedCardsState } = useSavedCards();
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);

  // Set up sensors for drag and drop - same configuration as SectionCard
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevent accidental drags
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
    document.body.classList.add('dragging');
    onDragStart?.(event);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    document.body.classList.remove('dragging');
    onDragEnd?.(event);
  };

  // Get the active card for overlay - could be from regular cards or saved cards
  const getActiveCard = (): AnyCard | null => {
    if (!activeId) return null;
    
    const activeIdStr = activeId.toString();
    
    // Check if it's a saved card
    if (activeIdStr.startsWith('saved-')) {
      const savedCardId = activeIdStr.replace('saved-', '');
      const savedCard = savedCardsState.savedCards[savedCardId];
      return savedCard?.card || null;
    }
    
    // Regular card
    return cardsById[activeId as CardId] || null;
  };

  const activeCard = getActiveCard();

  // Find which section the active card belongs to for proper styling context
  const getCardSectionId = (cardId: CardId): string | null => {
    if (sectionsById) {
      for (const [sectionId, section] of Object.entries(sectionsById)) {
        if (section.cardsOrder.includes(cardId)) {
          return sectionId;
        }
      }
    }
    
    // Fallback: determine by card type
    if (activeCard) {
      switch (activeCard.type) {
        case 'project':
          return 'projects';
        case 'job':
          return 'experiences';
        case 'text':
          return 'text';
        default:
          return 'projects';
      }
    }
    return null;
  };

  const sectionId = activeId ? getCardSectionId(activeId as CardId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      
      {/* Render DragOverlay in a portal to avoid parent overflow constraints */}
      {createPortal(
        <DragOverlay dropAnimation={null}>
          {activeCard && sectionId ? (
            <div 
              className={`drag-overlay tpl-${template} sortable-card`} 
              data-mode={mode}
              id={sectionId}
              style={{ 
                pointerEvents: 'none',
                minWidth: '350px',
                maxWidth: '600px',
                width: 'max-content',
                backdropFilter: 'blur(4px)',
                // Force ATS width when using ATS template
                ...(template === 'ats' ? {
                  width: '1000px',
                  maxWidth: '1000px',
                  minWidth: '1000px'
                } : {})
              }}
            >
              {/* Show drag handle in edit mode */}
              {mode === "edit" && <DragHandle />}
              {renderCard(activeCard, mode, activeId as CardId, () => {})}
            </div>
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};

export default EditorDndProvider;
