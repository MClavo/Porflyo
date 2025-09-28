/**
 * TimeRangeToggle - Control moderno para seleccionar rango de tiempo
 * Now uses the unified ToggleSelector component
 */

import type { TimeRangeOption } from '../../../lib/timeRange';
import { RANGE_OPTIONS } from '../../../lib/timeRange';
import ToggleSelector, { type ToggleSelectorOption } from '../../selector/ToggleSelector';

export interface TimeRangeToggleProps {
  value: TimeRangeOption;
  onChange: (range: TimeRangeOption) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

// Convert RANGE_OPTIONS to ToggleSelectorOption format
const TIME_RANGE_OPTIONS: ToggleSelectorOption<TimeRangeOption>[] = RANGE_OPTIONS.map(option => ({
  value: option.value,
  label: option.label,
  description: `View data for ${option.label.toLowerCase()}`
}));

export const TimeRangeToggle: React.FC<TimeRangeToggleProps> = ({
  value,
  onChange,
  className = '',
  size = 'md',
  showLabel = true
}) => {
  return (
    <ToggleSelector
      options={TIME_RANGE_OPTIONS}
      value={value}
      onChange={onChange}
      label={showLabel ? "Time Range" : undefined}
      size={size}
      className={`time-range-toggle ${className}`}
      ariaLabel="Select time range"
    />
  );
};

export default TimeRangeToggle;