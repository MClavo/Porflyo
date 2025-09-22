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
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showPreview = useCallback((e: React.MouseEvent) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Add scroll offset to ensure proper positioning
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;
    
    // Calculate position to the right first
    let x = rect.right + 10 + scrollX;
    let y = rect.top + scrollY;
    
    // If popup would go off the right edge, position to the left instead
    if (x + 400 > viewportWidth + scrollX) { // 400 is approximate popup width
      x = rect.left - 410 + scrollX; // Position to the left with some margin
    }
    
    // Ensure popup doesn't go off the top or too far down
    y = Math.max(10 + scrollY, Math.min(y, viewportHeight + scrollY - 100)); // Keep some margin from bottom

    setPosition({ x, y });

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 500) as unknown as number; // 500ms delay before showing
  }, []);

  const hidePreview = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isVisible) {
      const rect = e.currentTarget.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      const scrollY = window.scrollY || window.pageYOffset;
      const scrollX = window.scrollX || window.pageXOffset;
      
      // Calculate position to the right first
      let x = rect.right + 10 + scrollX;
      let y = rect.top + scrollY;
      
      // If popup would go off the right edge, position to the left instead
      if (x + 400 > viewportWidth + scrollX) {
        x = rect.left - 410 + scrollX;
      }
      
      // Ensure popup doesn't go off the top or too far down
      y = Math.max(10 + scrollY, Math.min(y, viewportHeight + scrollY - 100));

      setPosition({ x, y });
    }
  }, [isVisible]);

  return (
    <>
      <div
        ref={containerRef}
        onMouseEnter={showPreview}
        onMouseLeave={hidePreview}
        onMouseMove={handleMouseMove}
        style={{ position: "relative" }}
      >
        {children}
      </div>

      {isVisible && createPortal(
        <div
          className="card-preview-popup"
          style={{
            position: "fixed",
            left: position.x,
            top: position.y,
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
