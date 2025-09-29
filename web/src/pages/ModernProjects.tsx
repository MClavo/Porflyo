/**
 * ModernProjects - Modern projects management page
 */

import { useEffect, useState, useMemo } from "react";
import { FiTarget, FiEye, FiTrendingUp, FiActivity, FiClock } from "react-icons/fi";
import { MetricsProvider } from "../contexts/MetricsProvider";
import { useMetricsStore } from "../state/metrics.store";
import { useDashboard } from "../hooks/useDashboard";
import { getTimeRangeDays } from "../lib/timeRange";
import { KpiCard, KpiGrid, DashboardHeader } from "../components/dashboard";
import { ProjectDonutChart } from "../components/charts/ProjectDonutChart";
import { ProjectBubbleChart } from "../components/charts/ProjectBubbleChart";
import { ProjectStackedChart } from "../components/charts/ProjectStackedChart";
import { ProjectRankingCard } from "../components/dashboard/ProjectRankingCard";
import type { ProjectRaw } from "../api/types/slots.types";
import "../styles/dashboard-theme.css";
import "../styles/modern-projects.css";

interface ProjectMetrics {
  projectId: number;
  totalExposures: number;
  totalViewTime: number;
  totalCodeViews: number;
  totalLiveViews: number;
  avgViewTimePerExposure: number;
  totalInteractions: number;
  interactionRate: number;
  activeDays: number;
}

function ModernProjectsContent() {
  const [isReady, setIsReady] = useState(false);
  const { timeRange } = useDashboard();
  const days = getTimeRangeDays(timeRange);
  const { slotByDate, slotIndex, isLoading } = useMetricsStore();

  // Simple readiness flag
  useEffect(() => {
    setTimeout(() => setIsReady(true), 200);
  }, []);

  // Calculate project metrics from slots data
  const projectMetrics = useMemo((): ProjectMetrics[] => {
    const projectMap = new Map<number, {
      totalExposures: number;
      totalViewTime: number;
      totalCodeViews: number;
      totalLiveViews: number;
      activeDays: number;
    }>();

    // Process selected time range of slots
    const relevantSlots = slotIndex.slice(0, days);
    
    relevantSlots.forEach(date => {
      const slot = slotByDate[date];
      if (!slot?.projects) return;

      slot.projects.forEach((project: ProjectRaw) => {
        const existing = projectMap.get(project.projectId) || {
          totalExposures: 0,
          totalViewTime: 0,
          totalCodeViews: 0,
          totalLiveViews: 0,
          activeDays: 0
        };

        projectMap.set(project.projectId, {
          totalExposures: existing.totalExposures + project.exposures,
          totalViewTime: existing.totalViewTime + project.viewTime,
          totalCodeViews: existing.totalCodeViews + project.codeViews,
          totalLiveViews: existing.totalLiveViews + project.liveViews,
          activeDays: existing.activeDays + (project.exposures > 0 ? 1 : 0)
        });
      });
    });

    return Array.from(projectMap.entries()).map(([projectId, data]) => {
      const totalInteractions = data.totalCodeViews + data.totalLiveViews;
      return {
        projectId,
        totalExposures: data.totalExposures,
        totalViewTime: data.totalViewTime,
        totalCodeViews: data.totalCodeViews,
        totalLiveViews: data.totalLiveViews,
        avgViewTimePerExposure: data.totalExposures > 0 ? data.totalViewTime / data.totalExposures : 0,
        totalInteractions,
        interactionRate: data.totalExposures > 0 ? totalInteractions / data.totalExposures : 0,
        activeDays: data.activeDays
      };
    }).sort((a, b) => b.totalInteractions - a.totalInteractions);
  }, [slotByDate, slotIndex, days]);

  // Aggregate KPIs
  const aggregateKpis = useMemo(() => {
    const totalProjectExposures = projectMetrics.reduce((sum, p) => sum + p.totalExposures, 0);
    const totalProjectInteractions = projectMetrics.reduce((sum, p) => sum + p.totalInteractions, 0);
    const totalProjectViewTime = projectMetrics.reduce((sum, p) => sum + p.totalViewTime, 0);
    const activeProjects = projectMetrics.filter(p => p.totalExposures > 0).length;
    const avgInteractionRate = projectMetrics.length > 0 
      ? projectMetrics.reduce((sum, p) => sum + p.interactionRate, 0) / projectMetrics.length 
      : 0;
    const topProject = projectMetrics[0];

    return {
      totalProjectExposures,
      totalProjectInteractions,
      totalProjectViewTime: totalProjectViewTime / 10, // Convert ds to seconds
      activeProjects,
      avgInteractionRate,
      topProjectId: topProject?.projectId || 0,
      topProjectInteractions: topProject?.totalInteractions || 0
    };
  }, [projectMetrics]);

  // Data is ready, proceed with rendering
  
  if (isLoading || !isReady) {
    return (
      <div className="modern-projects-container" style={{ position: "relative", padding: 'var(--space-4) 0' }}>
        <DashboardHeader 
          title="Projects Analytics"
          subtitle="Project performance and interaction insights"
          isLoading={true}
        />
      </div>
    );
  }

  if (projectMetrics.length === 0) {
    return (
      <div className="modern-projects-container" style={{ position: "relative", padding: 'var(--space-4) 0' }}>
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
    <div className="modern-projects-container" style={{ position: "relative", padding: 'var(--space-4) 0' }}>
      <DashboardHeader 
        title="Projects Analytics"
        subtitle={`Performance insights across ${projectMetrics.length} projects`}
        isLoading={false}
      />

      {/* KPI Grid */}
      <KpiGrid columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 6 }} gap={6}>
        <KpiCard
          title="Total Exposures"
          value={aggregateKpis.totalProjectExposures.toLocaleString()}
          subtitle="project views"
          icon={<FiEye />}
          color="blue"
          isLoading={false}
        />
        
        <KpiCard
          title="Total Interactions"
          value={aggregateKpis.totalProjectInteractions.toLocaleString()}
          subtitle="code + live views"
          icon={<FiActivity />}
          color="green"
          isLoading={false}
        />
        
        <KpiCard
          title="Avg Interaction Rate"
          value={(aggregateKpis.avgInteractionRate * 100).toFixed(1) + "%"}
          subtitle="interactions per exposure"
          icon={<FiTarget />}
          color="purple"
          isLoading={false}
        />
        
        <KpiCard
          title="Active Projects"
          value={aggregateKpis.activeProjects.toString()}
          subtitle="with exposures"
          icon={<FiTrendingUp />}
          color="orange"
          isLoading={false}
        />
        
        <KpiCard
          title="Top Project"
          value={`Project ${aggregateKpis.topProjectId}`}
          subtitle={`${aggregateKpis.topProjectInteractions} interactions`}
          icon={<FiTarget />}
          color="green"
          isLoading={false}
        />
        
        <KpiCard
          title="View Time"
          value={`${aggregateKpis.totalProjectViewTime.toFixed(1)}s`}
          subtitle="total across projects"
          icon={<FiClock />}
          color="blue"
          isLoading={false}
        />
      </KpiGrid>

      {/* Main Charts Section - Stacked Chart + Donut */}
      <div className="modern-projects-main-section">
        <div className="modern-projects-stacked-container">
          <ProjectStackedChart 
            data={projectMetrics.slice(0, 8)}
            title="Code vs Live View Distribution"
            subtitle="Breakdown of interaction types by project"
          />
        </div>
        
        <div className="modern-projects-donut-container">
          <ProjectDonutChart 
            data={projectMetrics.slice(0, 8)} // Top 8 projects
            title="Project Distribution"
            subtitle="Total interactions by project"
            totalInteractions={aggregateKpis.totalProjectInteractions}
          />
        </div>
      </div>

      {/* Bottom Row - Bubble Chart and Rankings */}
      <div className="modern-projects-bottom-row">
        <ProjectBubbleChart 
          data={projectMetrics.slice(0, 10)}
          title="Project Performance Matrix"
          subtitle="Exposures vs Interaction Rate (size = view time)"
        />
        
        <ProjectRankingCard 
          data={projectMetrics.slice(0, 5)}
          title="Top Performing Projects"
          subtitle="Ranked by total interactions"
        />
      </div>

      {/* Debug info - only in development */}
      {import.meta.env.DEV && (
        <div style={{
          marginTop: "var(--space-6)",
          padding: "var(--space-3)",
          background: "rgba(0,0,0,0.1)",
          borderRadius: "var(--radius-md)",
          fontSize: "var(--font-xs)",
          color: "var(--text-secondary)",
        }}>
          <strong>Debug Info:</strong>
          <br />
          Projects Found: {projectMetrics.length}
          <br />
          Time Range: {days} days
          <br />
          Total Interactions: {aggregateKpis.totalProjectInteractions}
          <br />
          Slots Available: {slotIndex.length}
        </div>
      )}
    </div>
  );
}

export default function ModernProjects() {
  return (
    <div className="modern-projects-page">
      <MetricsProvider portfolioId="default">
        <ModernProjectsContent />
      </MetricsProvider>
    </div>
  );
}