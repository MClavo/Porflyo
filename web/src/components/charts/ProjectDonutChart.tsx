/**
 * ProjectDonutChart - Donut chart showing project interaction distribution
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { TooltipProps, LegendProps } from './types';

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
}

// Color palette for projects
const COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EF4444', // red
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
];

const SEPARATOR_COLOR = 'rgba(0, 0, 0, 0.1)'; // Dark separator for better visibility

export const ProjectDonutChart: React.FC<ProjectDonutChartProps> = ({
  data,
  title,
  subtitle,
  height = 300
}) => {
  // Transform data for chart
  const chartData = data.map((project, index) => ({
    name: `Project ${project.projectId}`,
    value: project.totalInteractions,
    projectId: project.projectId,
    codeViews: project.totalCodeViews,
    liveViews: project.totalLiveViews,
    fill: COLORS[index % COLORS.length]
  }));

  // Calculate total for percentage
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as typeof chartData[0];
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';
      
      return (
        <div className="recharts-tooltip" style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3)',
          boxShadow: 'var(--shadow-lg)',
          fontSize: 'var(--font-sm)'
        }}>
          <p style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
            {data.name}
          </p>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: 'var(--font-xs)' }}>
            Total: {data.value.toLocaleString()} ({percentage}%)
          </p>
          <p style={{ color: 'var(--text-secondary)', margin: '2px 0 0 0', fontSize: 'var(--font-xs)' }}>
            Code: {data.codeViews} | Live: {data.liveViews}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: LegendProps) => {
    return (
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'center', 
        gap: 'var(--space-2)',
        marginTop: 'var(--space-3)'
      }}>
        {payload?.map((entry, index: number) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--space-1)',
            fontSize: 'var(--font-xs)',
            color: 'var(--text-secondary)'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
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
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2} // Small separator between segments
            dataKey="value"
            stroke={SEPARATOR_COLOR}
            strokeWidth={1}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProjectDonutChart;