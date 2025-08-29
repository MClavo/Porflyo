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
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { PortfolioItems, PortfolioItemsData } from './LayoutTypes';
import type { PortfolioItem } from '../../../types/itemDto';
import { PortfolioZone } from '../section/PortfolioZone';
import { DEFAULT_SECTIONS as PORTFOLIO_SECTIONS } from '../../../types/sectionDto';
import './PortfolioLayout.css';

type Props = {
  sections?: typeof PORTFOLIO_SECTIONS;
  itemMap: PortfolioItems;
  itemDataMap: PortfolioItemsData;
  templateId?: string;
  onItemUpdate?: (id: string | number, updatedItem: Partial<PortfolioItem>) => void;
  onSectionTitleUpdate?: (sectionId: string, newTitle: string) => void;
  className?: string;
  containerStyle?: React.CSSProperties;
  renderSection?: (
    section: typeof PORTFOLIO_SECTIONS[number],
    content: React.ReactNode
  ) => React.ReactNode;
  // Optional full-site/template component containing placeholders with ids == section.id
  siteComponent?: React.ReactNode;
  onAddItem?: (sectionId: string, itemType?: import('../../../types/itemDto').ItemType) => void;
  onRemove?: (id: string | number) => void;
};

export function PortfolioLayout({
  sections = PORTFOLIO_SECTIONS,
  itemMap: items,
  itemDataMap: itemsData,
  templateId,
  onItemUpdate,
  onSectionTitleUpdate,
  className,
  containerStyle,
  renderSection,
  onAddItem,
  onRemove,
  siteComponent,
}: Props) {
  
  // Reference to the DOM node that wraps the supplied site component.
  const siteRef = useRef<HTMLDivElement | null>(null);
  // Map from section id -> target DOM element inside the site where the
  // corresponding section should be rendered (or null if not found).
  const [targets, setTargets] = useState<Record<string, HTMLElement | null>>({});

  // Compute targets by finding elements with id === section.id inside siteRef.
  const computeTargets = () => {
    const newTargets: Record<string, HTMLElement | null> = {};
    if (!siteRef.current) {
      sections.forEach((s) => (newTargets[s.id] = null));
      setTargets(newTargets);
      return;
    }

    sections.forEach((section) => {
        // Prefer placeholders inside the rendered site component
        let el: HTMLElement | null = siteRef.current
          ? (siteRef.current.querySelector(`#${section.id}`) as HTMLElement | null)
          : null;

        // Fallback: global lookup in document (useful for sidebars / external containers)
        if (!el && typeof document !== 'undefined') {
          el = document.getElementById(section.id);
        }

        newTargets[section.id] = el;
    });

    setTargets(newTargets);
  };

  // Recompute targets when sections change or when the site DOM mutates.
  useEffect(() => {
    computeTargets();

    if (!siteRef.current) return;

    const obs = new MutationObserver(() => {
      // debounce-ish: recompute when the structure of the site changes
      computeTargets();
    });

    obs.observe(siteRef.current, { childList: true, subtree: true });
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections]);

  // Helper: render the PortfolioZone for a section
  const renderSectionContent = (section: typeof PORTFOLIO_SECTIONS[number]) => (
    <PortfolioZone
      key={section.id}
      section={section}
      items={items[section.id] || []}
      itemsData={itemsData}
      templateId={templateId}
      onItemUpdate={onItemUpdate}
      onAddItem={onAddItem}
      onRemove={onRemove}
      onSectionTitleUpdate={onSectionTitleUpdate}
    />
  );

  // Helper: render a section either into the template (portal) or as a normal div
  const renderSectionWrapper = (section: typeof PORTFOLIO_SECTIONS[number]) => {
    const content = renderSectionContent(section);

    // If a renderSection override exists, use it. This allows templates or
    // consumers to wrap the content further.
    const possiblyWrapped = renderSection ? renderSection(section, content) : (
      <div className="portfolio-grid__section">{content}</div>
    );

    // If we found a placeholder target in the site, portal into it.
    const target = targets[section.id];
    if (target) {
      // Wrap portal in a Fragment with key so mapping has stable keys
      return (
        <React.Fragment key={section.id}>
          {createPortal(possiblyWrapped, target)}
        </React.Fragment>
      );
    }

    // Fallback: render inline
    return (
      <React.Fragment key={section.id}>
        {possiblyWrapped}
      </React.Fragment>
    );
  };

  // Render the optional site wrapper (template). If provided by consumer via
  // the `siteComponent` prop it should be rendered inside a wrapper with a
  // ref so we can query for placeholders.
  const renderSiteWrapper = (siteComponent?: React.ReactNode) => {
    if (!siteComponent) return null;
    return (
      <div ref={siteRef} className="portfolio-layout__site-wrapper">
        {siteComponent}
      </div>
    );
  };

  return (
    <div className={`portfolio-grid ${className ?? ''}`.trim()}>
      <div className="portfolio-grid__inner" style={containerStyle}>
        {renderSiteWrapper(siteComponent)}

        {sections.map((section) => renderSectionWrapper(section))}
      </div>
    </div>
  );
}

export default PortfolioLayout;
