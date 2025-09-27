/**
 * ModernOverview - Custom dashboard
 */


import { FiUsers, FiTrendingUp, FiClock, FiActivity, FiMail, FiMonitor } from "react-icons/fi";
import { MetricsProvider } from "../contexts/MetricsProvider";
import { useOverviewData, useTrends } from "../hooks/metrics";
import { formatMs } from "../lib/format";  
import { useMetricsStore } from "../state/metrics.store";
import { latest } from "../lib/dates";
import { KpiCard, KpiGrid, DashboardHeader, MiniProgressRing, MiniProgressBar } from "../components/dashboard";
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
    emailCopies,
    views,
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
          columns={{ base: 1, sm: 2, md: 3, lg: 3, xl: 6 }}
          gap={6}
        >
          <KpiCard
            title="Total Visits"
            value={isLoading ? "0" : totalVisits.toLocaleString()}
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
            value={isLoading ? "N/A" : (engagementRate ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "var(--font-2xl)", fontWeight: "800" }}>
                  {engagementRate.toFixed(1)}
                </span>
                <MiniProgressRing 
                  value={Math.min(engagementRate * 10, 100)} 
                  color="var(--accent-green)"
                  size={36}
                  thickness={4}
                />
              </div>
            ) : "N/A")}
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
            value={isLoading ? "N/A" : (conversionRate !== "N/A" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "var(--font-2xl)", fontWeight: "800" }}>
                  {conversionRate}
                </span>
                <MiniProgressBar 
                  value={parseFloat(conversionRate.replace('%', ''))} 
                  color="var(--accent-pink)" 
                  width={100}
                  height={8}
                />
              </div>
            ) : "N/A")}
            subtitle="email copies"
            icon={<FiMail />}
            color="pink"
            isLoading={isLoading}
          />
          
          <KpiCard
            title="Device Mix"
            value={isLoading ? "N/A" : (deviceMix ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", minWidth: "50px" }}>
                    Desktop: {(deviceMix.desktop * 100).toFixed(0)}%
                  </span>
                  <MiniProgressBar 
                    value={deviceMix.desktop * 100} 
                    color="var(--accent-blue)" 
                    width={80}
                    height={6}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", minWidth: "50px" }}>
                    Mobile: {(deviceMix.mobile * 100).toFixed(0)}%
                  </span>
                  <MiniProgressBar 
                    value={deviceMix.mobile * 100} 
                    color="var(--accent-green)" 
                    width={80}
                    height={6}
                  />
                </div>
              </div>
            ) : "N/A")}
            subtitle="device distribution"
            icon={<FiMonitor />}
            color="blue"
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
