import "./glass.css";
import type { ReactNode } from "react";
import type { TemplateLayoutComponentProps } from "../Template.types";

interface GlassLayoutProps extends TemplateLayoutComponentProps {
  sectionsMap?: Record<string, ReactNode>;
}

export default function GlassLayout({ sectionsMap, isEditable }: GlassLayoutProps) {
  return (
    <div className="tpl-glass" data-mode={isEditable ? "edit" : "view"}>
      {/* User Header Section */}
      <div className="user-header">
        <div className="user-info">
          <div className="user-top">
            <div className="user-avatar">
              <div className="avatar-placeholder">U</div>
            </div>

            <div className="user-meta">
              <h1 className="user-name">Your Name</h1>
              <div className="user-contact">
                <a href="mailto:your.email@example.com" className="contact-link">
                  your.email@example.com
                </a>
              </div>
              <div className="social-links">
                <a href="#" className="social-link linkedin">LinkedIn</a>
                <a href="#" className="social-link github">GitHub</a>
                <a href="#" className="social-link website">Website</a>
              </div>
            </div>
          </div>

          <div className="user-description">
            <div className="description-display-readonly">
              Enter your portfolio description here...
            </div>
          </div>
        </div>
      </div>

      {/* AboutSection Component - Uses real data from sectionsMap */}
      {sectionsMap?.about ?? null}

      {/* Portfolio Sections */}
      <div className="portfolio-content">
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

        {/* About Section */}
        <div className="portfolio-section about-section" id="about">
          <h2 className="section-title">About</h2>
          <div className="section-content">
            {sectionsMap?.about ?? null}
          </div>
        </div>
      </div>
    </div>
  );
}