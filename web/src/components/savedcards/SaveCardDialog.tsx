import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import type { AnyCard } from "../../state/Cards.types";
import "./SaveCardDialog.css";

export type SaveCardDialogProps = {
  isOpen: boolean;
  card: AnyCard | null;
  originSectionId: string;
  originSectionType: string;
  onSave: (name: string) => void;
  onCancel: () => void;
};

export function SaveCardDialog({ 
  isOpen, 
  card, 
  originSectionType, 
  onSave, 
  onCancel 
}: SaveCardDialogProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (isOpen && card) {
      // Auto-generar un nombre sugerido basado en el card
      const suggestedName = generateSuggestedName(card, originSectionType);
      setName(suggestedName);
    } else {
      setName("");
    }
  }, [isOpen, card, originSectionType]);

  const generateSuggestedName = (card: AnyCard, sectionType: string): string => {
    switch (card.type) {
      case "project": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (card.data as any).title || `Project from ${sectionType}`;
      }
      case "job": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const jobData = card.data as any;
        return `${jobData.title || "Job"} at ${jobData.company || "Company"}`;
      }
      case "text": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (card.data as any).title || `Text from ${sectionType}`;
      }
      default:
        return `Card from ${sectionType}`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="save-card-dialog-overlay" onClick={onCancel}>
      <div className="save-card-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="save-card-dialog-header">
          <h3>Save Card</h3>
          <button 
            type="button"
            className="save-card-dialog-close"
            onClick={onCancel}
          >
            <IoClose />
          </button>
        </div>

        <div className="save-card-dialog-content">
          <p>Give this card a name to save it for later use:</p>
          
          <form onSubmit={handleSubmit}>
            <div className="save-card-dialog-field">
              <label htmlFor="card-name">Card Name:</label>
              <input
                id="card-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter a name for this card..."
                maxLength={50}
                autoFocus
                required
              />
            </div>

            <div className="save-card-dialog-info">
              <span className="save-card-dialog-meta">
                Type: <strong>{card?.type}</strong>
              </span>
              <span className="save-card-dialog-meta">
                From: <strong>{originSectionType}</strong>
              </span>
            </div>

            <div className="save-card-dialog-divider"></div>

            <div className="save-card-dialog-actions">
              <button 
                type="button" 
                className="save-card-dialog-btn save-card-dialog-btn-cancel"
                onClick={onCancel}
              >
               
                Cancel
              </button>
              <button 
                type="submit" 
                className="save-card-dialog-btn save-card-dialog-btn-save"
                disabled={!name.trim()}
              >
                
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
