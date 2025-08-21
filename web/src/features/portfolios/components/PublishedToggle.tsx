import { useController, type Control } from 'react-hook-form';
import type { PortfolioFormData } from '../schemas/sections.schema';

interface PublishedToggleProps {
  control: Control<PortfolioFormData>;
  disabled?: boolean;
  disabledReason?: string;
}

export function PublishedToggle({ control, disabled = false, disabledReason }: PublishedToggleProps) {
  const {
    field: { value, onChange }
  } = useController({
    name: 'published',
    control
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(e.target.checked);
    }
  };

  return (
    <div className="form-group">
      <div className={`published-toggle-container ${disabled ? 'published-toggle-disabled' : ''}`}>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={value || false}
            onChange={handleChange}
            className="checkbox-input"
            disabled={disabled}
          />
          <span className="checkbox-text">Published</span>
        </label>
        {disabled && disabledReason && (
          <div className="published-tooltip">
            {disabledReason}
          </div>
        )}
      </div>
    </div>
  );
}
