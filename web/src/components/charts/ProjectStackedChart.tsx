/**
 * ProjectStackedChart - Stacked bar chart showing code vs live view distribution
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { TooltipProps, LegendProps } from './types';

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

const CODE_COLOR = '#10B981'; // emerald
const LIVE_COLOR = '#3B82F6'; // blue

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
      
      return (
        <div style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3)',
          boxShadow: 'var(--shadow-lg)',
          fontSize: 'var(--font-sm)'
        }}>
          <p style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
            Project {label?.replace('P', '')}
          </p>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 2px 0', fontSize: 'var(--font-xs)' }}>
            Total Interactions: {total.toLocaleString()}
          </p>
          {payload.map((item, index) => (
            <p key={index} style={{ 
              color: item.color, 
              margin: '2px 0 0 0', 
              fontSize: 'var(--font-xs)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                backgroundColor: item.color,
                borderRadius: '2px',
                display: 'inline-block'
              }} />
              {item.name}: {item.value.toLocaleString()} ({total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'}%)
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: LegendProps) => {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: 'var(--space-4)',
        marginTop: 'var(--space-3)'
      }}>
        {payload?.map((entry, index) => (
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
              backgroundColor: entry.color,
              borderRadius: '2px'
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
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
          <XAxis 
            dataKey="name" 
            stroke="var(--text-secondary)"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke="var(--text-secondary)"
            fontSize={12}
            label={{ 
              value: 'Interactions', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: 'var(--text-secondary)', fontSize: '12px' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          <Bar 
            dataKey="codeViews" 
            stackId="interactions"
            fill={CODE_COLOR}
            name="Code Views"
            radius={[0, 0, 0, 0]}
          />
          <Bar 
            dataKey="liveViews" 
            stackId="interactions"
            fill={LIVE_COLOR}
            name="Live Views"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProjectStackedChart;