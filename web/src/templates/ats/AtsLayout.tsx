import "./ats.css";
import type { ReactNode } from "react";
import type { TemplateLayoutComponentProps } from "../Template.types";

interface AtsLayoutProps extends TemplateLayoutComponentProps {
  sectionsMap?: Record<string, ReactNode>;
}

export default function AtsLayout({ sectionsMap, isEditable }: AtsLayoutProps) {
  return (
    <div className="tpl-ats" data-mode={isEditable ? "edit" : "view"}>
      <div className="ats-content-wrapper">
        {/* About Section */}
        {sectionsMap?.about ?? null}

        {/* Experience Section */}
        {sectionsMap?.experiences && (
          <div className="portfolio-section" id="experiences">
            <div className="section-content">
              {sectionsMap.experiences}
            </div>
          </div>
        )}

        {/* Education Section */}
        {sectionsMap?.education && (
          <div className="portfolio-section" id="education">
            <div className="section-content">
              {sectionsMap.education}
            </div>
          </div>
        )}

        {/* Projects Section */}
        {sectionsMap?.projects && (
          <div className="portfolio-section" id="projects">
            <div className="section-content">
              {sectionsMap.projects}
            </div>
          </div>
        )}

        {/* Certifications Section */}
        {sectionsMap?.achievements && (
          <div className="portfolio-section" id="achievements">
            <div className="section-content">
              {sectionsMap.achievements}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
