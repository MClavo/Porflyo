/**
 * SlotSelector - Dropdown component for selecting heatmap slots
 */

import React, { useState, useRef, useEffect } from 'react';
import './SlotSelector.css';

export interface SlotOption {
  value: string;
  label: string;
  date?: string;
}

export interface SlotSelectorProps {
  options: SlotOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const SlotSelector: React.FC<SlotSelectorProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select slot",
  disabled = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Find selected option
  const selectedOption = options.find(option => option.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'Escape':
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          // Focus first option
          const firstOption = dropdownRef.current?.querySelector('[role="option"]') as HTMLElement;
          firstOption?.focus();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          // Focus last option
          const options = dropdownRef.current?.querySelectorAll('[role="option"]');
          const lastOption = options?.[options.length - 1] as HTMLElement;
          lastOption?.focus();
        }
        break;
    }
  };

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const handleOptionKeyDown = (event: React.KeyboardEvent, optionValue: string, index: number) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleOptionClick(optionValue);
        break;
      case 'ArrowDown': {
        event.preventDefault();
        const nextOption = dropdownRef.current?.querySelectorAll('[role="option"]')?.[index + 1] as HTMLElement;
        if (nextOption) {
          nextOption.focus();
        }
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const prevOption = dropdownRef.current?.querySelectorAll('[role="option"]')?.[index - 1] as HTMLElement;
        if (prevOption) {
          prevOption.focus();
        } else {
          buttonRef.current?.focus();
          setIsOpen(false);
        }
        break;
      }
      case 'Escape':
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
    }
  };

  return (
    <div className={`slot-selector ${className}`}>
      <div className="slot-selector__label">
        Heatmap Data
      </div>
      
      <div className="slot-selector__container">
        <button
          ref={buttonRef}
          className={`slot-selector__trigger ${isOpen ? 'slot-selector__trigger--open' : ''} ${disabled ? 'slot-selector__trigger--disabled' : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby="slot-selector-label"
          type="button"
        >
          <span className="slot-selector__value">
            {selectedOption?.label || placeholder}
          </span>
          <div className="slot-selector__icon">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`slot-selector__chevron ${isOpen ? 'slot-selector__chevron--open' : ''}`}
            >
              <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div
            ref={dropdownRef}
            className="slot-selector__dropdown"
            role="listbox"
            aria-labelledby="slot-selector-label"
          >
            {options.map((option, index) => (
              <React.Fragment key={option.value}>
                <div
                  className={`slot-selector__option ${option.value === value ? 'slot-selector__option--selected' : ''} ${option.value === 'all' ? 'slot-selector__option--all' : ''}`}
                  role="option"
                  aria-selected={option.value === value}
                  tabIndex={0}
                  onClick={() => handleOptionClick(option.value)}
                  onKeyDown={(e) => handleOptionKeyDown(e, option.value, index)}
                >
                  <span className="slot-selector__option-label">
                    {option.label}
                  </span>
                  {option.date && (
                    <span className="slot-selector__option-date">
                      {option.date}
                    </span>
                  )}
                </div>
                
                {/* Separator after "All" option */}
                {option.value === 'all' && index < options.length - 1 && (
                  <div className="slot-selector__separator" />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SlotSelector;