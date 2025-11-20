import React from "react";
import { Title, Text, BulletText, List, Images, Stats } from "./subcomponents/index";
import type { Mode } from "./subcomponents/index";

export type ProjectCardSaved = {
  title: string;
  description: string;
  highlights?: string;
  technologies: string[];
  images: string[];
  techTitle: string;
  // Repository fields
  repoUrl?: string;
  liveUrl?: string;
  stars?: number;
  forks?: number;
};

interface ProjectCardProps {
  mode?: Mode;
  images: string[];
  title: string;
  description: string;
  highlights?: string;
  techTitle: string;
  technologies?: string[];
  // Repository fields
  repoId?: number;
  repoUrl?: string;
  liveUrl?: string;
  stars?: number;
  forks?: number;
  onPatch?: (patch: Partial<ProjectCardSaved>) => void;
  children?: React.ReactNode;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  mode = "view",
  images = [],
  title,
  description,
  highlights = "",
  techTitle = "Technologies:",
  technologies = [],
  repoId,
  repoUrl,
  liveUrl,
  stars,
  forks,
  onPatch,
  children,
}) => {

  // Use a ref and ResizeObserver to keep a CSS variable with the
  // current card width so styles can use it (e.g. to size images).
  const cardRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    // set initial value
    const setVar = () => {
      const w = el.getBoundingClientRect().width;
      el.style.setProperty("--current-card-width", `${Math.round(w)}px`);
    };

    setVar();

    const ro = new ResizeObserver(() => setVar());
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  return (
    <div 
      ref={cardRef} 
      className="project-card" 
      data-mode={mode}
      project-id={repoId ? String(repoId) : 'unknown-project'}
    >
      {/* render injected children (e.g. delete button) */}
      {children}
      
      {/* Images container - isolated for independent padding control */}
      <div className="project-card__images">
        {(images.length > 0 || mode === "edit") && (
          <Images
            mode={mode}
            images={images}
            maxImages={3}
            onChange={(next) => onPatch?.({ images: next })}
          />
        )}
      </div>

      {/* Content container - all non-image content */}
      <div className="project-card__content">
        <Title
          mode={mode}
          value={title}
          required
          maxLength={60}
          onChange={(v) => onPatch?.({ title: v })}
        />

        <Text
          mode={mode}
          value={description}
          maxLength={300}
          onChange={(v) => onPatch?.({ description: v })}
        />

        {/* Highlights / Key points */}
        {(highlights || mode === "edit") && (
          <div className="project-card__highlights">
            <BulletText
              mode={mode}
              value={highlights}
              placeholder="Add key highlights (one per line)..."
              maxLength={500}
              onChange={(v) => onPatch?.({ highlights: v })}
            />
          </div>
        )}

        {(technologies.length > 0 || mode === "edit") && (
          <div className="project-card__technologies">
            <Title 
              mode={mode}
              value={techTitle}
              className="technologies-title"
              maxLength={20}
              onChange={(v) => onPatch?.({ techTitle: v })}
            />

            <List
              mode={mode}
              items={technologies}
              className="technologies"
              maxItems={10}
              onChange={(next) => onPatch?.({ technologies: next })}
            />
          </div>
        )}

        {/* Repository Stats */}
        {((stars && stars > 0) || (forks && forks > 0) || mode === "edit") && (
          <div className="project-card__stats">
            <Stats
              stars={stars}
              forks={forks}
            />
          </div>
        )}

        {/* Repository URLs - only show in edit mode */}
        {mode === "edit" && (
          <div className="project-card__urls">
            <div className="url-input-group">
              <label className="url-label">Live Demo URL:</label>
              <input
                type="url"
                value={liveUrl || ""}
                placeholder="https://your-project.com"
                onChange={(e) => onPatch?.({ liveUrl: e.target.value || undefined })}
                className="url-input"
              />
            </div>
            <div className="url-input-group">
              <label className="url-label">Repository URL:</label>
              <input
                type="url"
                value={repoUrl || ""}
                placeholder="https://github.com/user/repo"
                onChange={(e) => onPatch?.({ repoUrl: e.target.value || undefined })}
                className="url-input"
              />
            </div>
          </div>
        )}

        {/* Footer buttons - only show in view mode */}
        {mode === "view" && (
          <div className="project-card__footer">
            {liveUrl && (
              <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-live">
                Live Demo
              </a>
            )}
            
            {repoUrl ? (
              <a 
                href={repoUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`btn btn-code ${!liveUrl ? 'btn-full' : ''}`}
              >
                Source Code
              </a>
            ) : (
              <button 
                className={`btn btn-code ${!liveUrl ? 'btn-full' : ''}`} 
                type="button" 
                disabled
              >
                Source Code
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
