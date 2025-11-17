import React from 'react';
import { FiGithub, FiExternalLink } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import type { PublicUserDto } from '../../api/types';

interface ProviderInfoProps {
  user: PublicUserDto | null;
  isLoading?: boolean;
}

export const ProviderInfo: React.FC<ProviderInfoProps> = ({
  user,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="profile-section">
        <div className="profile-section-header">
          <FiGithub className="profile-section-icon" />
          <div>
            <div className="profile-section-title">
              <Skeleton width={150} height={24} />
            </div>
            <div className="profile-section-description">
              <Skeleton width={250} height={16} />
            </div>
          </div>
        </div>
        <div className="provider-info">
          <Skeleton circle width={48} height={48} />
          <div style={{ flex: 1 }}>
            <Skeleton width={200} height={20} />
            <Skeleton width={250} height={16} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const githubUrl = `https://github.com/${user.providerUserName.replace(/\s+/g, '')}`;

  return (
    <div className="profile-section">
      <div className="profile-section-header">
        <FiGithub className="profile-section-icon" />
        <div>
          <h3 className="profile-section-title">Connected Account</h3>
          <p className="profile-section-description">
            Your GitHub account information
          </p>
        </div>
      </div>

      <div className="provider-info">
        <img
          src={user.providerAvatarUrl || '/default-avatar.png'}
          alt={`${user.providerUserName}'s GitHub avatar`}
          className="provider-avatar"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.providerUserName)}&background=3b82f6&color=ffffff&size=48`;
          }}
        />
        <div className="provider-details">
          <h4 className="provider-name">@{user.providerUserName}</h4>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="provider-link"
          >
            <span>View GitHub Profile</span>
            <FiExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProviderInfo;