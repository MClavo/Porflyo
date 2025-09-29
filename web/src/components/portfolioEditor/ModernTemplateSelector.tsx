/**
 * ModernTemplateSelector - Dropdown for template selection
 */

import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiLayout } from 'react-icons/fi';
import { type TemplateKey } from '../../templates/Template.types';
import './ModernTemplateSelector.css';

export interface ModernTemplateSelectorProps {
  selectedTemplate: TemplateKey;
  onSelect: (template: TemplateKey) => void;
}

const TEMPLATE_OPTIONS: Array<{ value: TemplateKey; label: string; description: string }> = [
  { value: 'template1', label: 'Template 1', description: 'Clean layout with projects, text, and experiences' },
  { value: 'template2', label: 'Template 2', description: 'Modern layout with jobs, text, and projects' }
];

export const ModernTemplateSelector: React.FC<ModernTemplateSelectorProps> = ({
  selectedTemplate,
  onSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = TEMPLATE_OPTIONS.find(opt => opt.value === selectedTemplate) || TEMPLATE_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (template: TemplateKey) => {
    onSelect(template);
    setIsOpen(false);
  };

  return (
    <div className="modern-template-selector" ref={dropdownRef}>
      <button
        className="modern-template-selector__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select template"
      >
        <FiLayout size={16} />
        <span className="modern-template-selector__label">Template:</span>
        <span className="modern-template-selector__value">{selectedOption.label}</span>
        <FiChevronDown 
          size={16} 
          className={`modern-template-selector__chevron ${isOpen ? 'modern-template-selector__chevron--open' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="modern-template-selector__dropdown">
          <div className="modern-template-selector__options">
            {TEMPLATE_OPTIONS.map((option) => (
              <button
                key={option.value}
                className={`modern-template-selector__option ${
                  option.value === selectedTemplate ? 'modern-template-selector__option--selected' : ''
                }`}
                onClick={() => handleSelect(option.value)}
                role="option"
                aria-selected={option.value === selectedTemplate}
              >
                <div className="modern-template-selector__option-content">
                  <span className="modern-template-selector__option-label">{option.label}</span>
                  <span className="modern-template-selector__option-description">{option.description}</span>
                </div>
                {option.value === selectedTemplate && (
                  <div className="modern-template-selector__check">✓</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernTemplateSelector;