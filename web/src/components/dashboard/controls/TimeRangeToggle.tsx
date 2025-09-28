/**
 * TimeRangeToggle - Control moderno para seleccionar rango de tiempo
 */

import React from 'react';
import type { TimeRangeOption } from '../../../lib/timeRange';
import { RANGE_OPTIONS } from '../../../lib/timeRange';
import './TimeRangeToggle.css';

export interface TimeRangeToggleProps {
  value: TimeRangeOption;
  onChange: (range: TimeRangeOption) => void;
  className?: string;
}

export const TimeRangeToggle: React.FC<TimeRangeToggleProps> = ({
  value,
  onChange,
  className = ''
}) => {
  return (
    <div className={`time-range-toggle ${className}`}>
      <div className="time-range-toggle__container">
        <div className="time-range-toggle__label">
          Time Range
        </div>
        <div className="time-range-toggle__options">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={`time-range-option ${
                value === option.value ? 'time-range-option--active' : ''
              }`}
              onClick={() => onChange(option.value)}
              type="button"
            >
              <span className="time-range-option__text">
                {option.label}
              </span>
              {value === option.value && (
                <div className="time-range-option__indicator"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeRangeToggle;