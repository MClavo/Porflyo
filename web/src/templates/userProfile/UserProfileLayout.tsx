import React, { useState, useEffect } from 'react';
import type { TemplateLayoutComponentProps } from '../types';
import EditableSectionTitle from '../../components/portfolio/section/EditableSectionTitle';
import './userProfile.css';
import { normalizeSocials, ensureHttps } from '../../utils/profileUtils';
import type { SocialsLike } from '../../utils/profileUtils';

const UserProfileLayout: React.FC<TemplateLayoutComponentProps> = ({ 
  sections, 
  userInfo, 
  onSectionTitleUpdate, 
  onUserInfoUpdate,
  isEditable = true
}) => {
  const [localDescription, setLocalDescription] = useState(
    userInfo?.portfolioDescription || userInfo?.userProfile?.description || ''
  );
  const [isDescriptionInitialized, setIsDescriptionInitialized] = useState(false);

  const experience = sections.find(s => s.id === 'experience');
  const projects = sections.find(s => s.id === 'projects');
  const skills = sections.find(s => s.id === 'skills');
  const userSection = sections.find(s => s.id === 'user'); // Don't render this as a normal section

  // Initialize description only once when userInfo first loads
  useEffect(() => {
    if (!isDescriptionInitialized && userInfo) {
      const initialDescription = userInfo.portfolioDescription || userInfo.userProfile?.description || '';
      setLocalDescription(initialDescription);
      setIsDescriptionInitialized(true);
    }
  }, [userInfo, isDescriptionInitialized]);

  return (
    <div className="tpl-user-profile">
      {/* Hidden placeholder for user section - PortfolioLayout needs this to inject content */}
      {userSection && (
        <div id={userSection.id} style={{ display: 'none' }}>
          {/* PortfolioLayout will portal the user section content here, but we don't display it */}
        </div>
      )}

      {/* User Header Section */}
      <div className="user-header">
        <div className="user-info">
          <div className="user-top">
            <div className="user-avatar">
              {userInfo?.userProfile?.profileImageUrl ? (
                <img
                  src={userInfo.userProfile.profileImageUrl}
                  alt={userInfo.userProfile.name || 'Profile'}
                  className="avatar-image"
                />
              ) : (
                <div className="avatar-placeholder">
                  {userInfo?.userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>

            <div className="user-meta">
              <h1 className="user-name">
                {userInfo?.userProfile?.name || 'Your Name'}
              </h1>

              <div className="user-contact">
                {userInfo?.userProfile?.email && (
                  <a href={`mailto:${userInfo.userProfile.email}`} className="contact-link">
                    {userInfo.userProfile.email}
                  </a>
                )}
              </div>

              {/* Social Links: support multiple possible sources and render all provided keys dynamically */}
              {(() => {
                const profileObj = userInfo?.userProfile as unknown as Record<string, unknown> | undefined;
                const topLevelObj = userInfo as unknown as Record<string, unknown> | undefined;

                const socialsLike =
                  userInfo?.userProfile?.socialLinks ??
                  // some payloads use `socials` instead of `socialLinks`
                  (profileObj && (profileObj['socials'] as unknown as SocialsLike)) ??
                  // other shapes may attach socials at the top-level userInfo
                  (topLevelObj && (topLevelObj['socials'] as unknown as SocialsLike)) ??
                  undefined;

                const socials = normalizeSocials(socialsLike as SocialsLike);
                const entries = Object.entries(socials);
                if (entries.length === 0) return null;
                return (
                  <div className="social-links">
                    {entries.map(([platform, url]) => (
                      <a
                        key={platform}
                        href={ensureHttps(url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`social-link ${platform.toLowerCase()}`}
                      >
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </a>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="user-description">
            {isEditable ? (
              <textarea
                value={localDescription}
                onChange={(e) => {
                  setLocalDescription(e.target.value);
                  if (onUserInfoUpdate) {
                    onUserInfoUpdate({
                      ...userInfo,
                      portfolioDescription: e.target.value,
                    });
                  }
                }}
                placeholder="Enter your portfolio description..."
                className="description-textarea-direct"
                rows={3}
              />
            ) : (
              <div className="description-display-readonly">
                {localDescription || ''}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Portfolio Sections */}
      <div className="portfolio-content">
        {/* Experience Section */}
        {experience && (
          <div className="portfolio-section experience-section tpl-section" id={experience.id}>
            <EditableSectionTitle
              title={experience.title}
              sectionId={experience.id}
              onTitleUpdate={onSectionTitleUpdate}
              className="section-title"
            />
            {/* placeholder: PortfolioLayout will portal content here */}
          </div>
        )}

        {/* Projects and Skills Grid */}
        <div className="content-grid">
          {projects && (
            <div className="portfolio-section projects-section tpl-section" id={projects.id}>
              <EditableSectionTitle
                title={projects.title}
                sectionId={projects.id}
                onTitleUpdate={onSectionTitleUpdate}
                className="section-title"
              />
              {/* placeholder */}
            </div>
          )}

          {skills && (
            <div className="portfolio-section skills-section tpl-section" id={skills.id}>
              <EditableSectionTitle
                title={skills.title}
                sectionId={skills.id}
                onTitleUpdate={onSectionTitleUpdate}
                className="section-title"
              />
              {/* placeholder */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileLayout;
