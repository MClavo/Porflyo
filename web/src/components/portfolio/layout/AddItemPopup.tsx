import React from 'react';
import './AddItemPopup.css';

type Props = {
  sectionId: string;
  allowedItemTypes: import('../../../types/itemDto').ItemType[];
  onSelect: (sectionId: string, itemType: import('../../../types/itemDto').ItemType) => void;
  onClose?: () => void;
};

export const AddItemPopup: React.FC<Props> = ({ sectionId, allowedItemTypes, onSelect, onClose }) => {
  return (
    <div className="addItemPopup" role="dialog" aria-label="Select item type">
      {allowedItemTypes.map(type => (
        <button
          key={type}
          type="button"
          className={`addItemPopup__option addItemPopup__option--${type}`}
          onClick={() => {
            onSelect(sectionId, type);
            if (onClose) onClose();
          }}
        >
          {type}
        </button>
      ))}
    </div>
  );
};

export default AddItemPopup;
