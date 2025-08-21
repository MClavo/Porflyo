/**
 * Portfolio Save Action Component
 * Implements the complete save pipeline with image processing and publishing
 */

import { useState } from 'react';
import { usePortfolioSave } from '../hooks/usePortfolioSave';
import type { SavePipelineProgress, SavePipelineResult } from '../services/savePipeline';
import type { PortfolioSectionData } from '../types/sections';

export interface PortfolioSaveActionProps {
  portfolioId: string;
  sections: PortfolioSectionData[];
  title?: string;
  description?: string;
  template?: string;
  modelVersion?: number;
  publishSettings?: {
    shouldPublish: boolean;
    slug?: string;
    published?: boolean;
  };
  onSaveComplete?: (result: SavePipelineResult) => void;
  onError?: (errors: string[]) => void;
  className?: string;
  children?: ((props: { 
    save: () => Promise<void>; 
    isSaving: boolean; 
    progress?: SavePipelineProgress;
  }) => React.ReactNode) | React.ReactNode;
}

export interface SaveProgressModalProps {
  isOpen: boolean;
  progress: SavePipelineProgress;
  onClose?: () => void;
}

/**
 * Save Progress Modal
 */
function SaveProgressModal({ isOpen, progress, onClose }: SaveProgressModalProps) {
  if (!isOpen) return null;

  const getStageIcon = (stage: SavePipelineProgress['stage']) => {
    switch (stage) {
      case 'validation': return '✓';
      case 'images': return '📷';
      case 'portfolio': return '💾';
      case 'publish': return '🌐';
      case 'complete': return '🎉';
      default: return '⏳';
    }
  };

  const getStageTitle = (stage: SavePipelineProgress['stage']) => {
    switch (stage) {
      case 'validation': return 'Validating';
      case 'images': return 'Processing Images';
      case 'portfolio': return 'Saving Portfolio';
      case 'publish': return 'Publishing';
      case 'complete': return 'Complete';
      default: return 'Processing';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content save-progress-modal">
        <div className="save-progress-header">
          <div className="save-progress-icon">
            {getStageIcon(progress.stage)}
          </div>
          <h3 className="save-progress-title">
            {getStageTitle(progress.stage)}
          </h3>
        </div>
        
        <div className="save-progress-body">
          <div className="save-progress-message">
            {progress.message}
          </div>
          
          {progress.imageProgress && (
            <div className="image-progress">
              <div className="image-progress-bar">
                <div 
                  className="image-progress-fill"
                  style={{ 
                    width: `${(progress.imageProgress.completed / progress.imageProgress.total) * 100}%` 
                  }}
                />
              </div>
              <div className="image-progress-text">
                {progress.imageProgress.completed} of {progress.imageProgress.total} images uploaded
              </div>
            </div>
          )}
          
          {progress.error && (
            <div className="save-progress-error">
              <div className="error-icon">⚠️</div>
              <div className="error-message">{progress.error}</div>
            </div>
          )}
          
          {progress.stage !== 'complete' && !progress.error && (
            <div className="save-progress-spinner">
              <div className="spinner"></div>
            </div>
          )}
        </div>
        
        {(progress.stage === 'complete' || progress.error) && onClose && (
          <div className="save-progress-footer">
            <button onClick={onClose} className="btn btn-primary">
              {progress.error ? 'Close' : 'Done'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Portfolio Save Action Component
 */
export function PortfolioSaveAction({
  portfolioId,
  sections,
  title,
  description,
  template,
  modelVersion,
  publishSettings,
  onSaveComplete,
  onError,
  className = '',
  children
}: PortfolioSaveActionProps) {
  const { save, isSaving, progress } = usePortfolioSave();
  const [showProgress, setShowProgress] = useState(false);

  const handleSave = async () => {
    setShowProgress(true);
    
    const result = await save({
      portfolioId,
      sections,
      title,
      description,
      template,
      modelVersion,
      shouldPublish: publishSettings?.shouldPublish,
      slug: publishSettings?.slug,
      published: publishSettings?.published,
    });

    if (result.success) {
      onSaveComplete?.(result);
    } else {
      onError?.(result.errors);
    }
  };

  const handleCloseProgress = () => {
    setShowProgress(false);
  };

  // Render prop pattern for flexible UI
  if (typeof children === 'function') {
    return (
      <>
        {children({ 
          save: handleSave, 
          isSaving, 
          progress: progress || undefined 
        })}
        <SaveProgressModal
          isOpen={showProgress}
          progress={progress || { stage: 'validation', message: 'Preparing...' }}
          onClose={progress?.stage === 'complete' || progress?.error ? handleCloseProgress : undefined}
        />
      </>
    );
  }

  // Default button UI
  return (
    <div className={`portfolio-save-action ${className}`}>
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="btn btn-primary"
      >
        {isSaving ? (
          <>
            <div className="btn-spinner"></div>
            {progress?.stage === 'images' ? 'Uploading...' : 'Saving...'}
          </>
        ) : (
          publishSettings?.shouldPublish ? 'Save & Publish' : 'Save Draft'
        )}
      </button>
      
      <SaveProgressModal
        isOpen={showProgress}
        progress={progress || { stage: 'validation', message: 'Preparing...' }}
        onClose={progress?.stage === 'complete' || progress?.error ? handleCloseProgress : undefined}
      />
    </div>
  );
}
