import React from "react";
import type { PortfolioSection, PublicUserDto } from "../../types/dto";
import { readMeta } from "./types";

interface HeroRendererProps {
  variant: string;
  items: PortfolioSection[];
  user: PublicUserDto;
}

export const HeroRenderer: React.FC<HeroRendererProps> = ({ variant, items, user }) => {
  // Find profileHeader item or synthesize from user data
  const profileHeaderItem = items.find(item => {
    const meta = readMeta(item);
    return meta?.sectionType === "profileHeader";
  });

  // Extract data from item or fallback to user data
  const name = String(profileHeaderItem?.title || user.name || "Your Name");
  const description = String(profileHeaderItem?.description || profileHeaderItem?.content || user.description || "Welcome to my portfolio");
  const profileImage = Array.isArray(profileHeaderItem?.media) ? profileHeaderItem.media[0]?.url : user.profileImage;
  const email = user.email;

  const isPhotoLeft = variant === "photo-left";

  return (
    <div className="hero-section">
      <div className="max-w-6xl mx-auto">
        {isPhotoLeft ? (
          // Photo Left Layout
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="lg:w-1/3">
              {profileImage && (
                <div className="w-48 h-48 mx-auto lg:mx-0 rounded-full overflow-hidden" style={{ background: 'var(--pf-border)' }}>
                  <img
                    src={profileImage}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <div className="lg:w-2/3 text-center lg:text-left">
              <h1 className="hero-title">
                {name}
              </h1>
              <p className="hero-description max-w-2xl">
                {description}
              </p>
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="project-link"
                  style={{ 
                    display: 'inline-block',
                    padding: '0.75rem 1.5rem',
                    background: 'var(--pf-primary)',
                    color: 'white',
                    borderRadius: 'var(--pf-radius)',
                    textDecoration: 'none',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  Get in Touch
                </a>
              )}
            </div>
          </div>
        ) : (
          // Minimal Layout
          <div className="text-center">
            {profileImage && (
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-6" style={{ background: 'var(--pf-border)' }}>
                <img
                  src={profileImage}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <h1 className="hero-title" style={{ textAlign: 'center' }}>
              {name}
            </h1>
            <p className="hero-description max-w-2xl mx-auto" style={{ textAlign: 'center' }}>
              {description}
            </p>
            {email && (
              <a
                href={`mailto:${email}`}
                className="project-link"
                style={{ 
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  background: 'var(--pf-primary)',
                  color: 'white',
                  borderRadius: 'var(--pf-radius)',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                Contact Me
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
