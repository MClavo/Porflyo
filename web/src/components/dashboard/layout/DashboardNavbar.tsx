/**
 * DashboardNavbar - Navbar moderno con toggle de páginas y rango de tiempo
 */

import React from 'react';
import type { TimeRangeOption } from '../../../lib/timeRange';
import { RANGE_OPTIONS } from '../../../lib/timeRange';
import SlotSelector, { type SlotOption } from '../../ui/SlotSelector';
import HeatmapModeToggle, { type HeatmapMode } from '../../ui/HeatmapModeToggle';
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
  // Heatmap slot selection (only used when currentPage === 'heatmap')
  slotOptions?: SlotOption[];
  selectedSlot?: string;
  onSlotChange?: (slot: string) => void;
  // Heatmap calculation mode (only used when currentPage === 'heatmap')
  heatmapMode?: HeatmapMode;
  onHeatmapModeChange?: (mode: HeatmapMode) => void;
}

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  title = "Analytics Dashboard",
  subtitle = "Professional insights and key performance indicators",
  currentPage,
  onPageChange,
  timeRange,
  onTimeRangeChange,
  slotOptions = [],
  selectedSlot = '',
  onSlotChange = () => {},
  heatmapMode = 'raw',
  onHeatmapModeChange = () => {}
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

        {/* Right side - Time Range Toggle or Heatmap Controls */}
        <div className="dashboard-navbar__controls">
          {currentPage === 'heatmap' ? (
            // Heatmap controls: mode toggle + slot selector
            <div className="dashboard-navbar__heatmap-controls">
              <HeatmapModeToggle
                mode={heatmapMode}
                onChange={onHeatmapModeChange}
                disabled={slotOptions.length === 0}
              />
              <SlotSelector
                options={slotOptions}
                value={selectedSlot}
                onChange={onSlotChange}
                placeholder="Select data slot"
                disabled={slotOptions.length === 0}
              />
            </div>
          ) : (
            // Time range selector for other pages
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
          )}
        </div>
      </div>
      
      {/* Separator */}
      <div className="dashboard-navbar__separator"></div>
    </nav>
  );
};

export default DashboardNavbar;