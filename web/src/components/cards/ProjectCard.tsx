import React from "react";
import { Title, Text, List, Images, Stats } from "./subcomponents/index";
import type { Mode } from "./subcomponents/index";

export type ProjectCardSaved = {
  title: string;
  description: string;
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

  // Debug: Log repoId to verify it's being passed correctly
  React.useEffect(() => {
    console.log(`🏷️ ProjectCard "${title}" mounted with repoId:`, repoId);
  }, [repoId, title]);

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
      data-project-id={repoId ? String(repoId) : 'unknown-project'}
    >
      {/* render injected children (e.g. delete button) */}
      {children}
      {(images.length > 0 || mode === "edit") && (
        <Images
          mode={mode}
          images={images}
          maxImages={3}
          onChange={(next) => onPatch?.({ images: next })}
        />
      )}

      {/* <img src={image} alt={titleState} /> */}
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

      {(technologies.length > 0 || mode === "edit") && (
        <>
          <Title 
            mode={mode}
            value={techTitle}
            className="technologies-title  top-border"
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
        </>
      )}

      {/* Repository Stats */}
      {((stars && stars > 0) || (forks && forks > 0) || mode === "edit") && (
        <Stats
          mode={mode}
          stars={stars}
          forks={forks}
          className="top-border"
        />
      )}

      {/* Repository URLs - only show in edit mode */}
      {mode === "edit" && (
        <div className="url-inputs top-border">
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

      <div className="footer top-border">
        {liveUrl ? (
          <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="btn live">
            Live
          </a>
        ) : (
          <button className="btn live" type="button" disabled={mode === "view"}>
            {mode === "edit" ? "No Live URL" : "Live"}
          </button>
        )}
        
        {repoUrl ? (
          <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="btn code">
            Source Code
          </a>
        ) : (
          <button className="btn code" type="button" disabled={mode === "view"}>
            {mode === "edit" ? "No Repo URL" : "Source Code"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
