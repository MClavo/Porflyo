import React from 'react';
import { Link } from 'react-router-dom';
import { FiEdit3, FiUser, FiMail, FiExternalLink } from 'react-icons/fi';
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
        <div className="user-profile-content">
          <div className="user-profile-avatar">
            <Skeleton circle width={120} height={120} />
          </div>
          <div className="user-profile-info">
            <div className="user-profile-title">
              <Skeleton width={300} height={36} />
            </div>
            <div className="user-profile-subtitle">
              <Skeleton width={400} height={20} />
            </div>
            <div className="user-profile-meta">
              <Skeleton width={150} height={16} />
              <Skeleton width={200} height={16} />
              <Skeleton width={120} height={16} />
            </div>
          </div>
          <div className="user-profile-actions">
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
      <div className="user-profile-content">
        <img 
          src={user.profileImage || '/default-avatar.png'} 
          alt={`${user.name}'s avatar`}
          className="user-profile-avatar"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=ffffff&size=120`;
          }}
        />
        <div className="user-profile-info">
          <h1 className="user-profile-title">Welcome back, {user.name}! 👋</h1>
          <p className="user-profile-subtitle">
            Here's your dashboard overview and portfolio management
          </p>
          <div className="user-profile-meta">
            <div className="user-meta-item">
              <FiUser size={14} />
              <span>{user.name}</span>
            </div>
            <div className="user-meta-item">
              <FiMail size={14} />
              <span>{user.email}</span>
            </div>
            {user.socials && Object.keys(user.socials).length > 0 && (
              <>
                {Object.entries(user.socials).slice(0, 2).map(([platform, url]) => (
                  <a 
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="user-meta-item user-meta-link"
                  >
                    <FiExternalLink size={14} />
                    <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                  </a>
                ))}
              </>
            )}
          </div>
        </div>
        <div className="user-profile-actions">
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