import './Notification.css';

export interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

export function Notification({ message, type, isVisible, onClose }: NotificationProps) {

  if (!isVisible) return null;

  return (
    <div className={`notification notification--${type}`}>
      <div className="notification-content">
        <span className="notification-message">{message}</span>
        <button
          onClick={onClose}
          className="notification-close"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}