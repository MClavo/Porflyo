/**
 * ProjectBubbleChart - Scatter plot showing project performance matrix
 */

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import type { TooltipProps } from './types';
import './charts.css';

export interface BubbleDataPoint {
  id: number | string;
  x: number;
  y: number;
  size: number;
  label?: string;
  [key: string]: unknown; // Allow additional properties
}

interface ProjectBubbleChartProps {
  data: BubbleDataPoint[];
  title: string;
  subtitle: string;
  height?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  sizeLabel?: string;
}

// Color palette for bubbles with variety
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

const BUBBLE_OPACITY = 0.7;

export const ProjectBubbleChart: React.FC<ProjectBubbleChartProps> = ({
  data,
  title,
  subtitle,
  height = 350,
  xAxisLabel = "X Axis",
  yAxisLabel = "Y Axis", 
  sizeLabel = "Size"
}) => {
  // Normalize bubble sizes for better visual distribution
  const sizes = data.map(p => p.size).filter(s => s > 0); // Remove zeros
  const minSize = sizes.length > 0 ? Math.min(...sizes) : 1;
  const maxSize = sizes.length > 0 ? Math.max(...sizes) : 1;
  const sizeRange = maxSize - minSize || 1; // Avoid division by zero
  
  // Debug size values
  console.log('Size distribution:', {
    originalSizes: data.map(p => p.size),
    minSize,
    maxSize,
    sizeRange
  });

  // Transform data for bubble chart
  const chartData = data.map((point, index) => {
    // More aggressive normalization for better visual differences
    let normalizedSize;
    if (point.size <= 0) {
      normalizedSize = 60; // Minimum for zero/negative values
    } else if (sizeRange === 0) {
      normalizedSize = 150; // Middle size when all values are the same
    } else {
      // Use more dramatic scaling: exponential for bigger differences
      const normalizedLinear = (point.size - minSize) / sizeRange;
      // Cubic scaling for more dramatic size differences
      const cubicNormalized = Math.pow(normalizedLinear, 0.6);
      normalizedSize = 60 + (cubicNormalized * 180); // Range 60-240
    }
    
    return {
      ...point, // Spread additional properties first
      x: point.x,
      y: point.y,
      z: Math.max(normalizedSize, 60), // Minimum 60 for visibility
      id: point.id,
      label: point.label || `Item ${point.id}`,
      rawX: point.x,
      rawY: point.y,
      rawSize: point.size,
      color: BUBBLE_COLORS[index % BUBBLE_COLORS.length]
    };
  });

  // Custom dot renderer for individual colors and sizes
  const renderCustomDot = (props: unknown): React.ReactElement => {
    const { cx, cy, payload } = props as { cx: number; cy: number; payload: typeof chartData[0] };
    
    // Default fallback if no payload
    if (!payload) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={4}
          fill="var(--chart-1)"
          fillOpacity={BUBBLE_OPACITY}
        />
      );
    }
    
    // Calculate radius from z value (size)
    const radius = Math.max((payload.z || 60) / 8, 4); // Scale down z for reasonable radius
    const color = payload.color || 'var(--chart-1)';
    
    return (
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={color}
        fillOpacity={BUBBLE_OPACITY}
        stroke={color}
        strokeWidth={2}
        style={{ cursor: 'pointer' }}
      />
    );
  };

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as typeof chartData[0] & Record<string, unknown>;
      
      return (
        <div className="tooltip">
          <div className="tooltip__header">
            {data.label}
          </div>
          <div className="tooltip__separator"></div>
          <div className="tooltip__content">
            <div className="tooltip__item">
              <span className="tooltip__name">{xAxisLabel}</span>
              <span className="tooltip__value">
                {typeof data.rawX === 'number' ? data.rawX.toFixed(1) : data.rawX}
              </span>
            </div>
            <div className="tooltip__item">
              <span className="tooltip__name">{yAxisLabel}</span>
              <span className="tooltip__value">
                {typeof data.rawY === 'number' ? data.rawY.toFixed(2) : data.rawY}
              </span>
            </div>
            <div className="tooltip__item">
              <span className="tooltip__name">{sizeLabel}</span>
              <span className="tooltip__value">
                {typeof data.rawSize === 'number' ? `${data.rawSize.toFixed(1)}s` : data.rawSize}
              </span>
            </div>
            {/* Show total interactions as bonus info */}
            {typeof data.totalInteractions === 'number' && (
              <div className="tooltip__item">
                <span className="tooltip__name">Total Interactions</span>
                <span className="tooltip__value">
                  {data.totalInteractions.toLocaleString()}
                </span>
              </div>
            )}
          </div>
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
          Bubble size represents {sizeLabel.toLowerCase()}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="var(--card-border)" 
            opacity={0.4}
          />
          <XAxis 
            type="number" 
            dataKey="x" 
            stroke="var(--text-secondary)"
            fontSize={12}
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
              return value.toString();
            }}
            label={{ 
              value: xAxisLabel, 
              position: 'insideBottom',
              offset: -10,
              style: { textAnchor: 'middle', fill: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500 }
            }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            stroke="var(--text-secondary)"
            fontSize={12}
            tickFormatter={(value) => `${value.toFixed(1)}%`}
            label={{ 
              value: yAxisLabel, 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500 }
            }}
          />
          <ZAxis type="number" dataKey="z" range={[60, 240]} />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ strokeDasharray: '3 3' }}
            animationDuration={100}
          />
          <Scatter
            name="Projects"
            data={chartData}
            fill="var(--chart-1)"
            shape={renderCustomDot}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProjectBubbleChart;