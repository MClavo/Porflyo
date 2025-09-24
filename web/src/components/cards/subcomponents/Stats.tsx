import React from "react";
import type { Mode } from "./index";

interface StatsProps {
  mode?: Mode;
  stars?: number;
  forks?: number;
  onPatch?: (patch: { stars?: number; forks?: number }) => void;
  className?: string;
}

export const Stats: React.FC<StatsProps> = ({
  mode = "view",
  stars,
  forks,
  onPatch,
  className = "",
}) => {
  if (mode === "view") {
    // In view mode, only show stats if they exist and are > 0
    const hasStats = (stars && stars > 0) || (forks && forks > 0);
    if (!hasStats) return null;

    return (
      <div className={`stats ${className}`.trim()}>
        {stars && stars > 0 && (
          <div className="stat">
            <span className="stat-icon">⭐</span>
            <span className="stat-value">{stars}</span>
          </div>
        )}
        {forks && forks > 0 && (
          <div className="stat">
            <span className="stat-icon">🍴</span>
            <span className="stat-value">{forks}</span>
          </div>
        )}
      </div>
    );
  }

  // In edit mode, show inputs for stars and forks
  return (
    <div className={`stats ${className}`.trim()} data-mode={mode}>
      <div className="stat-input-group">
        <label className="stat-label">
          <span className="stat-icon">⭐</span>
          <input
            type="number"
            min="0"
            placeholder="Stars"
            value={stars || ""}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
              onPatch?.({ stars: value });
            }}
            className="stat-input"
          />
        </label>
      </div>
      <div className="stat-input-group">
        <label className="stat-label">
          <span className="stat-icon">🍴</span>
          <input
            type="number"
            min="0"
            placeholder="Forks"
            value={forks || ""}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
              onPatch?.({ forks: value });
            }}
            className="stat-input"
          />
        </label>
      </div>
    </div>
  );
};