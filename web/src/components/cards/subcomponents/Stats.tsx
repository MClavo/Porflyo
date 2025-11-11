import React from "react";
import type { Mode } from "./index";
import "../../../styles/cards/subcomopnents/Stats.css";

interface StatsProps {
  mode?: Mode;
  stars?: number;
  forks?: number;
  className?: string;
}

export const Stats: React.FC<StatsProps> = ({
  mode = "view",
  stars,
  forks,
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

  // In edit mode, show read-only display for stars and forks
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
            readOnly
            className="stat-input stat-input-readonly"
            title="Stars are automatically fetched and cannot be edited manually"
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
            readOnly
            className="stat-input stat-input-readonly"
            title="Forks are automatically fetched and cannot be edited manually"
          />
        </label>
      </div>
    </div>
  );
};