import { Title, Text } from '../cards/subcomponents';
import type { Mode } from '../cards/subcomponents/Fields.types';
import type { AboutSectionData } from './AboutSection.types';
import './AboutSection.css';

export interface AboutSectionProps {
  mode: Mode;
  data: AboutSectionData;
  onPatch?: (patch: Partial<AboutSectionData>) => void;
  className?: string;
}

export function AboutSection({ mode, data, onPatch, className }: AboutSectionProps) {
  const getSocialUrl = (platform: string, value: string) => {
    if (platform.toLowerCase() === 'email') {
      return `mailto:${value}`;
    }
    return value.startsWith('http') ? value : `https://${value}`;
  };

  const handleEmailClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const email = data.email;
    if (email) {
      navigator.clipboard.writeText(email).then(() => {
        const feedback = document.createElement('div');
        feedback.className = 'email-copy-feedback';
        feedback.textContent = 'Email copied to clipboard!';
        document.body.appendChild(feedback);
        
        setTimeout(() => {
          feedback.style.opacity = '0';
          feedback.style.transition = 'opacity 0.3s ease-out';
          setTimeout(() => feedback.remove(), 300);
        }, 3000);
      }).catch((err) => {
        console.error('Failed to copy email:', err);
        
        const errorFeedback = document.createElement('div');
        errorFeedback.className = 'email-copy-feedback error';
        errorFeedback.textContent = 'Failed to copy email';
        document.body.appendChild(errorFeedback);
        setTimeout(() => errorFeedback.remove(), 3000);
      });
    }
  };

  return (
    <div className={`about-section-container ${className || ''}`}>
      <div className="about-section-info">
        <div className="about-section-top">
          <div className="about-section-avatar">
            {data.profileImage ? (
              <img
                src={data.profileImage}
                alt={data.name || 'Profile'}
                className="about-avatar-image"
              />
            ) : (
              <div className="about-avatar-placeholder">
                {data.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>

          <div className="about-section-meta">
            <Title
              mode={mode}
              value={data.name}
              onChange={(name) => onPatch?.({ name })}
              placeholder="Your Name"
              className="about-section-name"
            />
            
            <div className="about-section-contact">
              {data.email && (
                <a 
                  href={`mailto:${data.email}`} 
                  className="about-contact-link"
                  onClick={handleEmailClick}
                >
                  {data.email}
                </a>
              )}
            </div>

            {data.socials && Object.keys(data.socials).length > 0 && (
              <div className="about-social-links">
                {Object.entries(data.socials).map(([platform, url]) => (
                  url ? (
                    <a
                      key={platform}
                      href={getSocialUrl(platform, url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`about-social-link ${platform.toLowerCase()}`}
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </a>
                  ) : null
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="about-section-description">
          <Text
            mode={mode}
            value={data.description}
            onChange={(description) => onPatch?.({ description })}
            placeholder="Enter your portfolio description here..."
            rows={1}
            className="about-description-text"
            maxLength={600}
          />
        </div>
      </div>
    </div>
  );
}

export default AboutSection;
