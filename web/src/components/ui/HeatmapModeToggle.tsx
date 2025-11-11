/**
 * HeatmapModeToggle - Toggle component for selecting heatmap calculation mode
 * Now uses the unified ToggleSelector component
 */

import ToggleSelector, { type ToggleSelectorOption } from '../selector/ToggleSelector';

export type HeatmapMode = 'raw' | 'weighted';

export interface HeatmapModeToggleProps {
  mode: HeatmapMode;
  onChange: (mode: HeatmapMode) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const HEATMAP_MODE_OPTIONS: ToggleSelectorOption<HeatmapMode>[] = [
  { value: 'raw', label: 'Raw Values', description: 'Show cell values as-is' },
  { value: 'weighted', label: 'Count Weighted', description: 'Values divided by counts' }
];

export const HeatmapModeToggle: React.FC<HeatmapModeToggleProps> = ({
  mode,
  onChange,
  disabled = false,
  className = "",
  size = 'md',
  showLabel = true
}) => {
  return (
    <ToggleSelector
      options={HEATMAP_MODE_OPTIONS}
      value={mode}
      onChange={onChange}
      label={showLabel ? "Calculation Mode" : undefined}
      size={size}
      disabled={disabled}
      className={`heatmap-mode-toggle ${className}`}
      ariaLabel="Select heatmap calculation mode"
    />
  );
};

export default HeatmapModeToggle;