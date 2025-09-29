/**
 * ProjectBubbleChart - Scatter plot showing project performance matrix
 */

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import type { TooltipProps } from './types';

interface ProjectBubbleChartProps {
  data: Array<{
    projectId: number;
    totalExposures: number;
    interactionRate: number;
    totalViewTime: number;
    totalInteractions: number;
  }>;
  title: string;
  subtitle: string;
  height?: number;
}

// Color palette for bubbles - resolve from CSS variables if available
const DEFAULT_BUBBLE_COLOR = 'var(--chart-1, #3B82F6)';
const BUBBLE_OPACITY = 0.6;

const resolveBubbleColor = (): string => {
  try {
    const root = getComputedStyle(document.documentElement);
    const v = root.getPropertyValue('--chart-1').trim() || root.getPropertyValue('--accent-blue').trim();
    return v || DEFAULT_BUBBLE_COLOR;
  } catch {
    return DEFAULT_BUBBLE_COLOR;
  }
};

export const ProjectBubbleChart: React.FC<ProjectBubbleChartProps> = ({
  data,
  title,
  subtitle,
  height = 350
}) => {
  // Transform data for bubble chart
  const chartData = data.map((project) => ({
    x: project.totalExposures,
    y: project.interactionRate * 100, // Convert to percentage
    z: Math.max(project.totalViewTime / 10, 20), // Size (min 20 for visibility), convert ds to seconds
    projectId: project.projectId,
    exposures: project.totalExposures,
    interactionRate: project.interactionRate,
    viewTime: project.totalViewTime / 10, // Convert to seconds
    interactions: project.totalInteractions
  }));

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as typeof chartData[0];
      
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
            Project {data.projectId}
          </p>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: 'var(--font-xs)' }}>
            Exposures: {data.exposures.toLocaleString()}
          </p>
          <p style={{ color: 'var(--text-secondary)', margin: '2px 0 0 0', fontSize: 'var(--font-xs)' }}>
            Interaction Rate: {(data.interactionRate * 100).toFixed(1)}%
          </p>
          <p style={{ color: 'var(--text-secondary)', margin: '2px 0 0 0', fontSize: 'var(--font-xs)' }}>
            View Time: {data.viewTime.toFixed(1)}s
          </p>
          <p style={{ color: 'var(--text-secondary)', margin: '2px 0 0 0', fontSize: 'var(--font-xs)' }}>
            Total Interactions: {data.interactions}
          </p>
        </div>
      );
    }
    return null;
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
          margin: 0,
          marginBottom: 'var(--space-2)'
        }}>
          {subtitle}
        </p>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: 'var(--font-xs)', 
          margin: 0 
        }}>
          Bubble size represents view time
        </p>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Exposures"
            stroke="var(--text-secondary)"
            fontSize={12}
            label={{ 
              value: 'Total Exposures', 
              position: 'bottom',
              style: { textAnchor: 'middle', fill: 'var(--text-secondary)', fontSize: '12px' }
            }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Interaction Rate"
            stroke="var(--text-secondary)"
            fontSize={12}
            label={{ 
              value: 'Interaction Rate (%)', 
              angle: -90, 
              position: 'left',
              style: { textAnchor: 'middle', fill: 'var(--text-secondary)', fontSize: '12px' }
            }}
          />
          <ZAxis type="number" dataKey="z" range={[20, 200]} />
          <Tooltip content={<CustomTooltip />} />
          <Scatter
            name="Projects"
            data={chartData}
            fill={resolveBubbleColor()}
            fillOpacity={BUBBLE_OPACITY}
            stroke={resolveBubbleColor()}
            strokeWidth={1}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProjectBubbleChart;