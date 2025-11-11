import React from 'react';
import { 
  FiLinkedin, 
  FiGithub, 
  FiInstagram, 
  FiFacebook, 
  FiYoutube, 
  FiTwitch,
  FiGlobe,
  FiEdit
} from 'react-icons/fi';
import { 
  SiX, 
  SiLeetcode, 
  SiKaggle, 
  SiTiktok, 
  SiDiscord, 
  SiMedium 
} from 'react-icons/si';

export interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { id: 'blog', name: 'Blog', icon: React.createElement(FiEdit, { size: 16 }), color: '#6366f1' },
  { id: 'discord', name: 'Discord', icon: React.createElement(SiDiscord, { size: 16 }), color: '#5865f2' },
  { id: 'facebook', name: 'Facebook', icon: React.createElement(FiFacebook, { size: 16 }), color: '#1877f2' },
  { id: 'github', name: 'GitHub', icon: React.createElement(FiGithub, { size: 16 }), color: '#e6edf3' },
  { id: 'instagram', name: 'Instagram', icon: React.createElement(FiInstagram, { size: 16 }), color: '#e4405f' },
  { id: 'kaggle', name: 'Kaggle', icon: React.createElement(SiKaggle, { size: 16 }), color: '#20beff' },
  { id: 'leetcode', name: 'LeetCode', icon: React.createElement(SiLeetcode, { size: 16 }), color: '#ffa116' },
  { id: 'linkedin', name: 'LinkedIn', icon: React.createElement(FiLinkedin, { size: 16 }), color: '#0077b5' },
  { id: 'medium', name: 'Medium', icon: React.createElement(SiMedium, { size: 16 }), color: '#00ab6c' },
  { id: 'tiktok', name: 'TikTok', icon: React.createElement(SiTiktok, { size: 16 }), color: '#ff0050' },
  { id: 'twitch', name: 'Twitch', icon: React.createElement(FiTwitch, { size: 16 }), color: '#9146ff' },
  { id: 'twitter', name: 'X (Twitter)', icon: React.createElement(SiX, { size: 16 }), color: '#1da1f2' },
  { id: 'website', name: 'Website', icon: React.createElement(FiGlobe, { size: 16 }), color: '#10b981' },
  { id: 'youtube', name: 'YouTube', icon: React.createElement(FiYoutube, { size: 16 }), color: '#ff0000' },
].sort((a, b) => a.name.localeCompare(b.name));

export const getSocialPlatform = (id: string): SocialPlatform | undefined => {
  return SOCIAL_PLATFORMS.find(platform => platform.id.toLowerCase() === id.toLowerCase());
};
