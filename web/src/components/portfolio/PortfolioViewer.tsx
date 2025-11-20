import React from 'react';
import type { PortfolioState } from '../../state/Portfolio.types';
import type { AnyCard } from '../../state/Cards.types';
import type { SectionState } from '../../state/Sections.types';
import SectionCard from '../sections/SectionCard';
import { AboutSection } from '../sections/AboutSection';
import type { AboutSectionData } from '../sections/AboutSection.types';
import LayoutPreview from './LayoutPreview';
import './PortfolioViewer.css';

interface PortfolioViewerProps {
  portfolio: PortfolioState;
}

export function PortfolioViewer({ 
  portfolio
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
      
      // Special handling for 'about' section - render AboutSection component instead of SectionCard
      if (s.type === 'about') {
        const aboutData = (s.parsedContent as AboutSectionData) || {
          name: '',
          email: '',
          description: '',
          profileImage: null,
          socials: {},
        };

        sectionsMap[sid] = (
          <AboutSection
            key={sid}
            mode="view" // Always in view mode
            data={aboutData}
            onPatch={() => {}} // No editing allowed
          />
        );
        continue; // Skip regular SectionCard rendering
      }

      // Skip sections that have no cards (same logic as PortfolioEditor in view mode)
      if (!s.cardsOrder || s.cardsOrder.length === 0) {
        continue;
      }
      
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
    <LayoutPreview
      portfolio={portfolio}
      sectionsMap={sectionsMap}
      isEditable={false} // Never editable
    />
  );
}