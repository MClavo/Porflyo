import React from 'react';
import type { PublicUserDto } from '../../api/types';

interface ProviderInfoSectionProps {
  user: PublicUserDto;
}

export const ProviderInfoSection: React.FC<ProviderInfoSectionProps> = ({ user }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Provider Information</h2>
        <p className="card-description">
          This information comes from your GitHub account and cannot be modified here
        </p>
      </div>
      <div className="profile-provider-info">
        <div className="provider-info-row">
          <span className="provider-info-title">GitHub Name:</span>
          <span>{user.providerUserName}</span>
        </div>
        <div className="provider-info-row">
          <span className="provider-info-title">GitHub Avatar:</span>
          {user.providerAvatarUrl && (
            <img 
              src={user.providerAvatarUrl} 
              alt="Provider Avatar" 
              style={{ width: '32px', height: '32px', borderRadius: '50%' }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderInfoSection;