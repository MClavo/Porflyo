import React from 'react';
import type { TemplateLayoutComponentProps } from '../types';
import EditableSectionTitle from '../../components/portfolio/section/EditableSectionTitle';
import './twoColumnWhite.css';

const TwoColumnWhiteLayout: React.FC<TemplateLayoutComponentProps> = ({ sections, onSectionTitleUpdate }) => {
  // Expect first two sections to be the left and right top columns; third is bottom full-width
  const left = sections[0];
  const right = sections[1];
  const bottom = sections[2];

  // This template must provide placeholders for the portfolio to inject
  // content. Placeholders are simple elements with id === section.id. The
  // editor will portal the editable section content into those nodes.
  return (
    <div className="tpl-two-column-white">
      <div className="two-top">
        <div className="col tpl-section" id={left?.id}>
          <EditableSectionTitle
            title={left?.title || ''}
            sectionId={left?.id || ''}
            onTitleUpdate={onSectionTitleUpdate}
            className="section-title"
          />
          {/* placeholder: PortfolioLayout will portal content here */}
        </div>
        <div className="col tpl-section" id={right?.id}>
          <EditableSectionTitle
            title={right?.title || ''}
            sectionId={right?.id || ''}
            onTitleUpdate={onSectionTitleUpdate}
            className="section-title"
          />
          {/* placeholder */}
        </div>
      </div>

      <div className="bottom tpl-section" id={bottom?.id}>
        <EditableSectionTitle
          title={bottom?.title || ''}
          sectionId={bottom?.id || ''}
          onTitleUpdate={onSectionTitleUpdate}
          className="section-title"
        />
        {/* placeholder */}
      </div>
    </div>
  );
};

export default TwoColumnWhiteLayout;
