import React from "react";
import { AiFillStar, AiOutlineFork } from "react-icons/ai";
import "../../../styles/cards/subcomopnents/Stats.css";

interface StatsProps {
  stars?: number;
  forks?: number;
  className?: string;
}

export const Stats: React.FC<StatsProps> = ({
  stars,
  forks,
  className = "",
}) => {
  // Same display for both view and edit modes
  const hasStats = (stars && stars > 0) || (forks && forks > 0);
  if (!hasStats) return null;

  return (
    <div className={`stats ${className}`.trim()}>
      {stars && stars > 0 && (
        <div className="stat">
          <AiFillStar className="stat-icon" />
          <span className="stat-value">{stars}</span>
        </div>
      )}
      {forks && forks > 0 && (
        <div className="stat">
          <AiOutlineFork className="stat-icon" />
          <span className="stat-value">{forks}</span>
        </div>
      )}
    </div>
  );
};