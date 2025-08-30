import React, { useState, useEffect } from 'react';
import type { TemplateLayoutComponentProps } from '../types';
import EditableSectionTitle from '../../components/portfolio/section/EditableSectionTitle';
import './userProfile.css';

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
        
        <div className="user-info">
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

          <div className="user-description">
            {isEditable ? (
              // Editable mode - direct textarea input
              <textarea
                value={localDescription}
                onChange={(e) => {
                  setLocalDescription(e.target.value);
                  // Auto-save on change
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
              // Read-only mode - just display the description
              <div className="description-display-readonly">
                {localDescription || ''}
              </div>
            )}
          </div>

          {/* Social Links */}
          {userInfo?.userProfile?.socialLinks && (
            <div className="social-links">
              {userInfo.userProfile.socialLinks.linkedin && (
                <a 
                  href={userInfo.userProfile.socialLinks.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link linkedin"
                >
                  LinkedIn
                </a>
              )}
              {userInfo.userProfile.socialLinks.github && (
                <a 
                  href={userInfo.userProfile.socialLinks.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link github"
                >
                  GitHub
                </a>
              )}
              {userInfo.userProfile.socialLinks.website && (
                <a 
                  href={userInfo.userProfile.socialLinks.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link website"
                >
                  Website
                </a>
              )}
              {userInfo.userProfile.socialLinks.twitter && (
                <a 
                  href={userInfo.userProfile.socialLinks.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link twitter"
                >
                  Twitter
                </a>
              )}
            </div>
          )}
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
