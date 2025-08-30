import { useEffect, useState } from 'react';
import './Notification.css';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Notification = ({ message, type, isVisible, onClose, duration = 1500 }: NotificationProps) => {
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    if (isVisible && duration > 0) {
      // Start hiding animation 500ms before the total duration ends
      const hideTimer = setTimeout(() => {
        setIsHiding(true);
      }, duration - 500);

      // Actually remove the notification after the hide animation completes
      const removeTimer = setTimeout(() => {
        onClose();
        setIsHiding(false);
      }, duration);

      return () => {
        clearTimeout(hideTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [isVisible, duration, onClose]);

  // Reset hiding state when becoming visible
  useEffect(() => {
    if (isVisible) {
      setIsHiding(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className={`notification notification--${type} ${isVisible ? 'notification--visible' : ''} ${isHiding ? 'notification--hiding' : ''}`}>
      <div className="notification__content">
        <span className="notification__icon">
          {type === 'success' && '✓'}
          {type === 'error' && '✗'}
          {type === 'info' && 'ℹ'}
        </span>
        <span className="notification__message">{message}</span>
      </div>
    </div>
  );
};
