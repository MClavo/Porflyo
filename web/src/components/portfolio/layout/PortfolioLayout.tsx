/**
 * PortfolioLayout
 *
 * Presentational component responsible for rendering portfolio sections and
 * their items. This component is layout-only and must not include DnD logic.
 *
 * Responsibilities:
 * - Render sections in order supplied by `sections`.
 * - For each section, render its items using `items` (array of item IDs) and
 *   `itemsData` (lookup of item data).
 * - Expose hooks for templates to customize rendering via `className`,
 *   `containerStyle`, and `renderSection`.
 *
 * The editor/DnD layer should wrap this component (or its child elements)
 * to add drag-and-drop behaviour. Keeping the layout and DnD separate allows
 * templates to change the structure (grid/column/row/slot) without touching
 * the editor logic.
 */
import type { PortfolioItems, PortfolioItemsData } from './LayoutTypes';
import type { PortfolioItem } from '../../../types/itemDto';
import { PortfolioZone } from '../section/PortfolioZone';
import { DEFAULT_SECTIONS as PORTFOLIO_SECTIONS } from '../../../types/sectionDto';
import './PortfolioLayout.css';

type Props = {
  sections?: typeof PORTFOLIO_SECTIONS;
  itemMap: PortfolioItems;
  itemDataMap: PortfolioItemsData;
  onItemUpdate?: (id: string | number, updatedItem: Partial<PortfolioItem>) => void;
  className?: string;
  containerStyle?: React.CSSProperties;
  renderSection?: (
    section: typeof PORTFOLIO_SECTIONS[number],
    content: React.ReactNode
  ) => React.ReactNode;
  onAddItem?: (sectionId: string) => void;
  onRemove?: (id: string | number) => void;
};

export function PortfolioLayout({
  sections = PORTFOLIO_SECTIONS,
  itemMap: items,
  itemDataMap: itemsData,
  onItemUpdate,
  className,
  containerStyle,
  renderSection,
  onAddItem,
  onRemove,
}: Props) {
  return (
    <div className={`portfolio-grid ${className ?? ''}`.trim()}>
      <div className="portfolio-grid__inner" style={containerStyle}>
        {sections.map((section) => {
          const content = (
            <PortfolioZone
              key={section.id}
              section={section}
              items={items[section.id] || []}
              itemsData={itemsData}
              onItemUpdate={onItemUpdate}
              onAddItem={onAddItem}
              onRemove={onRemove}
            />
          );

          return renderSection ? renderSection(section, content) : (
            <div key={section.id} className="portfolio-grid__section">
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PortfolioLayout;
