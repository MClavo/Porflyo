import React from "react";
import type { PortfolioSection, PublicUserDto } from "../../types/dto";
import { readMeta } from "./types";

interface SocialsRendererProps {
  variant: string;
  items: PortfolioSection[];
  user: PublicUserDto;
}

export const SocialsRenderer: React.FC<SocialsRendererProps> = ({ variant, items, user }) => {
  // Find socialLinks item or synthesize from user.socials
  let socialLinksItem = items.find(item => {
    const meta = readMeta(item);
    return meta?.sectionType === "socialLinks";
  });

  // If no social links item and user has socials, synthesize one
  if (!socialLinksItem && user.socials) {
    socialLinksItem = {
      id: "synthetic-socials",
      title: "Connect",
      content: "",
      data: user.socials
    } as PortfolioSection;
  }

  if (!socialLinksItem) {
    return (
      <div className="socials-section">
        <h2 className="section-title">Connect</h2>
        <div className="text-center" style={{ color: 'var(--pf-text-secondary)' }}>
          No social links available
        </div>
      </div>
    );
  }

  const title = (socialLinksItem.title as string) || "Connect";
  const socials = (socialLinksItem.data as Record<string, string>) || (user.socials as Record<string, string>) || {};

  const isCentered = variant === "centered";

  const socialPlatforms = [
    { key: 'github', label: 'GitHub', icon: '🐙' },
    { key: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { key: 'twitter', label: 'Twitter', icon: '🐦' },
    { key: 'instagram', label: 'Instagram', icon: '📷' },
    { key: 'website', label: 'Website', icon: '🌐' },
    { key: 'email', label: 'Email', icon: '📧' }
  ];

  const availableSocials = socialPlatforms.filter(platform => 
    socials[platform.key] || (platform.key === 'email' && user.email)
  );

  if (availableSocials.length === 0) {
    return (
      <div className="socials-section">
        <h2 className="section-title">Connect</h2>
        <div className="text-center" style={{ color: 'var(--pf-text-secondary)' }}>
          No social links configured
        </div>
      </div>
    );
  }

  const getSocialUrl = (platform: typeof socialPlatforms[0]) => {
    if (platform.key === 'email') {
      return `mailto:${user.email}`;
    }
    return socials[platform.key] as string;
  };

  return (
    <div className="socials-section">
      {isCentered ? (
        // Centered Layout
        <div className="text-center">
          <h2 className="section-title" style={{ textAlign: 'center' }}>{title}</h2>
          <div className="social-links">
            {availableSocials.map((platform) => (
              <a
                key={platform.key}
                href={getSocialUrl(platform)}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <span>{platform.icon}</span>
                <span>{platform.label}</span>
              </a>
            ))}
          </div>
        </div>
      ) : (
        // Inline Layout
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <h3 className="section-title" style={{ marginBottom: '1rem' }}>{title}</h3>
          <div className="social-links">
            {availableSocials.map((platform) => (
              <a
                key={platform.key}
                href={getSocialUrl(platform)}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <span>{platform.icon}</span>
                <span>{platform.label}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
