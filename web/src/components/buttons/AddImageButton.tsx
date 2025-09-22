import './AddImageButton.css';

interface Props {
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}

export default function AddImageButton({ onClick, disabled, title }: Props) {
  return (
    <button
      type="button"
      className="add-image-btn"
      onClick={onClick}
      disabled={disabled}
      title={title ?? 'Add image'}
      aria-label={title ?? 'Add image'}
    >
      +
    </button>
  );
}
