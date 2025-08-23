import React from "react";
import type { PortfolioSection } from "../../types/dto";
import { readMeta } from "./types";

interface CardsGridRendererProps {
  variant: string;
  items: PortfolioSection[];
}

export const CardsGridRenderer: React.FC<CardsGridRendererProps> = ({ variant, items }) => {
  // Filter items to only include projects
  const projectItems = items.filter(item => {
    const meta = readMeta(item);
    return meta?.sectionType === "project";
  });

  if (projectItems.length === 0) {
    return (
      <div className="portfolio-section">
        <h2 className="section-title">Projects</h2>
        <div className="text-center" style={{ color: 'var(--pf-text-secondary)' }}>
          No projects available
        </div>
      </div>
    );
  }

  const isCarousel = variant === "carousel";

  const renderProjectCard = (item: PortfolioSection, index: number) => {
    const title = (item.title as string) || `Project ${index + 1}`;
    const description = (item.description as string) || (item.content as string) || "";
    const image = Array.isArray(item.media) ? item.media[0]?.url : undefined;
    const repoUrl = (item.data as Record<string, unknown>)?.repoUrl as string || (item as Record<string, unknown>).repoUrl as string;
    const demoUrl = (item.data as Record<string, unknown>)?.demoUrl as string || (item as Record<string, unknown>).demoUrl as string;

    return (
      <div key={index} className="project-card">
        {image && (
          <div className="aspect-video" style={{ background: 'var(--pf-border)', borderRadius: 'var(--pf-radius)', marginBottom: '1rem' }}>
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
              style={{ borderRadius: 'var(--pf-radius)' }}
            />
          </div>
        )}
        <div>
          <h3 className="project-title">{title}</h3>
          {description && (
            <p className="project-description line-clamp-3">{description}</p>
          )}
          <div className="project-links">
            {repoUrl && (
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="project-link"
              >
                View Code
              </a>
            )}
            {demoUrl && (
              <a
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="project-link"
              >
                Live Demo
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="portfolio-section">
      <h2 className="section-title">Projects</h2>
      
      {isCarousel ? (
        // Carousel Layout
        <div className="overflow-x-auto">
          <div className="flex gap-6 pb-4" style={{ width: `${projectItems.length * 320}px` }}>
            {projectItems.map((item, index) => (
              <div key={index} className="flex-shrink-0 w-80">
                {renderProjectCard(item, index)}
              </div>
            ))}
          </div>
        </div>
      ) : (
        // 2x2 Grid Layout
        <div className="projects-grid">
          {projectItems.slice(0, 4).map((item, index) => renderProjectCard(item, index))}
        </div>
      )}
    </div>
  );
};
