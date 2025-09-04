import React, { useState, useRef, useEffect } from 'react';
import './EditableSectionTitle.css';

interface EditableSectionTitleProps {
  title: string;
  sectionId: string;
  onTitleUpdate?: (sectionId: string, newTitle: string) => void;
  className?: string;
  isEditable?: boolean;
}

export function EditableSectionTitle({ 
  title, 
  sectionId, 
  onTitleUpdate, 
  className = '', 
  isEditable = true 
}: EditableSectionTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(title);
  }, [title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (!isEditable || !onTitleUpdate) return;
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== title && onTitleUpdate) {
      onTitleUpdate(sectionId, trimmedValue);
    } else if (!trimmedValue) {
      // Si el campo está vacío, restaurar el título original
      setEditValue(title);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (!isEditable || !onTitleUpdate) {
    return <div className={`section-title ${className}`.trim()}>{title}</div>;
  }

  if (isEditing) {
    return (
      <div className={`section-title-editor ${className}`.trim()}>
        <input
          ref={inputRef}
          type="text"
          maxLength={40}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="section-title-input"
          placeholder="Enter section title"
        />
      </div>
    );
  }

  return (
    <div 
      className={`section-title section-title-editable ${className}`.trim()}
      onClick={handleStartEdit}
    >
      {title}
    </div>
  );
}

export default EditableSectionTitle;
