/**
 * Saved Sections Panel
 * Allows users to save, list, and manage reusable portfolio sections
 */

import { useState } from 'react';
import { 
  useListSavedSections, 
  useCreateSavedSection, 
  useDeleteSavedSection 
} from '../hooks/useSavedSections';
import type { PortfolioSectionData } from '../types/sections';
import type { PublicSavedSectionDto, PortfolioSection } from '../../../types/dto';

export interface SavedSectionsPanelProps {
  onInsertSection: (section: PortfolioSectionData) => void;
  onSaveSection?: (section: PortfolioSectionData, name: string) => void;
  className?: string;
}

export interface SaveSectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  sectionToSave?: PortfolioSectionData;
}

/**
 * Dialog for saving a new section
 */
function SaveSectionDialog({ isOpen, onClose, onSave, sectionToSave }: SaveSectionDialogProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string>('');
  
  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) {
      setError('Section name is required');
      return;
    }
    
    if (name.trim().length > 50) {
      setError('Section name cannot exceed 50 characters');
      return;
    }
    
    onSave(name.trim());
    setName('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Save Section</h3>
          <button onClick={handleClose} className="modal-close">×</button>
        </div>
        
        <div className="modal-body">
          <p className="text-sm text-secondary mb-4">
            Save this section to reuse it in other portfolios. 
            You can have up to 20 saved sections.
          </p>
          
          {sectionToSave && (
            <div className="section-preview mb-4">
              <div className="text-xs text-secondary mb-2">
                Section Type: {sectionToSave.kind}
              </div>
              <div className="preview-content">
                {'title' in sectionToSave && sectionToSave.title && (
                  <div className="font-medium">{sectionToSave.title}</div>
                )}
                {'content' in sectionToSave && sectionToSave.content && (
                  <div className="text-sm text-secondary truncate">
                    {sectionToSave.content.substring(0, 100)}...
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="section-name" className="form-label">
              Section Name
            </label>
            <input
              id="section-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a descriptive name..."
              className="form-input"
              maxLength={50}
              autoFocus
            />
            {error && (
              <div className="form-error">{error}</div>
            )}
          </div>
        </div>
        
        <div className="modal-footer">
          <button onClick={handleClose} className="btn btn-outline">
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            Save Section
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Individual saved section item
 */
function SavedSectionItem({ 
  savedSection, 
  onInsert, 
  onDelete 
}: {
  savedSection: PublicSavedSectionDto;
  onInsert: (section: PortfolioSectionData) => void;
  onDelete: (id: string) => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleInsert = () => {
    // Clone the section data and generate new ID
    const clonedSection: PortfolioSectionData = {
      ...(savedSection.section as unknown as PortfolioSectionData),
      id: `section-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      position: 0 // Will be set by the parent component
    };
    
    onInsert(clonedSection);
  };

  const handleDelete = () => {
    onDelete(savedSection.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="saved-section-item">
      <div className="saved-section-header">
        <div className="saved-section-info">
          <h4 className="saved-section-name">{savedSection.name}</h4>
          <div className="saved-section-type">
            {(savedSection.section as Record<string, unknown>)?.kind as string || 'Unknown'}
          </div>
        </div>
        
        <div className="saved-section-actions">
          <button
            onClick={handleInsert}
            className="btn btn-sm btn-primary"
            title="Insert this section"
          >
            Insert
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn btn-sm btn-outline"
            title="Delete this section"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="saved-section-preview">
        {Boolean((savedSection.section as Record<string, unknown>)?.title) && (
          <div className="preview-title">
            {String((savedSection.section as Record<string, unknown>).title)}
          </div>
        )}
        {Boolean((savedSection.section as Record<string, unknown>)?.content) && (
          <div className="preview-content">
            {String((savedSection.section as Record<string, unknown>).content).substring(0, 100)}
            {String((savedSection.section as Record<string, unknown>).content).length > 100 && '...'}
          </div>
        )}
      </div>
      
      {showDeleteConfirm && (
        <div className="delete-confirm">
          <p className="text-sm">Are you sure you want to delete this saved section?</p>
          <div className="delete-confirm-actions">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="btn btn-sm btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-sm btn-danger"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Main Saved Sections Panel Component
 */
export function SavedSectionsPanel({ 
  onInsertSection, 
  onSaveSection, 
  className = '' 
}: SavedSectionsPanelProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [sectionToSave, setSectionToSave] = useState<PortfolioSectionData>();
  
  const { data: savedSections, isLoading, error } = useListSavedSections();
  const createSavedSection = useCreateSavedSection();
  const deleteSavedSection = useDeleteSavedSection();

  const handleSaveSection = (section: PortfolioSectionData, name?: string) => {
    if (name) {
      // Direct save with provided name
      createSavedSection.mutate({
        name,
        section: section as unknown as PortfolioSection // Convert to DTO format
      });
    } else {
      // Open dialog to get name
      setSectionToSave(section);
      setSaveDialogOpen(true);
    }
  };

  const handleSaveWithDialog = (name: string) => {
    if (sectionToSave) {
      createSavedSection.mutate({
        name,
        section: sectionToSave as unknown as PortfolioSection // Convert to DTO format
      });
    }
  };

  const handleDeleteSection = (id: string) => {
    deleteSavedSection.mutate(id);
  };

  // Expose save function to parent (simplified approach)
  if (onSaveSection) {
    // The parent can call this directly
    const saveFunction = handleSaveSection;
    onSaveSection = saveFunction;
  }

  return (
    <div className={`saved-sections-panel ${className}`}>
      <div className="panel-header">
        <h3 className="panel-title">Saved Sections</h3>
        <div className="panel-subtitle">
          {savedSections ? `${savedSections.length}/20` : '0/20'} sections saved
        </div>
      </div>
      
      <div className="panel-content">
        {isLoading && (
          <div className="panel-loading">
            <div className="spinner"></div>
            <div className="text-sm">Loading saved sections...</div>
          </div>
        )}
        
        {error && (
          <div className="panel-error">
            <div className="error-message">
              Failed to load saved sections: {error.message}
            </div>
          </div>
        )}
        
        {savedSections && savedSections.length === 0 && (
          <div className="panel-empty">
            <div className="empty-icon">📝</div>
            <div className="empty-title">No saved sections</div>
            <div className="empty-description">
              Save sections from your portfolio to reuse them later
            </div>
          </div>
        )}
        
        {savedSections && savedSections.length > 0 && (
          <div className="saved-sections-list">
            {savedSections.map((savedSection) => (
              <SavedSectionItem
                key={savedSection.id}
                savedSection={savedSection}
                onInsert={onInsertSection}
                onDelete={handleDeleteSection}
              />
            ))}
          </div>
        )}
        
        {createSavedSection.isError && (
          <div className="panel-error">
            <div className="error-message">
              Failed to save section: {createSavedSection.error?.message}
            </div>
          </div>
        )}
        
        {deleteSavedSection.isError && (
          <div className="panel-error">
            <div className="error-message">
              Failed to delete section: {deleteSavedSection.error?.message}
            </div>
          </div>
        )}
      </div>
      
      <SaveSectionDialog
        isOpen={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSaveWithDialog}
        sectionToSave={sectionToSave}
      />
    </div>
  );
}
