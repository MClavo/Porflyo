import React from 'react';
import { Link } from 'react-router-dom';
import { FiEdit3 } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface User {
  name: string;
  email: string;
  profileImage?: string | null;
  socials?: Record<string, string>;
}

interface UserProfileCardProps {
  user: User | null;
  isLoading?: boolean;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ 
  user, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="user-profile-section">
        <div className="user-profile-header">
          <div className="user-avatar">
            <Skeleton circle width={80} height={80} />
          </div>
          <div className="user-info">
            <div className="user-name">
              <Skeleton width={200} height={30} />
            </div>
            <div className="user-email">
              <Skeleton width={250} height={16} />
            </div>
            <div className="social-links">
              <Skeleton width={80} height={32} />
              <Skeleton width={80} height={32} />
              <Skeleton width={80} height={32} />
            </div>
          </div>
          <div className="user-actions">
            <Skeleton width={120} height={40} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="user-profile-section">
      <div className="user-profile-header">
        <img 
          src={user.profileImage || '/default-avatar.png'} 
          alt={`${user.name}'s avatar`}
          className="user-avatar"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=ffffff&size=80`;
          }}
        />
        <div className="user-info">
          <h1 className="user-name">Hello, {user.name}! 👋</h1>
          <p className="user-email">{user.email}</p>
          {user.socials && Object.keys(user.socials).length > 0 && (
            <div className="social-links">
              {Object.entries(user.socials).map(([platform, url]) => (
                <a 
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="user-actions">
          <Link to="/profile" className="btn btn-outline">
            <FiEdit3 size={16} />
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;