// Types for user information that can be displayed in templates

export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  profileImageUrl?: string;
  description?: string;
  socialLinks?: SocialLinks;
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  twitter?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
}

export interface PortfolioUserInfo {
  userProfile?: UserProfile;
  portfolioDescription?: string; // This can be different from user description
}
