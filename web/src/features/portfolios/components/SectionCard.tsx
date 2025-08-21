import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SectionFormData } from '../schemas/sections.schema';
import { SECTION_DISPLAY_NAMES } from '../types/sections';

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card ${isDragging ? 'dragging' : ''}`}
      {...attributes}
    >
      {/* Section Header */}
      <div className="section-header">
        <div className="section-header-left">
          {!isAboutSection && (
            <div 
              className="drag-handle"
              {...listeners}
            >
              <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </div>
          )}
          <h3 className="section-title">
            {SECTION_DISPLAY_NAMES[section.kind]}
            {isAboutSection && <span className="section-fixed-badge">Fixed</span>}
          </h3>
        </div>

        <div className="section-actions">
          {!isAboutSection && (
            <>
              <button
                type="button"
                onClick={() => onMoveUp(index)}
                disabled={!canMoveUp}
                className="btn-sm btn-outline"
                title="Move up"
              >
                <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => onMoveDown(index)}
                disabled={!canMoveDown}
                className="btn-sm btn-outline"
                title="Move down"
              >
                <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => onDelete(index)}
                className="btn-sm btn-outline delete-btn"
                title="Delete section"
              >
                <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Section Content */}
      <div className="section-content">
        {children}
      </div>
    </div>
  );
}
