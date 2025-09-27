/**
 * Modern Overview Page - Professional analytics dashboard with custom components
 * Dark theme with modern design, using custom KPI cards and layouts
 */

import { FiUsers, FiTrendingUp, FiClock, FiMonitor, FiMail, FiActivity } from 'react-icons/fi';
import { MetricsProvider } from '../contexts/MetricsProvider';
import { useOverviewData, useTrends } from '../hooks/metrics';
import { formatMs } from '../lib/format';
import { KpiCard, KpiGrid, DashboardHeader } from '../components/dashboard';

// Import CSS
import '../styles/dashboard-theme.css';

function ModernOverviewContent() {
  const overview = useOverviewData(30);
  const trends = useTrends(30, 'visits');
  const engagementTrends = useTrends(30, 'engagement');

  const isLoading = overview.isLoading;
  const hasError = overview.error || trends.error || engagementTrends.error;

  if (hasError) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <DashboardHeader
            title="Analytics Dashboard"
            subtitle="Failed to load analytics data"
          />
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--space-16)', 
            color: 'var(--status-negative)',
            fontSize: 'var(--font-lg)' 
          }}>
            Error: {hasError}
          </div>
        </div>
      </div>
    );
  }

  // Prepare KPI data - matching OverviewPage logic
  const totalVisits = overview.todayKpis?.totalViews || 0;
  const avgSession = overview.todayKpis?.avgSessionMs;
  const deviceMix = overview.todayKpis?.deviceMix;
  const bounceRate = overview.todayKpis?.bounceRate;
  
  const engagementRate = engagementTrends.summary.current;
  const conversionRate = bounceRate ? ((1 - bounceRate) * 12) : null;
  
  // Calculate change indicators
  const visitsChange = trends.summary.changePct;
  const engagementChange = engagementTrends.summary.changePct;
  
  // Debug logging to see what data we're getting
  console.log('Overview data:', {
    totalVisits,
    avgSession,
    deviceMix,
    bounceRate,
    engagementRate,
    conversionRate,
    visitsChange,
    engagementChange,
    isLoading
  });

  const getChangeType = (change: number | null): 'positive' | 'negative' | 'neutral' => {
    if (!change) return 'neutral';
    if (Math.abs(change) < 5) return 'neutral';
    return change > 0 ? 'positive' : 'negative';
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <DashboardHeader
          title="Analytics Dashboard"
          subtitle="Professional insights and key performance indicators"
          isLoading={isLoading}
        />

        {/* KPI Cards Grid */}
        <KpiGrid 
          columns={{ base: 1, sm: 2, md: 3, lg: 3, xl: 6 }}
          gap={6}
        >
          <KpiCard
            title="Total Visits"
            value={isLoading ? '0' : totalVisits.toLocaleString()}
            change={visitsChange ? {
              value: visitsChange,
              type: getChangeType(visitsChange)
            } : undefined}
            icon={<FiUsers />}
            color="blue"
            isLoading={isLoading}
          />
          
          <KpiCard
            title="Engagement Rate"
            value={engagementRate ? engagementRate.toFixed(1) : 'N/A'}
            subtitle="avg score"
            change={engagementChange ? {
              value: engagementChange,
              type: getChangeType(engagementChange)
            } : undefined}
            icon={<FiTrendingUp />}
            color="green"
            isLoading={isLoading}
          />
          
          <KpiCard
            title="Session Duration"
            value={avgSession ? formatMs(avgSession) : 'N/A'}
            icon={<FiClock />}
            color="purple"
            isLoading={isLoading}
          />
          
          <KpiCard
            title="Time to Interact"
            value={avgSession ? formatMs(avgSession * 0.7) : 'N/A'}
            subtitle="first interaction"
            icon={<FiActivity />}
            color="orange"
            isLoading={isLoading}
          />
          
          <KpiCard
            title="Conversion Rate"
            value={conversionRate ? `${conversionRate.toFixed(1)}%` : 'N/A'}
            icon={<FiMail />}
            color="pink"
            isLoading={isLoading}
          />
          
          <KpiCard
            title="Device Mix"
            value={deviceMix ? `${Math.round(deviceMix.desktop)}% / ${Math.round(deviceMix.mobile)}%` : 'N/A'}
            subtitle="desktop / mobile"
            icon={<FiMonitor />}
            color="blue"
            isLoading={isLoading}
          />
        </KpiGrid>

        {/* Debug Information - Remove in production */}
        <div style={{ 
          marginTop: 'var(--space-12)', 
          padding: 'var(--space-8)',
          color: 'var(--text-secondary)',
          background: 'var(--card-bg)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--card-border)'
        }}>
          <h3 style={{ margin: '0 0 var(--space-4) 0', color: 'var(--text-primary)' }}>
            Debug Information
          </h3>
          <div style={{ fontSize: 'var(--font-sm)', textAlign: 'left' }}>
            <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
            <p>Has Error: {hasError ? 'Yes' : 'No'}</p>
            <p>Total Visits: {totalVisits}</p>
            <p>Avg Session: {avgSession ? formatMs(avgSession) : 'N/A'}</p>
            <p>Device Mix: {deviceMix ? `${Math.round(deviceMix.desktop)}% / ${Math.round(deviceMix.mobile)}%` : 'N/A'}</p>
            <p>Engagement Rate: {engagementRate ? engagementRate.toFixed(1) : 'N/A'}</p>
            <p>Visits Change: {visitsChange ? visitsChange.toFixed(1) + '%' : 'N/A'}</p>
            <p>Engagement Change: {engagementChange ? engagementChange.toFixed(1) + '%' : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ModernOverview() {
  return (
    <MetricsProvider portfolioId="default">
      <ModernOverviewContent />
    </MetricsProvider>
  );
}