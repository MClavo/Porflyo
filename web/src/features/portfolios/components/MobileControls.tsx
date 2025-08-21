import { useState } from 'react';

interface MobileSectionControlsProps {
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
  sectionTitle: string;
}

export function MobileSectionControls({
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  sectionTitle
}: MobileSectionControlsProps) {
  const [showControls, setShowControls] = useState(false);

  return (
    <div className="sm:hidden">
      {/* Mobile toggle button */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label={`Section controls for ${sectionTitle}`}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {/* Mobile controls panel */}
      {showControls && (
        <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48">
          <div className="py-1">
            {/* Move up */}
            <button
              onClick={() => {
                onMoveUp();
                setShowControls(false);
              }}
              disabled={!canMoveUp}
              className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 ${
                canMoveUp 
                  ? 'text-gray-700 hover:bg-gray-100' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
              <span>Move Up</span>
            </button>

            {/* Move down */}
            <button
              onClick={() => {
                onMoveDown();
                setShowControls(false);
              }}
              disabled={!canMoveDown}
              className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 ${
                canMoveDown 
                  ? 'text-gray-700 hover:bg-gray-100' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
              <span>Move Down</span>
            </button>

            <div className="border-t border-gray-100 my-1"></div>

            {/* Edit */}
            <button
              onClick={() => {
                onEdit();
                setShowControls(false);
              }}
              className="w-full text-left px-4 py-2 text-sm flex items-center space-x-2 text-gray-700 hover:bg-gray-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit</span>
            </button>

            {/* Delete */}
            <button
              onClick={() => {
                onDelete();
                setShowControls(false);
              }}
              className="w-full text-left px-4 py-2 text-sm flex items-center space-x-2 text-red-600 hover:bg-red-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface KeyboardControlsProps {
  isSelected: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSelect: () => void;
}

export function KeyboardControls({
  isSelected,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onSelect
}: KeyboardControlsProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isSelected) return;

    switch (e.key) {
      case 'ArrowUp':
        if (canMoveUp) {
          e.preventDefault();
          onMoveUp();
        }
        break;
      case 'ArrowDown':
        if (canMoveDown) {
          e.preventDefault();
          onMoveDown();
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        // Could trigger edit mode here
        break;
    }
  };

  return (
    <div
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={`hidden sm:block absolute -left-2 top-1/2 transform -translate-y-1/2 ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      aria-label="Section keyboard controls. Use arrow keys to reorder."
    >
      <div className="bg-white border border-gray-300 rounded shadow-sm p-1">
        <div className="flex flex-col space-y-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={!canMoveUp}
            className={`p-1 rounded text-xs ${
              canMoveUp 
                ? 'text-gray-700 hover:bg-gray-100' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
            aria-label="Move section up"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={!canMoveDown}
            className={`p-1 rounded text-xs ${
              canMoveDown 
                ? 'text-gray-700 hover:bg-gray-100' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
            aria-label="Move section down"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
