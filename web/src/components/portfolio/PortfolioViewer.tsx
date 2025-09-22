import React from 'react';
import type { PortfolioState } from '../../state/Portfolio.types';
import type { AnyCard } from '../../state/Cards.types';
import type { SectionState } from '../../state/Sections.types';
import SectionCard from '../sections/SectionCard';
import LayoutPreview from './LayoutPreview';
import './PortfolioViewer.css';

import '../../templates/template1/template1.css';
import '../../templates/template2/template2.css';

interface PortfolioViewerProps {
  portfolio: PortfolioState;
  className?: string;
}

export function PortfolioViewer({ 
  portfolio, 
  className = ''
}: PortfolioViewerProps) {
  // Build runtime structures - exact same as PortfolioEditor
  const sectionsMap: Record<string, React.ReactNode> = {};
  const allCardsById: Record<string, AnyCard> = {};

  if (portfolio?.sections) {
    for (const section of Object.values(portfolio.sections)) {
      Object.assign(allCardsById, section.cardsById);
    }

    for (const [sid, section] of Object.entries(portfolio.sections)) {
      const s = section as SectionState;
      
      sectionsMap[sid] = (
        <SectionCard
          key={sid}
          mode="view" // Always in view mode
          id={sid}
          type={s.type}
          title={s.title}
          maxCards={s.maxCards}
          allowedTypes={s.allowedTypes}
          cardsById={s.cardsById}
          cardsOrder={s.cardsOrder}
          onPatch={() => {}} // No editing allowed
          onCardPatch={() => {}} // No editing allowed
          onAddCard={() => {}} // No editing allowed
          onRemoveCard={() => {}} // No editing allowed
        />
      );
    }
  }

  return (
    <div className={`portfolio-viewer ${className}`}>
      {/* Use exact same structure as PortfolioEditor */}
      <div className="test-layout" data-mode="view">
        <main className="test-main">
          <div className="main-content">
            <div className="layout-preview">
              <LayoutPreview
                portfolio={portfolio}
                sectionsMap={sectionsMap}
                isEditable={false} // Never editable
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}