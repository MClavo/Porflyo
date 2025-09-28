/**
 * DashboardNavbar - Navbar moderno con toggle de rango de tiempo
 */

import React from 'react';
import type { TimeRangeOption } from '../../../lib/timeRange';
import { RANGE_OPTIONS } from '../../../lib/timeRange';
import './DashboardNavbar.css';

export interface DashboardNavbarProps {
  title?: string;
  subtitle?: string;
  timeRange: TimeRangeOption;
  onTimeRangeChange: (range: TimeRangeOption) => void;
}

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  title = "Analytics Dashboard",
  subtitle = "Professional insights and key performance indicators",
  timeRange,
  onTimeRangeChange
}) => {
  const activeIndex = RANGE_OPTIONS.findIndex(option => option.value === timeRange);

  return (
    <nav className="dashboard-navbar">
      <div className="dashboard-navbar__container">
        {/* Left side - Title */}
        <div className="dashboard-navbar__brand">
          <h1 className="dashboard-navbar__title">{title}</h1>
          <p className="dashboard-navbar__subtitle">{subtitle}</p>
        </div>

        {/* Right side - Time Range Toggle */}
        <div className="dashboard-navbar__controls">
          <div className="time-range-selector">
            <div className="time-range-selector__label">
              Time Range
            </div>
            <div className="time-range-selector__options">
              {/* Animated background slider */}
              <div 
                className="time-range-selector__slider"
                style={{
                  transform: `translateX(${activeIndex * 100}%)`,
                }}
              ></div>
              
              {RANGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`time-range-option ${
                    timeRange === option.value ? 'time-range-option--active' : ''
                  }`}
                  onClick={() => onTimeRangeChange(option.value)}
                  type="button"
                >
                  <span className="time-range-option__text">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Separator */}
      <div className="dashboard-navbar__separator"></div>
    </nav>
  );
};

export default DashboardNavbar;