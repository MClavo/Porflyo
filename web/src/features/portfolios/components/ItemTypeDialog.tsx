import React from 'react';
import type { ItemType } from '../types/itemDto';

interface ItemTypeDialogProps {
  isOpen: boolean;
  allowedTypes: ItemType[];
  onSelectType: (type: ItemType) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

// Dialog component for selecting item type when multiple types are allowed
export const ItemTypeDialog: React.FC<ItemTypeDialogProps> = ({
  isOpen,
  allowedTypes,
  onSelectType,
  onClose,
  position
}) => {
  if (!isOpen) return null;

  const getTypeLabel = (type: ItemType): string => {
    switch (type) {
      case 'text':
        return 'Text Field';
      case 'character':
        return 'Character (X)';
      case 'doubleText':
        return 'Double Text';
      default:
        return type;
    }
  };

  const getTypeDescription = (type: ItemType): string => {
    switch (type) {
      case 'text':
        return 'Single text input field';
      case 'character':
        return 'Fixed character display';
      case 'doubleText':
        return 'Two text input fields';
      default:
        return '';
    }
  };

  return (
    <>
      {/* Backdrop to close dialog when clicking outside */}
      <div 
        className="item-type-dialog-backdrop"
        onClick={onClose}
      />
      
      {/* Dialog content */}
      <div 
        className="item-type-dialog"
        style={{
          left: position.x,
          top: position.y
        }}
      >
        <div className="dialog-header">
          <h4>Select Item Type</h4>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>
        
        <div className="dialog-content">
          {allowedTypes.map(type => (
            <button
              key={type}
              className="item-type-option"
              onClick={() => {
                onSelectType(type);
                onClose();
              }}
            >
              <div className="option-label">{getTypeLabel(type)}</div>
              <div className="option-description">{getTypeDescription(type)}</div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
