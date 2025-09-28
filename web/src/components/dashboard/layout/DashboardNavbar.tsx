/**
 * DashboardNavbar - Navbar moderno con toggle de páginas y rango de tiempo
 */

import React from 'react';
import type { TimeRangeOption } from '../../../lib/timeRange';
import { RANGE_OPTIONS } from '../../../lib/timeRange';
import './DashboardNavbar.css';

export type PageOption = 'overview' | 'heatmap';

interface PageTab {
  value: PageOption;
  label: string;
}

const PAGE_TABS: PageTab[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'heatmap', label: 'Heatmap' }
];

export interface DashboardNavbarProps {
  title?: string;
  subtitle?: string;
  currentPage: PageOption;
  onPageChange: (page: PageOption) => void;
  timeRange: TimeRangeOption;
  onTimeRangeChange: (range: TimeRangeOption) => void;
}

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  title = "Analytics Dashboard",
  subtitle = "Professional insights and key performance indicators",
  currentPage,
  onPageChange,
  timeRange,
  onTimeRangeChange
}) => {
  const activeTimeIndex = RANGE_OPTIONS.findIndex(option => option.value === timeRange);
  const activePageIndex = PAGE_TABS.findIndex(tab => tab.value === currentPage);

  return (
    <nav className="dashboard-navbar">
      <div className="dashboard-navbar__container">
        {/* Left side - Page Navigation */}
        <div className="dashboard-navbar__pages">
          <div className="page-selector">
            <div className="page-selector__options">
              {/* Animated background slider for pages */}
              <div 
                className="page-selector__slider"
                style={{
                  transform: `translateX(${activePageIndex * 100}%)`,
                }}
              ></div>
              
              {PAGE_TABS.map((tab) => (
                <button
                  key={tab.value}
                  className={`page-option ${
                    currentPage === tab.value ? 'page-option--active' : ''
                  }`}
                  onClick={() => onPageChange(tab.value)}
                  type="button"
                >
                  <span className="page-option__text">
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Title */}
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
                  transform: `translateX(${activeTimeIndex * 100}%)`,
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