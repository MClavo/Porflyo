import React from 'react';
import './AddCardButton.css';

export type CardTypeOption = 'project' | 'job' | 'education' | 'text' | 'certificate' | 'award';

interface Props {
  allowedTypes: CardTypeOption[];
  onAdd: (type: CardTypeOption) => void;
}

const AddCardButton: React.FC<Props> = ({ allowedTypes, onAdd }) => {
  const [open, setOpen] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (allowedTypes.length === 1) {
      onAdd(allowedTypes[0]);
      return;
    }
    setOpen((s) => !s);
  };

  return (
    <div className="add-card-root">
      {open && allowedTypes.length > 1 && (
        <div className="add-card-popup" role="list" aria-label="Select card type">
          {allowedTypes.map((t) => (
            <button
              key={t}
              className="add-card-option"
              onClick={(ev) => {
                ev.stopPropagation();
                onAdd(t);
                setOpen(false);
              }}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <button
        className="add-card-button"
        aria-label="Add card"
        onClick={handleClick}
        title="Add card"
      >
        <span className="add-card-plus">+</span>
      </button>
    </div>
  );
};

export default AddCardButton;
