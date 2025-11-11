import "./glass.css";
import type { ReactNode } from "react";
import type { TemplateLayoutComponentProps } from "../Template.types";

interface GlassLayoutProps extends TemplateLayoutComponentProps {
  sectionsMap?: Record<string, ReactNode>;
}

export default function GlassLayout({ sectionsMap, isEditable }: GlassLayoutProps) {
  return (
    <div className="tpl-glass" data-mode={isEditable ? "edit" : "view"}>
      <div className="glass-content-wrapper">
        {/* About Section - Full width at top */}
        {sectionsMap?.about ?? null}

        {/* Main Content Container */}
        <div className="glass-sections">
          {/* Experience Section - Full width */}
          {sectionsMap?.experiences && (
            <div className="portfolio-section" id="experiences">
              <div className="section-content">
                {sectionsMap.experiences}
              </div>
            </div>
          )}

          {/* Education Section - Full width */}
          {sectionsMap?.education && (
            <div className="portfolio-section" id="education">
              <div className="section-content">
                {sectionsMap.education}
              </div>
            </div>
          )}

          {/* Projects Section - Full width */}
          {sectionsMap?.projects && (
            <div className="portfolio-section" id="projects">
              <div className="section-content">
                {sectionsMap.projects}
              </div>
            </div>
          )}

          {/* Skills and Achievements in 2-column grid */}
          <div className="content-grid">
            {sectionsMap?.text && (
              <div className="portfolio-section" id="text">
                <div className="section-content">
                  {sectionsMap.text}
                </div>
              </div>
            )}

            {sectionsMap?.achievements && (
              <div className="portfolio-section" id="achievements">
                <div className="section-content">
                  {sectionsMap.achievements}
                </div>
              </div>
            )}
          </div>

          {/* Contact Section - Full width at bottom */}
          {sectionsMap?.contact && (
            <div className="portfolio-section" id="contact">
              <div className="section-content">
                {sectionsMap.contact}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}