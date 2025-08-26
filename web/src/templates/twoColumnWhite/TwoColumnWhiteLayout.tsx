import React from 'react';
import type { TemplateLayoutComponentProps } from '../types';
import './twoColumnWhite.css';

const TwoColumnWhiteLayout: React.FC<TemplateLayoutComponentProps> = ({ sections }) => {
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
          <div className="section-title">{left?.title}</div>
          {/* placeholder: PortfolioLayout will portal content here */}
        </div>
        <div className="col tpl-section" id={right?.id}>
          <div className="section-title">{right?.title}</div>
          {/* placeholder */}
        </div>
      </div>

      <div className="bottom tpl-section" id={bottom?.id}>
        <div className="section-title">{bottom?.title}</div>
        {/* placeholder */}
      </div>
    </div>
  );
};

export default TwoColumnWhiteLayout;
