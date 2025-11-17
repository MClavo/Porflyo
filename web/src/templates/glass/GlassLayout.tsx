import "./glass.css";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { TemplateLayoutComponentProps } from "../Template.types";
import { GLASS_GRADIENTS, getGradientById } from "./GlassGradients";
import type { AboutSectionData } from "../../components/sections/AboutSection.types";

interface GlassLayoutProps extends TemplateLayoutComponentProps {
  sectionsMap?: Record<string, ReactNode>;
}

export default function GlassLayout({
  sectionsMap,
  isEditable,
}: GlassLayoutProps) {
  // Extract about section data to get gradient preference
  const [selectedGradientId, setSelectedGradientId] = useState<string>('purple');

  // Find about section and extract gradient from templateConfig
  useEffect(() => {
    // This is a bit hacky, but we need to extract the about section from sectionsMap
    // The about section is passed as a ReactNode, so we need to get the data from it
    const aboutElement = sectionsMap?.about as React.ReactElement<{ data: AboutSectionData; onPatch?: (data: Partial<AboutSectionData>) => void }>;
    if (aboutElement?.props) {
      const aboutData = aboutElement.props.data as AboutSectionData;
      if (aboutData?.templateConfig?.glassGradient) {
        setSelectedGradientId(aboutData.templateConfig.glassGradient as string);
      }
    }
  }, [sectionsMap?.about]);

  const currentGradient = getGradientById(selectedGradientId);

  // Expose current gradient as a global CSS variable so preview popups
  // and other isolated renderers can pick it up.
  useEffect(() => {
    if (typeof document !== 'undefined' && document.documentElement && document.documentElement.style) {
      document.documentElement.style.setProperty(
        "--porflyo-glass-gradient",
        currentGradient.gradient
      );
    }
  }, [currentGradient.gradient]);

  const handleGradientChange = (gradientId: string) => {
    setSelectedGradientId(gradientId);
    
    // Trigger a patch to save the gradient in the about section's templateConfig
    const aboutElement = sectionsMap?.about as React.ReactElement<{ data: AboutSectionData; onPatch?: (data: Partial<AboutSectionData>) => void }>;
    if (aboutElement?.props?.onPatch) {
      aboutElement.props.onPatch({
        templateConfig: {
          ...aboutElement.props.data?.templateConfig,
          glassGradient: gradientId,
        },
      });
    }
  };

  return (
    <div 
      className="tpl-glass" 
      data-mode={isEditable ? "edit" : "view"}
      style={{ background: currentGradient.gradient }}
    >
      {/* Gradient Selector - Only visible in edit mode */}
      {isEditable && (
        <div className="glass-gradient-selector">
          {GLASS_GRADIENTS.map((gradient) => (
            <a
              key={gradient.id}
              type="button"
              className={`glass-gradient-option ${
                selectedGradientId === gradient.id ? 'active' : ''
              }`}
              style={{ background: gradient.gradient }}
              onClick={() => handleGradientChange(gradient.id)}
              title={gradient.name}
              aria-label={`Select ${gradient.name} gradient`}
            />
          ))}
        </div>
      )}

      <div className="glass-content-wrapper">
        {/* About Section - Full width at top */}
        {sectionsMap?.about ?? null}

        {/* Projects Section - Full width */}
        {sectionsMap?.projects && (
          <div className="portfolio-section" id="projects">
            <div className="section-content">{sectionsMap.projects}</div>
          </div>
        )}

        {/* Main Content Container */}
        <div className="glass-sections">
          {/* Experience Section - Full width */}
          {sectionsMap?.experiences && (
            <div className="portfolio-section" id="experiences">
              <div className="section-content">{sectionsMap.experiences}</div>
            </div>
          )}

          {/* Education Section - Full width */}
          {sectionsMap?.education && (
            <div className="portfolio-section" id="education">
              <div className="section-content">{sectionsMap.education}</div>
            </div>
          )}

          {/* Skills Section - Full width */}
          {sectionsMap?.text && (
            <div className="portfolio-section" id="text">
              <div className="section-content">{sectionsMap.text}</div>
            </div>
          )}

          {/* Achievements Section - Full width */}
          {sectionsMap?.achievements && (
            <div className="portfolio-section" id="achievements">
              <div className="section-content">{sectionsMap.achievements}</div>
            </div>
          )}

          {/* Contact Section - Full width at bottom */}
          {sectionsMap?.contact && (
            <div className="portfolio-section" id="contact">
              <div className="section-content">{sectionsMap.contact}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
