/**
 * ModernOverview - Custom dashboard
 */


import { FiTrendingUp, FiClock, FiActivity, FiMonitor } from "react-icons/fi";

import { useDashboard } from "../hooks/useDashboard";
import { useOverviewData, useTrends } from "../hooks/metrics";
import { formatMs } from "../lib/format";  
import { useMetricsStore } from "../state/metrics.store";
import { latest } from "../lib/dates";
import { KpiCard, KpiGrid, DashboardHeader, SplitProgressBar, VisitsOverviewCard, ModernAreaChart, NoDataMessage } from "../components/dashboard";
import { getTimeRangeDays } from "../lib/timeRange";
import "../styles/dashboard-theme.css";

function ModernOverviewContent() {
  const { timeRange } = useDashboard();
  const days = getTimeRangeDays(timeRange);
  
  const overviewData = useOverviewData(days);
  const { isLoading } = overviewData;
  const trends = useTrends(days, "visits");
  const engagementTrends = useTrends(days, "engagement");
  const { dailyByDate, dailyIndex } = useMetricsStore();
  
  const latestDate = latest(dailyIndex);
  const latestEntry = latestDate ? dailyByDate[latestDate] : null;
  
  // Check if data is empty (no dailyAgg)
  const hasNoData = dailyIndex.length === 0;
  
  const hasError = (!overviewData.todayKpis && !isLoading && !hasNoData) || trends.error || engagementTrends.error;

  // Show no data message if there's no data
  if (hasNoData && !isLoading) {
    return <NoDataMessage />;
  }

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
  // avgSessionMinutes is in minutes
  const avgSessionMinutes = overviewData.todayKpis?.avgSessionMinutes ?? null;
  const deviceMix = overviewData.todayKpis?.deviceMix ?? null;
  
  const engagementRate = engagementTrends.summary.current;
  
  // Prefer computed todayKpis for conversions/quality; fallback to latestEntry.raw when missing
  const emailCopies = overviewData.todayKpis?.emailCopies ?? latestEntry?.raw?.emailCopies ?? 0;
  const views = overviewData.todayKpis?.totalViews ?? latestEntry?.raw?.views ?? 0;
  const conversionRate = (overviewData.todayKpis?.emailConversionPct != null)
    ? (overviewData.todayKpis!.emailConversionPct * 100).toFixed(1) + "%"
    : (views > 0 ? ((emailCopies / views) * 100).toFixed(1) + "%" : "N/A");

  const qualityVisitRate = (overviewData.todayKpis?.qualityVisitRatePct != null)
    ? (overviewData.todayKpis!.qualityVisitRatePct * 100).toFixed(1) + "%"
    : (views > 0 ? ((latestEntry?.raw?.qualityVisits || 0) / views * 100).toFixed(1) + "%" : "N/A");
  // Calculate change indicators
  const visitsChange = trends.summary.changePct;
  const engagementChange = engagementTrends.summary.changePct;

  const getChangeType = (change: number | null): "positive" | "negative" | "neutral" => {
    if (!change) return "neutral";
    if (Math.abs(change) < 5) return "neutral";
    return change > 0 ? "positive" : "negative";
  };

  // Prepare chart data from daily metrics
  const chartData = dailyIndex
    .slice(-days) // usar rango dinámico
    .map(date => {
      const dayData = dailyByDate[date];
      return {
        date,
        views: dayData?.raw?.views || 0,
        qualityViews: dayData?.raw?.qualityVisits || 0,
        emailCopies: dayData?.raw?.emailCopies || 0,
        socialClicks: dayData?.raw?.socialClicksTotal || 0
      };
    })
    .filter(item => item.views > 0) // filtrar días sin datos
    .reverse(); // invertir para mostrar fechas más recientes a la derecha

  const chartMetrics = [
    { key: 'views', name: 'Total Views', color: 'var(--chart-1, #3B82F6)' },
    { key: 'qualityViews', name: 'Quality Views', color: 'var(--chart-2, #10B981)' },
    { key: 'emailCopies', name: 'Email Copies', color: 'var(--chart-3, #F59E0B)' },
    { key: 'socialClicks', name: 'Social Clicks', color: 'var(--chart-4, #8B5CF6)' }
  ];

  // Debug logging
  console.log("ModernOverview metrics:", {
    totalVisits,
    avgSessionMinutes,
    deviceMix,
    engagementRate,
    conversionRate,
    qualityVisitRate,
    emailCopies,
    views,
    visitsChange,
    engagementChange,
    chartDataLength: chartData.length
  });

  return (
    <>

        <KpiGrid 
          columns={{ base: 1, sm: 2, md: 6, lg: 8, xl: 12 }}
        gap={6}
        >
          {/* Visits Overview Card - spans 3 columns */}
          <VisitsOverviewCard
            totalVisits={totalVisits}
            conversionRate={conversionRate}
            qualityVisitRate={qualityVisitRate}
            visitsChange={visitsChange ? {
              value: visitsChange,
              type: getChangeType(visitsChange)
            } : undefined}
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
                    value={isLoading ? "N/A" : (avgSessionMinutes != null ? `${avgSessionMinutes.toFixed(1)}m` : "N/A")}
                    subtitle="avg length"
                    icon={<FiClock />}
                    color="purple"
                    isLoading={isLoading}
                  />
          
                  <KpiCard
                    title="Time to Interact"
                    // prefer ttfi from latest engagement series, else heuristic: 0.7 * avgSessionMinutes
                    value={isLoading ? "N/A" : (() => {
                      const latestEng = overviewData.engagementSeries.length > 0 ? overviewData.engagementSeries[overviewData.engagementSeries.length - 1] : undefined;
                      const ttfi = latestEng && (latestEng as { tffiMeanMs?: number }).tffiMeanMs ? (latestEng as { tffiMeanMs?: number }).tffiMeanMs : null;
                      if (ttfi != null) return formatMs(ttfi);
                      if (avgSessionMinutes != null) {
                        // convert minutes to ms
                        const ms = avgSessionMinutes * 60 * 1000;
                        return formatMs(ms * 0.7);
                      }
                      return "N/A";
                    })()
                    }
                    subtitle="first interaction"
                    icon={<FiActivity />}
                    color="orange"
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

        {/* Modern Area Chart */}
        <ModernAreaChart 
          title="Engagement Trends"
          subtitle="Daily metrics overview showing visits, quality interactions, and conversions"
          height={400}
          data={chartData}
          metrics={chartMetrics}
        />
    </>
  );
}

export default function ModernOverview() {
  return <ModernOverviewContent />;
}
