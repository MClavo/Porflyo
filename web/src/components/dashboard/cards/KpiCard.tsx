import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './KpiCard.css';

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: number;
    type: 'positive' | 'negative' | 'neutral';
  };
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
  isLoading?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  change,
  icon,
  color = 'blue',
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="kpi-card">
        <div className="kpi-card-header">
          <div className="kpi-card-icon skeleton">
            <Skeleton circle width={24} height={24} />
          </div>
          <div className="kpi-card-title">
            <Skeleton width={100} height={14} />
          </div>
        </div>
        <div className="kpi-card-content">
          <div className="kpi-card-value">
            <Skeleton width={80} height={30} />
          </div>
          {subtitle && (
            <div className="kpi-card-subtitle">
              <Skeleton width={60} height={12} />
            </div>
          )}
          <div className="kpi-card-change">
            <Skeleton width={50} height={16} />
          </div>
        </div>
      </div>
    );
  }

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  const getChangeIcon = () => {
    if (!change) return null;
    
    if (change.type === 'positive') {
      return <span className="change-icon positive">↗</span>;
    } else if (change.type === 'negative') {
      return <span className="change-icon negative">↘</span>;
    }
    return <span className="change-icon neutral">→</span>;
  };

  const getChangeText = () => {
    if (!change) return null;
    
    const absValue = Math.abs(change.value);
    const sign = change.value >= 0 ? '+' : '-';
    return `${sign}${absValue.toFixed(1)}%`;
  };

  return (
    <div className={`kpi-card kpi-card--${color}`}>
      <div className="kpi-card-header">
        {icon && (
          <div className="kpi-card-icon">
            {icon}
          </div>
        )}
        <div className="kpi-card-title">
          {title}
        </div>
      </div>
      
      <div className="kpi-card-content">
        <div className="kpi-card-value">
          {formatValue(value)}
        </div>
        
        {subtitle && (
          <div className="kpi-card-subtitle">
            {subtitle}
          </div>
        )}
        
        {change && (
          <div className={`kpi-card-change kpi-card-change--${change.type}`}>
            {getChangeIcon()}
            <span className="change-value">
              {getChangeText()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;