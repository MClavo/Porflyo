/**
 * ModernTemplateSelector - Dropdown for template selection
 */

import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiLayout } from 'react-icons/fi';
import { type TemplateKey, templateList } from '../../templates/Template.types';
import './ModernTemplateSelector.css';

export interface ModernTemplateSelectorProps {
  selectedTemplate: TemplateKey;
  onSelect: (template: TemplateKey) => void;
}

// Template descriptions for better user experience
const TEMPLATE_DESCRIPTIONS: Record<TemplateKey, { label: string; description: string }> = {
  glass: { 
    label: 'Glass', 
    description: 'Professional glassmorphism design with animated backgrounds' 
  },
  ats: {
    label: 'ATS',
    description: 'Applicant tracking system like layout for streamlined resumes'
  }
};

// Create template options dynamically from the template list
const getTemplateOptions = (): Array<{ value: TemplateKey; label: string; description: string }> => {
  return templateList.map(templateKey => {
    const key = templateKey as TemplateKey;
    const info = TEMPLATE_DESCRIPTIONS[key];
    
    return {
      value: key,
      label: info?.label || key.charAt(0).toUpperCase() + key.slice(1),
      description: info?.description || `${key.charAt(0).toUpperCase() + key.slice(1)} template layout`
    };
  });
};

const TEMPLATE_OPTIONS = getTemplateOptions();

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