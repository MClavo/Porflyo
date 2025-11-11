/**
 * HeatmapSkeleton - Loading skeleton for heatmap component
 */

import React from 'react';
import './HeatmapSkeleton.css';

export interface HeatmapSkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const HeatmapSkeleton: React.FC<HeatmapSkeletonProps> = ({
  className = '',
  style = {}
}) => {
  // Generate skeleton cells (approximating a heatmap grid)
  const skeletonCells = Array.from({ length: 200 }, (_, index) => (
    <div
      key={index}
      className="heatmap-skeleton__cell"
      style={{
        animationDelay: `${(index % 20) * 0.1}s`
      }}
    />
  ));

  return (
    <div
      className={`heatmap-skeleton ${className}`}
      style={style}
    >
      <div className="heatmap-skeleton__overlay">
        <div className="heatmap-skeleton__content">
          {/* Loading indicator */}
          <div className="heatmap-skeleton__indicator">
            <div className="heatmap-skeleton__spinner">
              <div className="heatmap-skeleton__spinner-ring"></div>
              <div className="heatmap-skeleton__spinner-ring"></div>
              <div className="heatmap-skeleton__spinner-ring"></div>
            </div>
            <div className="heatmap-skeleton__text">
              Loading heatmap data...
            </div>
          </div>

          {/* Skeleton grid pattern */}
          <div className="heatmap-skeleton__grid">
            {skeletonCells}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapSkeleton;