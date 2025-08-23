import React from "react";
import type { PortfolioSection } from "../../types/dto";
import { readMeta } from "./types";

interface ListRendererProps {
  variant: string;
  items: PortfolioSection[];
}

export const ListRenderer: React.FC<ListRendererProps> = ({ variant, items }) => {
  // Filter items to only include skill groups
  const skillItems = items.filter(item => {
    const meta = readMeta(item);
    return meta?.sectionType === "skillGroup";
  });

  if (skillItems.length === 0) {
    return (
      <div className="skills-section">
        <h2 className="section-title">Skills</h2>
        <div className="text-center" style={{ color: 'var(--pf-text-secondary)' }}>
          No skills available
        </div>
      </div>
    );
  }

  const isChips = variant === "chips";
  const isGroupedColumns = variant === "grouped-columns";

  const parseSkills = (item: PortfolioSection) => {
    const title = (item.title as string) || "Skills";
    const skillsText = (item.content as string) || (item.description as string) || "";
    const skills = skillsText ? skillsText.split(',').map(s => s.trim()).filter(Boolean) : [];
    return { title, skills };
  };

  return (
    <div className="skills-section">
      <h2 className="section-title">Skills</h2>
      
      {isChips ? (
        // Chips Layout - All skills as flat chips
        <div className="skills-grid justify-center">
          {skillItems.map((item, itemIndex) => {
            const { skills } = parseSkills(item);
            return skills.map((skill, skillIndex) => (
              <span
                key={`${itemIndex}-${skillIndex}`}
                className="skill-chip"
              >
                {skill}
              </span>
            ));
          })}
        </div>
      ) : isGroupedColumns ? (
        // Grouped Columns Layout
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillItems.map((item, index) => {
            const { title, skills } = parseSkills(item);
            return (
              <div key={index} className="portfolio-section">
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--pf-text-primary)', marginBottom: '1rem' }}>{title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {skills.map((skill, skillIndex) => (
                    <div
                      key={skillIndex}
                      className="skill-chip"
                      style={{ justifySelf: 'start' }}
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Default fallback
        <div className="text-center" style={{ color: 'var(--pf-text-secondary)' }}>
          Unknown variant: {variant}
        </div>
      )}
    </div>
  );
};
