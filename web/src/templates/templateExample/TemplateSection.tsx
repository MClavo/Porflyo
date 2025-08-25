import React from 'react';
import type { PortfolioItemsData } from '../../components/portfolio/layout/LayoutTypes';
import type { PortfolioSection } from '../../types/sectionDto';
import TemplateItem from './TemplateItem';

type Props = {
  section: PortfolioSection;
  items: string[];
  itemsData: PortfolioItemsData;
};

const TemplateSection: React.FC<Props> = ({ section, items, itemsData }) => {
  return (
    <section className={`tpl-section-inner section-${section.id} layout-${section.layoutType}`} aria-label={section.title}>
      <h2 className="tpl-section-title">{section.title}</h2>
      <div className="tpl-section-items">
        {items.map(id => (
          <TemplateItem key={id} id={id} item={itemsData[id]} section={section} />
        ))}
      </div>
    </section>
  );
};

export default TemplateSection;
