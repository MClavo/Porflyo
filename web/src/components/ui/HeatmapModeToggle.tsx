/**
 * HeatmapModeToggle - Toggle component for selecting heatmap calculation mode
 */

import React from 'react';
import './HeatmapModeToggle.css';

export type HeatmapMode = 'raw' | 'weighted';

export interface HeatmapModeToggleProps {
  mode: HeatmapMode;
  onChange: (mode: HeatmapMode) => void;
  disabled?: boolean;
  className?: string;
}

const HEATMAP_MODES = [
  { value: 'raw' as const, label: 'Raw Values', description: 'Show cell values as-is' },
  { value: 'weighted' as const, label: 'Count Weighted', description: 'Values divided by counts' }
];

export const HeatmapModeToggle: React.FC<HeatmapModeToggleProps> = ({
  mode,
  onChange,
  disabled = false,
  className = ""
}) => {
  const activeIndex = HEATMAP_MODES.findIndex(m => m.value === mode);

  return (
    <div className={`heatmap-mode-toggle ${className}`}>
      <div className="heatmap-mode-toggle__label">
        Calculation Mode
      </div>
      
      <div className="heatmap-mode-toggle__container">
        <div className="heatmap-mode-toggle__options">
          {/* Animated background slider */}
          <div 
            className="heatmap-mode-toggle__slider"
            style={{
              transform: `translateX(${activeIndex * 100}%)`,
            }}
          />
          
          {HEATMAP_MODES.map((modeOption) => (
            <button
              key={modeOption.value}
              className={`heatmap-mode-option ${
                mode === modeOption.value ? 'heatmap-mode-option--active' : ''
              }`}
              onClick={() => !disabled && onChange(modeOption.value)}
              disabled={disabled}
              type="button"
              title={modeOption.description}
              aria-pressed={mode === modeOption.value}
            >
              <span className="heatmap-mode-option__text">
                {modeOption.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeatmapModeToggle;