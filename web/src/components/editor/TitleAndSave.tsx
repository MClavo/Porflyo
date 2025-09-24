// using automatic JSX runtime
import { PortfolioTitleInput } from '../portfolio';

export default function TitleAndSave({
  portfolioTitle,
  onTitleChange,
  onSave,
  isSaving,
}: {
  portfolioTitle: string;
  onTitleChange: (s: string) => void;
  onSave: () => void;
  isSaving: boolean;
}) {
  return (
    <div className="title-save-row">
      <PortfolioTitleInput value={portfolioTitle} onChange={onTitleChange} />
      <div className="save-button-section">
        <button
          className="save-button"
          disabled={!portfolioTitle || portfolioTitle.trim() === '' || isSaving}
          onClick={onSave}
        >
          {isSaving ? 'Saving...' : 'Save Portfolio'}
        </button>
      </div>
    </div>
  );
}
