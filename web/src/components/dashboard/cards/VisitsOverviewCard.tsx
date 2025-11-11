/**
 * VisitsOverviewCard - Tarjeta agrupada para Total Visits, Conversion Rate y Quality Visit Rate
 */

import React from 'react';
import { FiTrendingDown, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { PercentageRing } from '../indicators/PercentageRing';
import './VisitsOverviewCard.css';

export interface VisitsOverviewCardProps {
  totalVisits: number;
  conversionRate: string; // "X.X%"
  qualityVisitRate: string; // "X.X%"
  visitsChange?: {
    value: number;
    type: 'positive' | 'negative' | 'neutral';
  };
  conversionChange?: {
    value: number;
    type: 'positive' | 'negative' | 'neutral';
  };
  qualityChange?: {
    value: number;
    type: 'positive' | 'negative' | 'neutral';
  };
  isLoading?: boolean;
}

export const VisitsOverviewCard: React.FC<VisitsOverviewCardProps> = ({
  totalVisits,
  conversionRate,
  qualityVisitRate,
  visitsChange,
  conversionChange,
  qualityChange,
  isLoading = false
}) => {
  const getChangeIcon = (type: 'positive' | 'negative' | 'neutral') => {
    if (type === 'positive') return <span className="change-icon positive"><FiTrendingUp /></span>;
    if (type === 'negative') return <span className="change-icon negative"><FiTrendingDown /></span>;
    return <span className="change-icon neutral">→</span>;
  };

  const getChangeText = (change: { value: number; type: string }) => {
    const absValue = Math.abs(change.value);
    const sign = change.value >= 0 ? '+' : '-';
    return `${sign}${absValue.toFixed(1)}%`;
  };

  const parsePercentage = (percentStr: string): number => {
    if (percentStr === 'N/A') return 0;
    return parseFloat(percentStr.replace('%', ''));
  };

  if (isLoading) {
    return (
      <div className="visits-overview-card visits-overview-card--loading">
        <div className="visits-overview-card__header">
          <div className="skeleton skeleton--icon"></div>
          <div className="skeleton skeleton--title"></div>
        </div>
        <div className="visits-overview-card__main">
          <div className="skeleton skeleton--visits"></div>
        </div>
        <div className="visits-overview-card__rates">
          <div className="visits-overview-card__rate">
            <div className="skeleton skeleton--ring"></div>
            <div className="skeleton skeleton--rate-label"></div>
          </div>
          <div className="visits-overview-card__rate">
            <div className="skeleton skeleton--ring"></div>
            <div className="skeleton skeleton--rate-label"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="visits-overview-card">
      <div className="visits-overview-card__header">
        <div className="visits-overview-card__icon">
          <FiUsers />
        </div>
        <div className="visits-overview-card__title">
          Total Visits Overview
        </div>
      </div>
      
      <div className="visits-overview-card__main">
        <div className="visits-overview-card__visits">
          <span className="visits-overview-card__visits-number">
            {totalVisits.toLocaleString()}
          </span>
          {visitsChange && (
            <div className={`visits-overview-card__change visits-overview-card__change--${visitsChange.type}`}>
              {getChangeIcon(visitsChange.type)}
              <span className="change-value">
                {getChangeText(visitsChange)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="visits-overview-card__rates">
        <div className="visits-overview-card__rate">
          <div className="visits-overview-card__rate-ring">
            <PercentageRing
              value={parsePercentage(qualityVisitRate)}
              size={56}
              thickness={6}
              animated={true}
            />
          </div>
          <div className="visits-overview-card__rate-info">
            <div className="visits-overview-card__rate-label">Quality Rate</div>
            {qualityChange && (
              <div className={`visits-overview-card__rate-change visits-overview-card__rate-change--${qualityChange.type}`}>
                {getChangeIcon(qualityChange.type)}
                <span className="change-value">
                  {getChangeText(qualityChange)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="visits-overview-card__rate">
          <div className="visits-overview-card__rate-ring">
            <PercentageRing
              value={parsePercentage(conversionRate)}
              size={56}
              thickness={6}
              animated={true}
            />
          </div>
          <div className="visits-overview-card__rate-info">
            <div className="visits-overview-card__rate-label">Conversion Rate</div>
            {conversionChange && (
              <div className={`visits-overview-card__rate-change visits-overview-card__rate-change--${conversionChange.type}`}>
                {getChangeIcon(conversionChange.type)}
                <span className="change-value">
                  {getChangeText(conversionChange)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitsOverviewCard;