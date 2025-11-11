/**
 * ToggleSelector - Unified reusable toggle selector component
 * 
 * This component can be used for pages, time ranges, modes, and any other toggle functionality.
 * Features animated slider background and flexible sizing options.
 */

import './ToggleSelector.css';

export interface ToggleSelectorOption<T = string> {
  value: T;
  label: string;
  description?: string;
}

export interface ToggleSelectorProps<T = string> {
  /** Array of options to display */
  options: ToggleSelectorOption<T>[];
  /** Currently selected value */
  value: T;
  /** Callback when selection changes */
  onChange: (value: T) => void;
  /** Optional label above the selector */
  label?: string;
  /** Size variant for different contexts */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom aria-label for accessibility */
  ariaLabel?: string;
}

export function ToggleSelector<T = string>({
  options,
  value,
  onChange,
  label,
  size = 'md',
  disabled = false,
  className = '',
  ariaLabel
}: ToggleSelectorProps<T>) {
  const activeIndex = options.findIndex(option => option.value === value);
  
  // Calculate slider width based on number of options
  const sliderWidth = `calc(${100 / options.length}% - 2px)`;
  const sliderTransform = `translateX(${activeIndex * 100}%)`;

  return (
    <div className={`toggle-selector toggle-selector--${size} ${className}`}>
      {label && (
        <div className="toggle-selector__label">
          {label}
        </div>
      )}
      
      <div 
        className="toggle-selector__container"
        role="tablist"
        aria-label={ariaLabel || label}
      >
        {/* Animated background slider */}
        <div 
          className="toggle-selector__slider"
          style={{
            width: sliderWidth,
            transform: sliderTransform,
          }}
        />
        
        {options.map((option) => (
          <button
            key={String(option.value)}
            className={`toggle-selector__option ${
              value === option.value ? 'toggle-selector__option--active' : ''
            }`}
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            type="button"
            role="tab"
            aria-selected={value === option.value}
            aria-controls={`panel-${String(option.value)}`}
            title={option.description}
          >
            <span className="toggle-selector__option-text">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ToggleSelector;