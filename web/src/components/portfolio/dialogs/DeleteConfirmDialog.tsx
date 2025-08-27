import React from 'react';
import './DeleteConfirmDialog.css';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  itemName?: string;
  itemPreview?: string;
}

export function DeleteConfirmDialog({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  itemName, 
  itemPreview 
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="delete-confirm-dialog-overlay" onKeyDown={handleKeyPress} tabIndex={-1}>
      <div className="delete-confirm-dialog">
        <div className="dialog-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
              stroke="#ef4444" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
        
        <h3>Delete Saved Item</h3>
        
        <div className="dialog-message">
          <p>Are you sure you want to delete this saved item?</p>
          {itemName && (
            <div className="item-info">
              <strong>Name:</strong> {itemName}
            </div>
          )}
          {itemPreview && (
            <div className="item-info">
              <strong>Content:</strong> {itemPreview}
            </div>
          )}
          <p className="warning-text">This action cannot be undone.</p>
        </div>
        
        <div className="dialog-buttons">
          <button 
            type="button" 
            onClick={onCancel}
            className="cancel-button"
            autoFocus
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={onConfirm}
            className="delete-button"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
