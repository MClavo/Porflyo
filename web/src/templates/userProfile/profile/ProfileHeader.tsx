import React from 'react';
import { getImageUrlWithTimestamp } from '../../utils/profileUtils';

type Props = {
  profileImage?: string | null;
  imageTimestamp: number;
};

const ProfileHeader: React.FC<Props> = ({ profileImage, imageTimestamp }) => (
  <div className="profile-header">
    <img
      src={getImageUrlWithTimestamp(profileImage, imageTimestamp)}
      alt="Avatar"
      className="profile-avatar"
    />
    <h1 className="card-title">Edit Profile</h1>
    <p className="card-description">Update your personal information</p>
  </div>
);

export default ProfileHeader;
