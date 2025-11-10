/**
 * DashboardNavbar - Navbar moderno con toggle de páginas y rango de tiempo
 */

import React from 'react';
import type { TimeRangeOption } from '../../../lib/timeRange';
import { RANGE_OPTIONS } from '../../../lib/timeRange';
import SlotSelector, { type SlotOption } from '../../ui/SlotSelector';
import { type HeatmapMode } from '../../ui/HeatmapModeToggle';
import ToggleSelector, { type ToggleSelectorOption } from '../../selector/ToggleSelector';
import './DashboardNavbar.css';

export type PageOption = 'overview' | 'heatmap' | 'projects';

const PAGE_OPTIONS: ToggleSelectorOption<PageOption>[] = [
  { value: 'overview', label: 'Overview', description: 'Portfolio overview and metrics' },
  { value: 'heatmap', label: 'Heatmap', description: 'Interactive performance heatmap' },
  { value: 'projects', label: 'Projects', description: 'Project management and tracking' }
];

const TIME_RANGE_OPTIONS: ToggleSelectorOption<TimeRangeOption>[] = RANGE_OPTIONS.map(option => ({
  value: option.value,
  label: option.label,
  description: `View data for ${option.label.toLowerCase()}`
}));

const HEATMAP_MODE_OPTIONS: ToggleSelectorOption<HeatmapMode>[] = [
  { value: 'raw', label: 'Raw Values', description: 'Show cell values as-is' },
  { value: 'weighted', label: 'Count Weighted', description: 'Values divided by counts' }
];

export interface DashboardNavbarProps {
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
  return (
    <nav className="dashboard-navbar">
      <div className="dashboard-navbar__container">
        {/* Left side - Page Navigation */}
        <div className="dashboard-navbar__pages">
          <ToggleSelector
            options={PAGE_OPTIONS}
            value={currentPage}
            onChange={onPageChange}
            size="md"
            ariaLabel="Select dashboard page"
            className="navbar-page-selector"
          />
        </div>

        {/* Right side - Time Range Toggle or Heatmap Controls */}
        <div className="dashboard-navbar__controls">
          {currentPage === 'heatmap' ? (
            // Heatmap controls: mode toggle + slot selector
            <div className="dashboard-navbar__heatmap-controls">
              <ToggleSelector
                options={HEATMAP_MODE_OPTIONS}
                value={heatmapMode}
                onChange={onHeatmapModeChange}
                size="md"
                disabled={slotOptions.length === 0}
                ariaLabel="Select heatmap calculation mode"
                className="navbar-mode-selector"
              />
              <SlotSelector
                options={slotOptions}
                value={selectedSlot}
                onChange={onSlotChange}
                placeholder="Select slot"
                disabled={slotOptions.length === 0}
              />
            </div>
          ) : (
            // Time range selector for other pages
            <ToggleSelector
              options={TIME_RANGE_OPTIONS}
              value={timeRange}
              onChange={onTimeRangeChange}
              size="md"
              ariaLabel="Select time range"
              className="navbar-time-selector"
            />
          )}
        </div>
      </div>
      
      {/* Separator */}
      <div className="dashboard-navbar__separator"></div>
    </nav>
  );
};

export default DashboardNavbar;