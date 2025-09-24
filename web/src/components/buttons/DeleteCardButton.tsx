import React from 'react';
import './DeleteCardButton.css';

interface Props {
  onDelete: () => void;
  title?: string;
}

const DeleteCardButton: React.FC<Props> = ({ onDelete, title = 'Delete card' }) => {
  return (
    <button
      className="delete-card-button"
      aria-label={title}
      title={title}
      onClick={(e) => { e.stopPropagation(); onDelete(); }}
    >
      ×
    </button>
  );
};

export default DeleteCardButton;
