import './RemoveImageButton.css';

interface Props {
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}

export default function RemoveImageButton({ onClick, disabled, title }: Props) {
  return (
    <button
      type="button"
      className="remove-image-btn"
      onClick={onClick}
      disabled={disabled}
      title={title ?? 'Remove image'}
      aria-label={title ?? 'Remove image'}
    >
      ×
    </button>
  );
}
