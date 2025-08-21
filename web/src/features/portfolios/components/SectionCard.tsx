import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SectionFormData } from '../schemas/sections.schema';
import { SECTION_DISPLAY_NAMES } from '../types/sections';
import { MobileSectionControls, KeyboardControls } from './MobileControls';

interface SectionCardProps {
  section: SectionFormData;
  index: number;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDelete: (index: number) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  children: React.ReactNode;
}

export function SectionCard({
  section,
  index,
  onMoveUp,
  onMoveDown,
  onDelete,
  canMoveUp,
  canMoveDown,
  children,
}: SectionCardProps) {
  const [isSelected, setIsSelected] = useState(false);
  const isAboutSection = section.kind === 'ABOUT';
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    disabled: isAboutSection, // ABOUT section cannot be dragged
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleMoveUp = () => onMoveUp(index);
  const handleMoveDown = () => onMoveDown(index);
  const handleDelete = () => onDelete(index);
  const handleEdit = () => {
    // Focus on the first input in the section for editing
    const firstInput = document.querySelector(`#section-${section.id} input, #section-${section.id} textarea`);
    if (firstInput instanceof HTMLElement) {
      firstInput.focus();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-white rounded-lg shadow-sm border transition-all duration-200 ${
        isDragging ? 'opacity-50 shadow-lg' : 'hover:shadow-md'
      } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      {...attributes}
    >
      {/* Keyboard controls for desktop */}
      {!isAboutSection && (
        <KeyboardControls
          isSelected={isSelected}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onSelect={() => setIsSelected(!isSelected)}
        />
      )}

      {/* Section Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          {/* Drag handle - desktop only */}
          {!isAboutSection && (
            <div 
              className="hidden sm:flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
              {...listeners}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </div>
          )}
          
          <div>
            <h3 className="text-sm sm:text-base font-medium text-gray-900">
              {SECTION_DISPLAY_NAMES[section.kind]}
            </h3>
            {isAboutSection && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                Fixed Position
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Desktop controls */}
          {!isAboutSection && (
            <div className="hidden sm:flex items-center space-x-1">
              <button
                type="button"
                onClick={handleMoveUp}
                disabled={!canMoveUp}
                className={`p-2 rounded-md transition-colors ${
                  canMoveUp 
                    ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' 
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                title="Move up"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleMoveDown}
                disabled={!canMoveDown}
                className={`p-2 rounded-md transition-colors ${
                  canMoveDown 
                    ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' 
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                title="Move down"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="p-2 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete section"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}

          {/* Mobile controls */}
          {!isAboutSection && (
            <MobileSectionControls
              canMoveUp={canMoveUp}
              canMoveDown={canMoveDown}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onEdit={handleEdit}
              onDelete={handleDelete}
              sectionTitle={SECTION_DISPLAY_NAMES[section.kind]}
            />
          )}
        </div>
      </div>

      {/* Section Content */}
      <div id={`section-${section.id}`} className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
}
