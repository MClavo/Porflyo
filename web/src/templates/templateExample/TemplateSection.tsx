import React from 'react';
import type { PortfolioItemsData } from '../../components/portfolio/layout/LayoutTypes';
import type { PortfolioSection } from '../../types/sectionDto';
import TemplateItem from './TemplateItem';

type Props = {
  section: PortfolioSection;
  items: string[];
  itemsData: PortfolioItemsData;
  renderItems?: (section: PortfolioSection, items: string[], itemsData: PortfolioItemsData) => React.ReactNode;
};

const TemplateSection: React.FC<Props> = ({ section, items, itemsData, renderItems }) => {
  return (
    <section className={`tpl-section-inner section-${section.id}`} aria-label={section.title}>
      <h2 className="tpl-section-title">{section.title}</h2>
      {renderItems ? (
        // let the editor inject the full items container (so it can attach
        // droppable behavior and render add-buttons in the correct place)
        renderItems(section, items, itemsData)
      ) : (
        <div className="tpl-section-items">
          {items.map(id => (
            <TemplateItem key={id} id={id} item={itemsData[id]} section={section} />
          ))}
        </div>
      )}
    </section>
  );
};

export default TemplateSection;
