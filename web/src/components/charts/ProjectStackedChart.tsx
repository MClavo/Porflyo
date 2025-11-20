/**
 * ProjectStackedChart - Stacked bar chart showing code vs live view distribution
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { TooltipProps, LegendProps } from './types';
import './charts.css';

interface ProjectStackedChartProps {
  data: Array<{
    projectId: number;
    projectName?: string;
    totalCodeViews: number;
    totalLiveViews: number;
    totalInteractions: number;
  }>;
  title: string;
  subtitle: string;
  height?: number;
}

// Shared color palette for consistent theming across charts
const BUBBLE_COLORS = [
  'var(--chart-1, #3B82F6)', // Blue
  'var(--chart-2, #10B981)', // Green  
  'var(--chart-3, #F59E0B)', // Amber
  'var(--chart-4, #8B5CF6)', // Purple
  'var(--chart-5, #EF4444)', // Red
  'var(--chart-6, #06B6D4)', // Cyan
  'var(--chart-7, #84CC16)', // Lime
  'var(--chart-8, #F97316)', // Orange
];

const CODE_COLOR = 'var(--chart-success)'; // emerald from chart theme
const LIVE_COLOR = 'var(--chart-primary)'; // blue from chart theme

// Function to get project color based on project ID
const getProjectColor = (projectId: number): string => {
  return BUBBLE_COLORS[projectId % BUBBLE_COLORS.length];
};

export const ProjectStackedChart: React.FC<ProjectStackedChartProps> = ({
  data,
  title,
  subtitle,
  height = 300
}) => {
  // Transform and sort data by total interactions (descending)
  const chartData = data
    .map((project, index) => ({
      name: project.projectName || `Project ${project.projectId}`,
      shortName: `P${project.projectId}`,
      projectId: project.projectId,
      originalIndex: index, // Keep track of original order for color consistency
      codeViews: project.totalCodeViews,
      liveViews: project.totalLiveViews,
      total: project.totalInteractions
    }))
    .sort((a, b) => b.total - a.total);

  // Custom tick component for colored project names
  const CustomTick = (props: { x: number; y: number; payload: { value: string } }) => {
    const { x, y, payload } = props;
    
    // Find the project data by name
    const projectData = chartData.find(d => d.name === payload.value);
    const colorIndex = projectData?.originalIndex ?? 0;
    const color = getProjectColor(colorIndex);
    
    // Truncate long names for display
    const displayName = payload.value.length > 15 ? payload.value.substring(0, 12) + '...' : payload.value;
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={12} 
          textAnchor="end" 
          fill={color} 
          fontSize="12"
          fontWeight="600"
          transform="rotate(-45)"
        >
          {displayName}
        </text>
      </g>
    );
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, item) => sum + item.value, 0);
      // find live and code entries explicitly to enforce order
      const liveEntry = payload.find((p) => p.name === 'Live Views');
      const codeEntry = payload.find((p) => p.name === 'Code Views');

      // Find project data by name
      const projectData = chartData.find(d => d.name === label);
      const colorIndex = projectData?.originalIndex ?? 0;
      const projectColor = getProjectColor(colorIndex);

      return (
        <div className="project-stacked-tooltip">
          <div className="tooltip__header" style={{ color: projectColor, fontWeight: '600' }}>
            {label}
          </div>
          <div className="tooltip__separator"></div>
          <div className="tooltip__content">
            <div className="tooltip__item">
              <span className="tooltip__name">Views</span>
              <span className="tooltip__value">{total.toLocaleString()}</span>
            </div>

            {liveEntry && (
              <div className="tooltip__item">
                <span className="tooltip__name">Live</span>
                <span
                  className="tooltip__value"
                  style={{ color: String(liveEntry.color) }}
                >
                  {liveEntry.value.toLocaleString()}
                </span>
              </div>
            )}

            {codeEntry && (
              <div className="tooltip__item">
                <span className="tooltip__name">Code</span>
                <span
                  className="tooltip__value"
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
      <div className="chart-legend" style={{ gap: 'var(--space-4)' }}>
        {payload?.map((entry, index) => (
          <div key={index} className="legend-item">
            <div className="legend-square" style={{
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
            tick={CustomTick}
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