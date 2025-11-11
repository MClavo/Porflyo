
import { FiMail, FiGithub, FiLinkedin, FiGlobe } from 'react-icons/fi';
import { Text, Title } from './subcomponents';
import type { Mode } from './subcomponents/Fields.types';
import type { AboutCardSaved } from '../../state/Cards.types';
import '../../styles/cards/AboutCard.css';

export interface AboutCardProps {
  mode: Mode;
  data: AboutCardSaved;
  onPatch?: (patch: Partial<AboutCardSaved>) => void;
  className?: string;
}

export function AboutCard({ mode, data, onPatch, className }: AboutCardProps) {
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'github':
        return <FiGithub />;
      case 'linkedin':
        return <FiLinkedin />;
      case 'email':
        return <FiMail />;
      default:
        return <FiGlobe />;
    }
  };

  const getSocialUrl = (platform: string, value: string) => {
    if (platform.toLowerCase() === 'email') {
      return `mailto:${value}`;
    }
    return value.startsWith('http') ? value : `https://${value}`;
  };

  return (
    <div className={`about-card ${className || ''}`}>
      {/* Profile Image */}
      <div className="about-profile-image">
        {data.profileImage ? (
          <img 
            src={data.profileImage} 
            alt={data.name || 'Profile'} 
            className="profile-avatar"
          />
        ) : (
          <div className="avatar-placeholder">
            {data.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}
      </div>

      {/* Name */}
      <Title
        mode={mode}
        value={data.name}
        onChange={(name) => onPatch?.({ name })}
        placeholder="Your Name"
        className="about-name"
      />

      {/* Description */}
      <Text
        mode={mode}
        value={data.description}
        onChange={(description) => onPatch?.({ description })}
        placeholder="Tell us about yourself..."
        rows={4}
        className="about-description"
      />

      {/* Email */}
      {(mode === 'edit' || data.email) && (
        <div className="about-email">
          <FiMail className="about-icon" />
          {mode === 'edit' ? (
            <input
              type="email"
              value={data.email || ''}
              onChange={(e) => onPatch?.({ email: e.target.value })}
              placeholder="your.email@example.com"
              className="about-email-input"
            />
          ) : data.email ? (
            <a href={`mailto:${data.email}`} className="about-email-link">
              {data.email}
            </a>
          ) : null}
        </div>
      )}

      {/* Social Links */}
      {data.socials && Object.keys(data.socials).length > 0 && (
        <div className="about-socials">
          {Object.entries(data.socials).map(([platform, url]) => (
            url ? (
              <a
                key={platform}
                href={getSocialUrl(platform, url)}
                target="_blank"
                rel="noopener noreferrer"
                className="about-social-link"
                title={platform}
              >
                {getSocialIcon(platform)}
                <span className="social-platform">{platform}</span>
              </a>
            ) : null
          ))}
        </div>
      )}
    </div>
  );
}