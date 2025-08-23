import React from 'react';
import type { SectionConfig } from '../types/itemDto';
import { SectionDefinitions } from './SectionDefinitions';

interface SectionHeaderProps {
  section: SectionConfig;
}

// Component that displays section information with icon and type
export const SectionHeader: React.FC<SectionHeaderProps> = ({ section }) => {
  const description = SectionDefinitions.getSectionDescription(section.sectionType);

  return (
    <div className="section-header">
      <div className="section-header-main">
        <span className="section-icon" title={description}>
        </span>
        <h3 className="section-title">
          {section.title}
        </h3>
      </div>
    </div>
  );
};
