/**
 * ProjectDonutChart - Donut chart showing project interaction distribution
 */

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { TooltipProps } from './types';
import './modern-charts.css';

interface ProjectDonutChartProps {
  data: Array<{
    projectId: number;
    totalInteractions: number;
    totalCodeViews: number;
    totalLiveViews: number;
  }>;
  title: string;
  subtitle: string;
  height?: number;
  totalInteractions?: number;
}

// Palette referencing CSS variables with hex fallbacks to preserve current colors
const PALETTE = [
  'var(--chart-1, #3B82F6)',
  'var(--chart-2, #10B981)',
  'var(--chart-3, #F59E0B)',
  'var(--chart-4, #8B5CF6)',
  'var(--chart-5, #EF4444)',
  'var(--chart-6, #06B6D4)',
  'var(--chart-7, #84CC16)',
  'var(--chart-8, #F97316)'
];

const SEPARATOR_COLOR = 'var(--card-border)'; // Clean separator using CSS variable

export const ProjectDonutChart: React.FC<ProjectDonutChartProps> = ({
  data,
  title,
  subtitle,
  height = 300,
  totalInteractions
}) => {
  // Transform data for chart (memoized)
  const chartData = useMemo(() => {
    const palette = PALETTE;
    return data.map((project, index) => ({
      name: `Project ${project.projectId}`,
      value: project.totalInteractions,
      projectId: project.projectId,
      codeViews: project.totalCodeViews,
      liveViews: project.totalLiveViews,
      fill: palette[index % palette.length]
    }));
  }, [data]);

  // Calculate total for percentage (memoized)
  const total = useMemo(() => chartData.reduce((sum, item) => sum + item.value, 0), [chartData]);

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as typeof chartData[0];
      
      return (
        <div className="modern-tooltip">
          <div className="modern-tooltip__header">
            {data.name}
          </div>
          <div className="modern-tooltip__separator"></div>
          <div className="modern-tooltip__content">
            <div className="modern-tooltip__item">
              <div 
                className="modern-tooltip__color-dot"
                style={{ backgroundColor: data.fill }}
              ></div>
              <span className="modern-tooltip__name">Interactions</span>
              <span className="modern-tooltip__value">
                {data.value.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Center text component for displaying total
  const CenterText = () => (
    <div
      aria-hidden
      style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      pointerEvents: 'none',
      zIndex: 0 // keep below tooltip which we elevate explicitly
    }}>
      <div style={{
        fontSize: 'var(--font-lg)',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: 'var(--space-1)'
      }}>
        {totalInteractions?.toLocaleString() || total.toLocaleString()}
      </div>
      <div style={{
        fontSize: 'var(--font-xs)',
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        Total
      </div>
    </div>
  );

  return (
    <div style={{
      background: 'var(--card-bg)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-6)',
      border: '1px solid var(--card-border)',
      height: 'fit-content'
    }}>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <h3 style={{ 
          color: 'var(--text-primary)', 
          fontSize: 'var(--font-lg)', 
          fontWeight: 600, 
          margin: 0,
          marginBottom: 'var(--space-1)'
        }}>
          {title}
        </h3>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: 'var(--font-sm)', 
          margin: 0 
        }}>
          {subtitle}
        </p>
      </div>

      <div style={{ position: 'relative' }}>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              startAngle={90}
              endAngle={450}
              dataKey="value"
              stroke={SEPARATOR_COLOR}
              strokeWidth={2}
              paddingAngle={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
              {/* Ensure tooltip is rendered above center text and chart */}
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 2001 }} />
          </PieChart>
        </ResponsiveContainer>
        <CenterText />
      </div>
    </div>
  );
};

export default ProjectDonutChart;