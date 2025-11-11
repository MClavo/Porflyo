import React from 'react';
import './DashboardHeader.css';

export interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  isLoading?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  actions,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-header-text">
            <div className="dashboard-header-title skeleton">
              <div className="skeleton-line skeleton-line--title"></div>
            </div>
            {subtitle && (
              <div className="dashboard-header-subtitle skeleton">
                <div className="skeleton-line skeleton-line--subtitle"></div>
              </div>
            )}
          </div>
          {actions && (
            <div className="dashboard-header-actions">
              <div className="skeleton-line skeleton-line--action"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-header">
      <div className="dashboard-header-content">
        <div className="dashboard-header-text">
          <h1 className="dashboard-header-title">
            {title}
          </h1>
          {subtitle && (
            <p className="dashboard-header-subtitle">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="dashboard-header-actions">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;