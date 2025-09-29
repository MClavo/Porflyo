/**
 * ProjectStackedChart - Stacked bar chart showing code vs live view distribution
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { TooltipProps, LegendProps } from './types';
import './modern-charts.css';

interface ProjectStackedChartProps {
  data: Array<{
    projectId: number;
    totalCodeViews: number;
    totalLiveViews: number;
    totalInteractions: number;
  }>;
  title: string;
  subtitle: string;
  height?: number;
}

const CODE_COLOR = 'var(--chart-success)'; // emerald from chart theme
const LIVE_COLOR = 'var(--chart-primary)'; // blue from chart theme

export const ProjectStackedChart: React.FC<ProjectStackedChartProps> = ({
  data,
  title,
  subtitle,
  height = 300
}) => {
  // Transform and sort data by total interactions (descending)
  const chartData = data
    .map((project) => ({
      name: `P${project.projectId}`,
      projectId: project.projectId,
      codeViews: project.totalCodeViews,
      liveViews: project.totalLiveViews,
      total: project.totalInteractions
    }))
    .sort((a, b) => b.total - a.total);

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, item) => sum + item.value, 0);
      // find live and code entries explicitly to enforce order
      const liveEntry = payload.find((p) => p.name === 'Live Views');
      const codeEntry = payload.find((p) => p.name === 'Code Views');

      return (
        <div className="project-stacked-tooltip">
          <div className="modern-tooltip__header">
            Project {label?.replace('P', '')}
          </div>
          <div className="modern-tooltip__separator"></div>
          <div className="modern-tooltip__content">
            <div className="modern-tooltip__item">
              <span className="modern-tooltip__name">Views</span>
              <span className="modern-tooltip__value">{total.toLocaleString()}</span>
            </div>

            {liveEntry && (
              <div className="modern-tooltip__item">
                <span className="modern-tooltip__name">Live</span>
                <span
                  className="modern-tooltip__value"
                  style={{ color: String(liveEntry.color) }}
                >
                  {liveEntry.value.toLocaleString()}
                </span>
              </div>
            )}

            {codeEntry && (
              <div className="modern-tooltip__item">
                <span className="modern-tooltip__name">Code</span>
                <span
                  className="modern-tooltip__value"
                  style={{ color: String(codeEntry.color) }}
                >
                  {codeEntry.value.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: LegendProps) => {
    return (
      <div className="modern-chart-legend" style={{ gap: 'var(--space-4)' }}>
        {payload?.map((entry, index) => (
          <div key={index} className="modern-legend-item">
            <div className="modern-legend-square" style={{
              backgroundColor: entry.color
            }} />
            {entry.value}
          </div>
        ))}
      </div>
    );
  };

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

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          barCategoryGap="20%"
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="var(--card-border)" 
            strokeOpacity={0.3}
            horizontal={true}
            vertical={false}
          />
          <XAxis 
            dataKey="name" 
            stroke="var(--text-secondary)"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={60}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
          />
          <YAxis 
            stroke="var(--text-secondary)"
            fontSize={12}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
              return value.toString();
            }}
            label={{ 
              value: 'Interactions', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: 'var(--text-secondary)', fontSize: '12px' }
            }}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              fill: 'var(--card-bg-hover)',
              fillOpacity: 0.1,
              stroke: 'var(--primary-color)',
              strokeWidth: 1,
              strokeOpacity: 0.3
            }}
            animationDuration={100}
          />
          <Legend content={<CustomLegend />} />
          <Bar 
            dataKey="codeViews" 
            stackId="interactions"
            fill={CODE_COLOR}
            name="Code Views"
            style={{ cursor: 'pointer' }}
          />
          <Bar 
            dataKey="liveViews" 
            stackId="interactions"
            fill={LIVE_COLOR}
            name="Live Views"
            style={{ cursor: 'pointer' }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProjectStackedChart;