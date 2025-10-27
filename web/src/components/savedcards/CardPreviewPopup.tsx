import React, { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { renderCard } from "../cards/RenderCard";
import type { SavedCard } from "../../state/SavedCards.types";
import "./CardPreviewPopup.css";

import.meta.glob('../../templates/**/*.css');

export type CardPreviewPopupProps = {
  savedCard: SavedCard;
  children: React.ReactNode;
  template?: string; // Add template prop to receive current template
};

export function CardPreviewPopup({ savedCard, children, template = "template1" }: CardPreviewPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mostrar el preview inmediatamente al entrar el ratón.
  const showPreview = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hidePreview = useCallback(() => {
    setIsVisible(false);
  }, []);


  return (
    <>
      <div
        ref={containerRef}
        onMouseEnter={showPreview}
        onMouseLeave={hidePreview}
        style={{ position: "relative" }}
      >
        {children}
      </div>

      {isVisible && createPortal(
        <div
          className="card-preview-popup"
          style={{
            position: "fixed",
            left: 320, // 320px from the left
            top: '50%', // vertically centered
            transform: 'translateY(-50%)',
            zIndex: 10001, // Higher than DragOverlay (10000)
          }}
        >
          <div className="card-preview-popup-header">
            <span className="card-preview-popup-title">{savedCard.name}</span>
            <span className="card-preview-popup-meta">
              {savedCard.card.type} • {savedCard.originSectionType}
            </span>
          </div>
          <div className={`card-preview-popup-content`} data-mode="view">
            <div id={savedCard.originSectionId || 'preview'} className={`${template}`}>
              {renderCard(
                savedCard.card,
                "view",
                savedCard.id,
                () => {}
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
