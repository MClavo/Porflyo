import "./glass.css";
import type { ReactNode } from "react";
import type { TemplateLayoutComponentProps } from "../Template.types";

interface GlassLayoutProps extends TemplateLayoutComponentProps {
  sectionsMap?: Record<string, ReactNode>;
}

export default function GlassLayout({ sectionsMap, isEditable }: GlassLayoutProps) {
  return (
    <div className="tpl-glass" data-mode={isEditable ? "edit" : "view"}>
      {/* About Section - Injected from sectionsMap */}
      {sectionsMap?.about ?? null}

      {/* Portfolio Sections */}
      <div className="glass-sections">
        {/* Experience Section */}
        <div className="portfolio-section experience-section" id="experiences">
          <h2 className="section-title">Experience</h2>
          <div className="section-content">
            {sectionsMap?.experiences ?? null}
          </div>
        </div>

        {/* Projects and Skills Grid */}
        <div className="content-grid">
          <div className="portfolio-section projects-section" id="projects">
            <h2 className="section-title">Projects</h2>
            <div className="section-content">
              {sectionsMap?.projects ?? null}
            </div>
          </div>

          <div className="portfolio-section skills-section" id="text">
            <h2 className="section-title">Skills</h2>
            <div className="section-content">
              {sectionsMap?.text ?? null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}