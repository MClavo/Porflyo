import React from "react";
import type { TemplateLayoutComponentProps } from "../types";
import type { PortfolioItemsData } from "../../components/portfolio/layout/LayoutTypes";
import type { PortfolioSection } from "../../types/sectionDto";
import TemplateSection from "./TemplateSection";
import "./templateExample.css";

const TemplateLayout: React.FC<
  TemplateLayoutComponentProps & {
    renderSection?: (
      section: PortfolioSection,
      content: React.ReactNode
    ) => React.ReactNode;
    renderItems?: (
      section: PortfolioSection,
      items: string[],
      itemsData: PortfolioItemsData
    ) => React.ReactNode;
  }
> = ({
  sections,
  itemMap,
  itemDataMap,
  themeClass,
  renderSection,
  renderItems,
}) => {
  return (
    <div className={`tpl-example-root ${themeClass ?? ""}`.trim()}>
      <header className="tpl-example-header">
        <div className="tpl-example-brand">Mi Portfolio</div>
        <nav className="tpl-example-nav">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              {s.title}
            </a>
          ))}
        </nav>
      </header>

      <main className="tpl-example-main">
        {sections.map((section) => {
          const content = (
            <div
              key={section.id}
              id={section.id}
              className={`tpl-section section-${section.id}`}
            >
              <TemplateSection
                section={section}
                items={itemMap[section.id] || []}
                itemsData={itemDataMap as PortfolioItemsData}
                renderItems={renderItems}
              />
            </div>
          );

          return renderSection ? renderSection(section, content) : content;
        })}
      </main>
    </div>
  );
};

export default TemplateLayout;
