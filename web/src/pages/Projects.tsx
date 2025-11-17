/**
 * Projects -  projects management page
 */

import { useEffect, useState, useMemo } from "react";
import { FiEye, FiActivity, FiClock, FiShare2, FiCode, FiAward } from "react-icons/fi";
import { useMetricsStore } from "../state/metrics.store";
import { useDashboard } from "../hooks/useDashboard";
import { getTimeRangeDays } from "../lib/timeRange";
import { KpiCard, KpiGrid, DashboardHeader, NoDataMessage } from "../components/dashboard";
import { ProjectDonutChart } from "../components/charts/ProjectDonutChart";
import { ProjectBubbleChart } from "../components/charts/ProjectBubbleChart";
import { ProjectStackedChart } from "../components/charts/ProjectStackedChart";
import { ProjectRankingCard } from "../components/dashboard/ProjectRankingCard";
import type { ProjectRaw } from "../api/types/slots.types";
import "../styles/dashboard-theme.css";
import "../styles/projects.css";

interface ProjectMetrics {
  projectId: number;
  totalCodeViews: number;
  totalLiveViews: number;
  totalInteractions: number;
  activeDays: number;
  avgSocialPlusEmailPerDay: number;
  avgEngagementOnActiveDays: number;
  avgActiveTimePerDay: number;
  codeToLiveRatio: number;
  socialDrivenInteractionRate: number;
  consistencyScore: number;
}

function ProjectsContent() {
  const [isReady, setIsReady] = useState(false);
  const { timeRange, getProjectName } = useDashboard();
  const days = getTimeRangeDays(timeRange);
  const { slotByDate, slotIndex, dailyByDate, isLoading } = useMetricsStore();

  // Simple readiness flag
  useEffect(() => {
    setTimeout(() => setIsReady(true), 200);
  }, []);

  // Calculate project metrics from slots data with global context
  const projectMetrics = useMemo((): ProjectMetrics[] => {
    const projectMap = new Map<number, {
      totalCodeViews: number;
      totalLiveViews: number;
      activeDays: number;
      dailySocialClicks: number[];
      dailyEngagement: number[];
      dailyActiveTime: number[];
      dailyInteractions: number[];
    }>();

    // Process selected time range of slots
    const relevantSlots = slotIndex.slice(0, days);
    
    relevantSlots.forEach(date => {
      const slot = slotByDate[date];
      const dailyData = dailyByDate[date];
      if (!slot?.projects || !dailyData) return;

      // Get daily global metrics
      const dailySocialClicks = dailyData.raw?.socialClicksTotal || 0;
      const dailyEmailCount = dailyData.raw?.emailCopies || 0;
      const dailySocialPlusEmail = dailySocialClicks + dailyEmailCount;
      const dailyEngagement = dailyData.derived?.engagementAvg || 0;
      const dailyActiveTime = dailyData.raw?.activeTime || 0;

      slot.projects.forEach((project: ProjectRaw) => {
        const projectInteractions = project.codeViews + project.liveViews;
        const hasActivity = projectInteractions > 0;
        
        const existing = projectMap.get(project.projectId) || {
          totalCodeViews: 0,
          totalLiveViews: 0,
          activeDays: 0,
          dailySocialClicks: [],
          dailyEngagement: [],
          dailyActiveTime: [],
          dailyInteractions: []
        };

        projectMap.set(project.projectId, {
          totalCodeViews: existing.totalCodeViews + project.codeViews,
          totalLiveViews: existing.totalLiveViews + project.liveViews,
          activeDays: existing.activeDays + (hasActivity ? 1 : 0),
          dailySocialClicks: hasActivity ? [...existing.dailySocialClicks, dailySocialPlusEmail] : existing.dailySocialClicks,
          dailyEngagement: hasActivity ? [...existing.dailyEngagement, dailyEngagement] : existing.dailyEngagement,
          dailyActiveTime: hasActivity ? [...existing.dailyActiveTime, dailyActiveTime] : existing.dailyActiveTime,
          dailyInteractions: [...existing.dailyInteractions, projectInteractions]
        });
      });
    });

    return Array.from(projectMap.entries()).map(([projectId, data]) => {
      const totalInteractions = data.totalCodeViews + data.totalLiveViews;
      const avgSocialPlusEmailPerDay = data.dailySocialClicks.length > 0 
        ? data.dailySocialClicks.reduce((a, b) => a + b, 0) / data.dailySocialClicks.length 
        : 0;
      const avgEngagementOnActiveDays = data.dailyEngagement.length > 0 
        ? data.dailyEngagement.reduce((a, b) => a + b, 0) / data.dailyEngagement.length 
        : 0;
      const avgActiveTimePerDay = data.dailyActiveTime.length > 0 
        ? data.dailyActiveTime.reduce((a, b) => a + b, 0) / data.dailyActiveTime.length / 10 // Convert ds to seconds
        : 0;
      const codeToLiveRatio = data.totalLiveViews > 0 ? data.totalCodeViews / data.totalLiveViews : data.totalCodeViews;
      const socialDrivenInteractionRate = avgSocialPlusEmailPerDay > 0 ? totalInteractions / (avgSocialPlusEmailPerDay * data.activeDays) : 0;
      
      // Calculate consistency score (inverse of coefficient of variation)
      const dailyInteractions = data.dailyInteractions.filter(x => x > 0);
      const consistencyScore = dailyInteractions.length > 1 
        ? (() => {
            const mean = dailyInteractions.reduce((a, b) => a + b, 0) / dailyInteractions.length;
            const variance = dailyInteractions.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / dailyInteractions.length;
            const stdDev = Math.sqrt(variance);
            return mean > 0 ? Math.max(0, 1 - (stdDev / mean)) : 0;
          })()
        : 1;
      
      return {
        projectId,
        totalCodeViews: data.totalCodeViews,
        totalLiveViews: data.totalLiveViews,
        totalInteractions,
        activeDays: data.activeDays,
        avgSocialPlusEmailPerDay,
        avgEngagementOnActiveDays,
        avgActiveTimePerDay,
        codeToLiveRatio,
        socialDrivenInteractionRate,
        consistencyScore
      };
    }).sort((a, b) => b.totalInteractions - a.totalInteractions);
  }, [slotByDate, slotIndex, dailyByDate, days]);

  // Aggregate KPIs
  const aggregateKpis = useMemo(() => {
    const totalProjectInteractions = projectMetrics.reduce((sum, p) => sum + p.totalInteractions, 0);
    const activeProjects = projectMetrics.filter(p => p.totalInteractions > 0).length;
    const avgSocialDrivenRate = projectMetrics.length > 0 
      ? projectMetrics.reduce((sum, p) => sum + p.socialDrivenInteractionRate, 0) / projectMetrics.length 
      : 0;
    const avgCodeToLiveRatio = projectMetrics.length > 0 
      ? projectMetrics.reduce((sum, p) => sum + p.codeToLiveRatio, 0) / projectMetrics.length 
      : 0;
    const avgConsistencyScore = projectMetrics.length > 0 
      ? projectMetrics.reduce((sum, p) => sum + p.consistencyScore, 0) / projectMetrics.length 
      : 0;
    const avgEngagementOnActiveDays = projectMetrics.length > 0 
      ? projectMetrics.reduce((sum, p) => sum + p.avgEngagementOnActiveDays, 0) / projectMetrics.length 
      : 0;
    const topProject = projectMetrics[0];
    const mostConsistentProject = [...projectMetrics].sort((a, b) => b.consistencyScore - a.consistencyScore)[0];

    return {
      totalProjectInteractions,
      activeProjects,
      avgSocialDrivenRate,
      avgCodeToLiveRatio,
      avgConsistencyScore,
      avgEngagementOnActiveDays,
      topProjectId: topProject?.projectId || 0,
      topProjectInteractions: topProject?.totalInteractions || 0,
      mostConsistentProjectId: mostConsistentProject?.projectId || 0,
      mostConsistentScore: mostConsistentProject?.consistencyScore || 0
    };
  }, [projectMetrics]);

  // Data is ready, proceed with rendering
  
  if (isLoading || !isReady) {
    return (
      <div className="projects-container">
        <DashboardHeader 
          title="Projects Analytics"
          subtitle="Project performance and interaction insights"
          isLoading={true}
        />
      </div>
    );
  }

  // Check if data is empty (no dailyAgg or slots)
  const hasNoData = slotIndex.length === 0 && projectMetrics.length === 0;
  
  if (hasNoData) {
    return <NoDataMessage title="No projects data available" />;
  }

  if (projectMetrics.length === 0) {
    return (
      <div className="projects-container">
        <DashboardHeader 
          title="Projects Analytics"
          subtitle="No project data available for the selected time range"
          isLoading={false}
        />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: 'var(--space-4)', opacity: 0.5 }}>📈</div>
          <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginBottom: 'var(--space-2)' }}>
            No Project Data
          </h2>
          <p style={{ fontSize: 'var(--font-base)', maxWidth: '400px', lineHeight: 1.6, margin: 0 }}>
            Project metrics will appear here once you have portfolio activity data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-container">
      <DashboardHeader 
        title="Projects Analytics"
        subtitle={`Performance insights across ${projectMetrics.length} projects`}
        isLoading={false}
      />

      {/* KPI Grid */}
      <KpiGrid columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 6 }} gap={6}>
        <KpiCard
          title="Total Interactions"
          value={aggregateKpis.totalProjectInteractions.toLocaleString()}
          subtitle="code + live clicks"
          icon={<FiActivity />}
          color="blue"
          isLoading={false}
        />
        
        <KpiCard
          title="Social+Email Conversion"
          value={(aggregateKpis.avgSocialDrivenRate * 100).toFixed(1) + "%"}
          subtitle="social+email to interactions"
          icon={<FiShare2 />}
          color="green"
          isLoading={false}
        />
        
        <KpiCard
          title="Code Preference"
          value={aggregateKpis.avgCodeToLiveRatio.toFixed(1) + "x"}
          subtitle="code vs live ratio"
          icon={<FiCode />}
          color="purple"
          isLoading={false}
        />
        
        <KpiCard
          title="Active Projects"
          value={aggregateKpis.activeProjects.toString()}
          subtitle="with interactions"
          icon={<FiEye />}
          color="orange"
          isLoading={false}
        />
        
        <KpiCard
          title="Most Consistent"
          value={getProjectName(aggregateKpis.mostConsistentProjectId)}
          subtitle={`${(aggregateKpis.mostConsistentScore * 100).toFixed(0)}% consistency`}
          icon={<FiAward />}
          color="green"
          isLoading={false}
        />
        
        <KpiCard
          title="Engagement Quality"
          value={aggregateKpis.avgEngagementOnActiveDays.toFixed(2)}
          subtitle="avg engagement on active days"
          icon={<FiClock />}
          color="blue"
          isLoading={false}
        />
      </KpiGrid>

      {/* Main Charts Section - Stacked Chart + Donut */}
      <div className="projects-main-section">
        <div className="projects-stacked-container">
          <ProjectStackedChart 
            data={projectMetrics.slice(0, 8).map(p => ({
              ...p,
              projectName: getProjectName(p.projectId)
            }))}
            title="Code vs Live View Distribution"
            subtitle="Breakdown of interaction types by project"
          />
        </div>
        
        <div className="projects-donut-container">
          <ProjectDonutChart 
            data={projectMetrics.slice(0, 8).map(p => ({
              ...p,
              projectName: getProjectName(p.projectId)
            }))}
            title="Project Distribution"
            subtitle="Total interactions by project"
            totalInteractions={aggregateKpis.totalProjectInteractions}
          />
        </div>
      </div>

      {/* Bottom Row - Bubble Chart and Rankings */}
      <div className="projects-bottom-row">
        <ProjectBubbleChart 
          data={projectMetrics.slice(0, 10).map(p => ({
            id: p.projectId,
            x: p.avgSocialPlusEmailPerDay, // X-axis: social + email engagement
            y: p.avgEngagementOnActiveDays, // Y-axis: engagement quality
            size: p.avgActiveTimePerDay, // Size: time spent (indicates real interest)
            label: getProjectName(p.projectId),
            // Additional data for tooltip
            projectId: p.projectId,
            totalCodeViews: p.totalCodeViews,
            totalLiveViews: p.totalLiveViews,
            totalInteractions: p.totalInteractions,
            consistencyScore: p.consistencyScore,
            socialPlusEmailPerDay: p.avgSocialPlusEmailPerDay,
            engagementOnActiveDays: p.avgEngagementOnActiveDays,
            activeTimePerDay: p.avgActiveTimePerDay
          }))}
          title="Project Performance Matrix"
          subtitle="Social+Email reach vs engagement quality (size = active time)"
          xAxisLabel="Social+Email/Day"
          yAxisLabel="Engagement Score"
          sizeLabel="Active Time (sec)"
        />
        
        <ProjectRankingCard 
          data={projectMetrics.slice(0, 5).map(p => ({
            projectId: p.projectId,
            projectName: getProjectName(p.projectId),
            totalInteractions: p.totalInteractions,
            totalCodeViews: p.totalCodeViews,
            totalLiveViews: p.totalLiveViews,
            interactionRate: p.socialDrivenInteractionRate, // Use social-driven rate instead
            totalExposures: Math.round(p.avgSocialPlusEmailPerDay * p.activeDays) // Approx social+email exposure
          }))}
          title="Top Performing Projects"
          subtitle="Ranked by total interactions"
        />
      </div>
    </div>
  );
}

export default function Projects() {
  return (
    <div className="projects-page">
      <ProjectsContent />
    </div>
  );
}