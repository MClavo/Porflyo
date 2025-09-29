import React from 'react';
import { FiUser, FiMail, FiGithub } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import type { PublicUserDto } from '../../api/types';

interface ModernProfileHeaderProps {
  user: PublicUserDto | null;
  isLoading?: boolean;
}

export const ModernProfileHeader: React.FC<ModernProfileHeaderProps> = ({
  user,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-header-avatar">
            <Skeleton circle width={120} height={120} />
          </div>
          <div className="profile-header-info">
            <div className="profile-header-title">
              <Skeleton width={300} height={36} />
            </div>
            <div className="profile-header-subtitle">
              <Skeleton width={400} height={20} />
            </div>
            <div className="profile-header-meta">
              <Skeleton width={150} height={16} />
              <Skeleton width={200} height={16} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="profile-header">
      <div className="profile-header-content">
        <img
          src={user.profileImage || user.providerAvatarUrl || '/default-avatar.png'}
          alt={`${user.name}'s profile`}
          className="profile-header-avatar"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=ffffff&size=120`;
          }}
        />
        <div className="profile-header-info">
          <h1 className="profile-header-title">Profile Settings</h1>
          <p className="profile-header-subtitle">
            Manage your account information and preferences
          </p>
          <div className="profile-header-meta">
            <div className="profile-meta-item">
              <FiUser size={14} />
              <span>{user.name}</span>
            </div>
            <div className="profile-meta-item">
              <FiMail size={14} />
              <span>{user.email}</span>
            </div>
            <div className="profile-meta-item">
              <FiGithub size={14} />
              <span>@{user.providerUserName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernProfileHeader;