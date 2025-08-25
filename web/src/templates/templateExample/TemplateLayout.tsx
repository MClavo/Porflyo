import React from 'react';
import type { TemplateLayoutComponentProps } from '../types';
import type { PortfolioItemsData } from '../../components/portfolio/layout/LayoutTypes';
import TemplateSection from './TemplateSection.tsx';
import './templateExample.css';

const TemplateLayout: React.FC<TemplateLayoutComponentProps> = ({ sections, itemMap, itemDataMap, themeClass }) => {
  return (
    <div className={`tpl-example-root ${themeClass ?? ''}`.trim()}>
      <header className="tpl-example-header">
        <div className="tpl-example-brand">Mi Portfolio</div>
        <nav className="tpl-example-nav">
          {sections.map(s => (
            <a key={s.id} href={`#${s.id}`}>{s.title}</a>
          ))}
        </nav>
      </header>

      <main className="tpl-example-main">
        {sections.map((section) => (
          <div key={section.id} id={section.id} className={`tpl-section section-${section.id} layout-${section.layoutType}`}>
            <TemplateSection section={section} items={itemMap[section.id] || []} itemsData={itemDataMap as PortfolioItemsData} />
          </div>
        ))}
      </main>
    </div>
  );
};

export default TemplateLayout;
