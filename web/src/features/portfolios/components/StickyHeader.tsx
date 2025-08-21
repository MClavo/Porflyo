import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import type { PortfolioFormData } from '../schemas/sections.schema';

interface StickyHeaderProps {
  onSave: () => void;
  isSaving: boolean;
  lastSavedAt?: Date;
  canSave: boolean;
}

export function StickyHeader({ onSave, isSaving, lastSavedAt, canSave }: StickyHeaderProps) {
  const { watch, formState: { isDirty } } = useFormContext<PortfolioFormData>();
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  
  const title = watch('title');
  const published = watch('published');

  // Show warning before page unload if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    if (isDirty) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      setShowUnsavedWarning(true);
    } else {
      setShowUnsavedWarning(false);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Portfolio info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-semibold text-gray-900 truncate max-w-xs sm:max-w-sm">
                {title || 'Untitled Portfolio'}
              </h1>
              {published && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                  Published
                </span>
              )}
            </div>
            
            {/* Unsaved changes indicator */}
            {showUnsavedWarning && (
              <div className="flex items-center space-x-1 text-amber-600">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span className="text-sm font-medium hidden sm:inline">Unsaved changes</span>
              </div>
            )}
          </div>

          {/* Right side - Save info and button */}
          <div className="flex items-center space-x-4">
            {/* Last saved info */}
            {lastSavedAt && !showUnsavedWarning && (
              <div className="hidden sm:flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved {formatLastSaved(lastSavedAt)}
              </div>
            )}

            {/* Save button */}
            <button
              onClick={onSave}
              disabled={isSaving || !canSave}
              className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                canSave && !isSaving
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Saving...</span>
                </div>
              ) : (
                published ? 'Save & Publish' : 'Save Draft'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
