import React from "react";
import type { PortfolioSection } from "../../types/dto";
import { readMeta } from "./types";

interface AboutRendererProps {
  variant: string;
  items: PortfolioSection[];
}

export const AboutRenderer: React.FC<AboutRendererProps> = ({ variant, items }) => {
  // Get the first about or markdown item
  const aboutItem = items.find(item => {
    const meta = readMeta(item);
    return meta?.sectionType === "about" || meta?.sectionType === "markdown";
  }) || items[0];

  if (!aboutItem) {
    return (
      <div className="about-section">
        <h2 className="section-title">About</h2>
        <div className="text-center" style={{ color: 'var(--pf-text-secondary)' }}>
          No about content available
        </div>
      </div>
    );
  }

  const title = String(aboutItem.title || "About");
  const content = String(aboutItem.description || aboutItem.content || "");
  const image = Array.isArray(aboutItem.media) ? aboutItem.media[0]?.url : undefined;

  const isTextWithImage = variant === "text+image-right";

  return (
    <div className="about-section">
      {isTextWithImage && image ? (
        // Text + Image Right Layout
        <div className="flex flex-col lg:flex-row items-start gap-8">
          <div className="lg:w-2/3">
            <h2 className="section-title">{title}</h2>
            <div className="prose prose-lg max-w-none" style={{ color: 'var(--pf-text-secondary)' }}>
              {content.split('\n').map((paragraph: string, index: number) => (
                <p key={index} style={{ marginBottom: '1rem' }}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
          <div className="lg:w-1/3">
            <div className="aspect-square rounded-lg overflow-hidden" style={{ background: 'var(--pf-border)' }}>
              <img
                src={image}
                alt="About"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      ) : (
        // Text Only Layout
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="section-title" style={{ textAlign: 'center' }}>{title}</h2>
          <div className="prose prose-lg mx-auto" style={{ color: 'var(--pf-text-secondary)' }}>
            {content.split('\n').map((paragraph: string, index: number) => (
              <p key={index} style={{ marginBottom: '1rem' }}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
