import React from 'react';
import { Link } from 'react-router-dom';
import { FiEdit3, FiMail, FiGithub } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { getSocialPlatform } from '../../constants/socialPlatforms';

interface User {
  name: string;
  email: string;
  profileImage?: string | null;
  providerUserName?: string;
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
          <div className="user-profile-left">
            <Skeleton circle width={96} height={96} />
          </div>
          <div className="user-profile-center">
            <Skeleton width={280} height={32} style={{ marginBottom: '8px' }} />
            <Skeleton width={220} height={18} style={{ marginBottom: '16px' }} />
            <Skeleton width={180} height={16} />
          </div>
          <div className="user-profile-right">
            <Skeleton width={120} height={40} style={{ marginBottom: '12px' }} />
            <Skeleton width={100} count={3} height={32} style={{ marginBottom: '8px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const socialEntries = user.socials ? Object.entries(user.socials) : [];

  return (
    <div className="user-profile-section">
      <div className="user-profile-content">
        <div className="user-profile-left">
          <img 
            src={user.profileImage || '/default-avatar.png'} 
            alt={`${user.name}'s avatar`}
            className="user-profile-avatar"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=ffffff&size=128`;
            }}
          />
        </div>

        <div className="user-profile-center">
          <h1 className="user-profile-title">
            Welcome back, <span className="user-profile-name">{user.name}</span>! 👋
          </h1>
          <div className="user-profile-meta-info">
            {user.providerUserName && (
              <div className="user-meta-item">
                <FiGithub size={16} />
                <span>@{user.providerUserName}</span>
              </div>
            )}
            <div className="user-meta-item">
              <FiMail size={16} />
              <span>{user.email}</span>
            </div>
          </div>
          {socialEntries.length > 0 && (
            <div className="user-profile-socials">
              {socialEntries.map(([platform, url]) => {
                const socialInfo = getSocialPlatform(platform);
                if (!socialInfo) return null;
                
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="user-social-link"
                    style={{ color: socialInfo.color }}
                    title={socialInfo.name}
                  >
                    {socialInfo.icon}
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <div className="user-profile-right">
          <Link to="/profile" className="btn btn-outline user-edit-btn">
            <FiEdit3 size={16} />
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;