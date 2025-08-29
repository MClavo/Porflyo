import React, { useState } from 'react';
import './SaveItemDialog.css';

interface SaveItemDialogProps {
  isOpen: boolean;
  onSave: (name: string) => void;
  onCancel: () => void;
  itemPreview?: string;
  isUploading?: boolean;
  uploadProgress?: string;
}

export function SaveItemDialog({ 
  isOpen, 
  onSave, 
  onCancel, 
  itemPreview,
  isUploading = false,
  uploadProgress
}: SaveItemDialogProps) {
  const [itemName, setItemName] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (itemName.trim()) {
      onSave(itemName.trim());
      setItemName('');
    }
  };

  const handleCancel = () => {
    setItemName('');
    onCancel();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="save-item-dialog-overlay">
      <div className="save-item-dialog">
        <h3>Save Element</h3>
        
        {itemPreview && (
          <div className="item-preview">
            <label>Content to save:</label>
            <div className="preview-content">{itemPreview}</div>
          </div>
        )}
        
        {isUploading && (
          <div className="upload-progress">
            <div className="upload-status">
              <div className="upload-spinner">⏳</div>
              <span>{uploadProgress || 'Uploading images...'}</span>
            </div>
          </div>
        )}
        
        <div className="input-section">
          <label htmlFor="item-name">Name:</label>
          <input
            id="item-name"
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter a name..."
            autoFocus
            maxLength={50}
          />
        </div>
        
        <div className="dialog-buttons">
          <button 
            type="button" 
            onClick={handleCancel}
            className="cancel-button"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleSave}
            className="save-button"
            disabled={!itemName.trim() || isUploading}
          >
            {isUploading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
