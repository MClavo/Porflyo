interface PortfolioTitleInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function PortfolioTitleInput({ 
  value, 
  onChange, 
  placeholder = "Enter portfolio title...",
  disabled = false 
}: PortfolioTitleInputProps) {
  return (
    <div className="portfolio-title-section">
      <label htmlFor="portfolio-title" className="form-label">
        Portfolio Title:
      </label>
      <input
        id="portfolio-title"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="form-input"
      />
    </div>
  );
}