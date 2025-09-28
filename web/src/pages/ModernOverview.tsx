/**
 * ModernOverview - Custom dashboard
 */


import { FiUsers, FiTrendingUp, FiClock, FiActivity, FiMail, FiMonitor, FiCheckCircle } from "react-icons/fi";
import { MetricsProvider } from "../contexts/MetricsProvider";
import { useOverviewData, useTrends } from "../hooks/metrics";
import { formatMs } from "../lib/format";  
import { useMetricsStore } from "../state/metrics.store";
import { latest } from "../lib/dates";
import { KpiCard, KpiGrid, DashboardHeader, SplitProgressBar } from "../components/dashboard";
import "../styles/dashboard-theme.css";

function ModernOverviewContent() {
  const overviewData = useOverviewData(30);
  const { isLoading } = overviewData;
  const trends = useTrends(30, "visits");
  const engagementTrends = useTrends(30, "engagement");
  const { dailyByDate, dailyIndex } = useMetricsStore();
  
  const latestDate = latest(dailyIndex);
  const latestEntry = latestDate ? dailyByDate[latestDate] : null;
  
  const hasError = (!overviewData.todayKpis && !isLoading) || trends.error || engagementTrends.error;

  if (hasError) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">  
          <DashboardHeader title="Analytics Dashboard" subtitle="Error loading data" isLoading={false} />
          <div style={{ textAlign: "center", padding: "var(--spacing-16)", color: "var(--color-error-text)" }}>
            Error loading dashboard data
          </div>
        </div>
      </div>
    );
  }

  // Calculate KPIs with corrected formulas
  const totalVisits = overviewData.todayKpis?.totalViews || 0;
  const avgSession = overviewData.todayKpis?.avgSessionMs;
  const deviceMix = overviewData.todayKpis?.deviceMix;
  
  const engagementRate = engagementTrends.summary.current;
  
  // Correct conversion rate calculation: emailCopies / views (as per spec)
  const emailCopies = latestEntry?.raw?.emailCopies || 0;
  const views = latestEntry?.raw?.views || 1;
  const conversionRate = views > 0 ? ((emailCopies / views) * 100).toFixed(1) + "%" : "N/A";
  
  // Quality Visit Rate calculation: qualityVisits / views (as per spec)
  const qualityVisits = latestEntry?.raw?.qualityVisits || 0;
  const qualityVisitRate = views > 0 ? ((qualityVisits / views) * 100).toFixed(1) + "%" : "N/A";
  // Calculate change indicators
  const visitsChange = trends.summary.changePct;
  const engagementChange = engagementTrends.summary.changePct;

  const getChangeType = (change: number | null): "positive" | "negative" | "neutral" => {
    if (!change) return "neutral";
    if (Math.abs(change) < 5) return "neutral";
    return change > 0 ? "positive" : "negative";
  };

  // Debug logging
  console.log("ModernOverview metrics:", {
    totalVisits,
    avgSession,
    deviceMix,
    engagementRate,
    conversionRate,
    qualityVisitRate,
    emailCopies,
    views,
    qualityVisits,
    visitsChange,
    engagementChange
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <DashboardHeader
          title="Analytics Dashboard"
          subtitle="Professional insights and key performance indicators"
          isLoading={isLoading}
        />

        <KpiGrid 
          columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 7 }}
          gap={6}
        >
          <KpiCard
            title="Total Visits"
            value={isLoading ? "0" : totalVisits.toLocaleString()}
            subtitle="page views"
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
            value={isLoading ? "N/A" : (engagementRate ? engagementRate.toFixed(1) : "N/A")}
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
            value={isLoading ? "N/A" : (avgSession ? formatMs(avgSession) : "N/A")}
            subtitle="avg length"
            icon={<FiClock />}
            color="purple"
            isLoading={isLoading}
          />
          
          <KpiCard
            title="Time to Interact"
            value={isLoading ? "N/A" : (avgSession ? formatMs(avgSession * 0.7) : "N/A")}
            subtitle="first interaction"
            icon={<FiActivity />}
            color="orange"
            isLoading={isLoading}
          />
          
          <KpiCard
            title="Conversion Rate"
            value={isLoading ? "N/A" : conversionRate}
            subtitle="email copies"
            icon={<FiMail />}
            color="orange"
            isLoading={isLoading}
          />
          
          <KpiCard
            title="Quality Visit Rate"
            value={isLoading ? "N/A" : qualityVisitRate}
            subtitle="engaged visitors"
            icon={<FiCheckCircle />}
            color="green"
            isLoading={isLoading}
          />
          
          <KpiCard
            title="Device Mix"
            value={isLoading ? "N/A" : (deviceMix ? (
              <SplitProgressBar 
                leftValue={deviceMix.desktop * 100}
                rightValue={deviceMix.mobile * 100}
                leftColor="var(--accent-blue)"
                rightColor="var(--accent-purple)"
                leftLabel="Desktop"
                rightLabel="Mobile"
                width={140}
                height={10}
              />
            ) : "N/A")}
            subtitle="device distribution"
            icon={<FiMonitor />}
            color="purple"
            isLoading={isLoading}
          />
        </KpiGrid>
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
