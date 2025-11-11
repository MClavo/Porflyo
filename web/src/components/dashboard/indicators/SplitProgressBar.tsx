/**
 * SplitProgressBar - Barra de progreso dividida en dos colores
 */

import React from 'react';
import './SplitProgressBar.css';

export interface SplitProgressBarProps {
  leftValue: number; // 0-100 percentage
  rightValue: number; // 0-100 percentage  
  leftColor?: string;
  rightColor?: string;
  leftLabel?: string;
  rightLabel?: string;
  width?: number;
  height?: number;
}

export const SplitProgressBar: React.FC<SplitProgressBarProps> = ({
  leftValue,
  rightValue,
  leftColor = '#3b82f6',
  rightColor = '#8b5cf6',
  leftLabel,
  rightLabel,
  width = 120,
  height = 8
}) => {
  // Normalize values to ensure they add up to 100%
  const total = leftValue + rightValue;
  const leftPercent = total > 0 ? (leftValue / total) * 100 : 0;
  const rightPercent = total > 0 ? (rightValue / total) * 100 : 0;

  return (
    <div className="split-progress-container">
      {/* Labels */}
      <div className="split-progress-labels">
        {leftLabel && (
          <span className="split-progress-label split-progress-label--left">
            {leftLabel}: {leftValue.toFixed(0)}%
          </span>
        )}
        {rightLabel && (
          <span className="split-progress-label split-progress-label--right">
            {rightLabel}: {rightValue.toFixed(0)}%
          </span>
        )}
      </div>
      
      {/* Progress Bar */}
      <div 
        className="split-progress-bar"
        style={{
          width,
          height,
        }}
      >
        <div
          className="split-progress-segment split-progress-segment--left"
          style={{
            width: `${leftPercent}%`,
            backgroundColor: leftColor,
          }}
        />
        <div
          className="split-progress-segment split-progress-segment--right"
          style={{
            width: `${rightPercent}%`,
            backgroundColor: rightColor,
          }}
        />
      </div>
    </div>
  );
};

export default SplitProgressBar;