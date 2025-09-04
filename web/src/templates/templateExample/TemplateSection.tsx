import React from 'react';
import type { PortfolioItemsData } from '../../components/portfolio/layout/LayoutTypes';
import type { PortfolioSection } from '../../types/sectionDto';
import EditableSectionTitle from '../../components/portfolio/section/EditableSectionTitle';
import TemplateItem from './TemplateItem';

type Props = {
  section: PortfolioSection;
  items: string[];
  itemsData: PortfolioItemsData;
  onSectionTitleUpdate?: (sectionId: string, newTitle: string) => void;
  renderItems?: (section: PortfolioSection, items: string[], itemsData: PortfolioItemsData) => React.ReactNode;
};

const TemplateSection: React.FC<Props> = ({ section, items, itemsData, onSectionTitleUpdate, renderItems }) => {
  return (
    <section className={`tpl-section-inner section-${section.id}`} aria-label={section.title}>
      <EditableSectionTitle
        title={section.title}
        sectionId={section.id}
        onTitleUpdate={onSectionTitleUpdate}
        className="tpl-section-title"
      />
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
