import React, { useState } from 'react';
import './SaveItemDialog.css';

interface SaveItemDialogProps {
  isOpen: boolean;
  onSave: (name: string) => void;
  onCancel: () => void;
  itemPreview?: string;
}

export function SaveItemDialog({ isOpen, onSave, onCancel, itemPreview }: SaveItemDialogProps) {
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
        <h3>Guardar Item</h3>
        
        {itemPreview && (
          <div className="item-preview">
            <label>Item a guardar:</label>
            <div className="preview-content">{itemPreview}</div>
          </div>
        )}
        
        <div className="input-section">
          <label htmlFor="item-name">Nombre del item:</label>
          <input
            id="item-name"
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Introduce un nombre..."
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
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={handleSave}
            className="save-button"
            disabled={!itemName.trim()}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
