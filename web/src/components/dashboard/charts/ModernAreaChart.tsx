/**
 * ModernAreaChart - Gráfico de área moderno con múltiples métricas
 */

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import './ModernAreaChart.css';

export interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}

export interface ChartMetric {
  key: string;
  name: string;
  color: string;
  unit?: string;
}

export interface ModernAreaChartProps {
  title: string;
  subtitle?: string;
  data: ChartDataPoint[];
  metrics: ChartMetric[];
  height?: number;
  days?: number;
  isLoading?: boolean;
}

// Tipos para el tooltip
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    name: string;
    value: number | string;
  }>;
  label?: string;
}

// Componente de tooltip personalizado
const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  // Formatear fecha
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <div className="modern-tooltip">
      <div className="modern-tooltip__header">
        {label ? formatDate(label) : ''}
      </div>
      <div className="modern-tooltip__separator"></div>
      <div className="modern-tooltip__content">
        {payload.map((entry, index: number) => (
          <div key={index} className="modern-tooltip__item">
            <div 
              className="modern-tooltip__color-dot"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="modern-tooltip__name">{entry.name}</span>
            <span className="modern-tooltip__value">
              {typeof entry.value === 'number' 
                ? entry.value.toLocaleString() 
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente de loading skeleton
const ChartSkeleton: React.FC<{ height: number }> = ({ height }) => (
  <div className="chart-skeleton" style={{ height }}>
    <div className="chart-skeleton__content">
      <div className="skeleton skeleton__chart-area"></div>
      <div className="skeleton skeleton__chart-x-axis"></div>
      <div className="skeleton skeleton__chart-y-axis"></div>
    </div>
  </div>
);

export const ModernAreaChart: React.FC<ModernAreaChartProps> = ({
  title,
  subtitle,
  data,
  metrics,
  height = 300,

  isLoading = false
}) => {
  const [activeMetrics, setActiveMetrics] = useState<Set<string>>(
    new Set(metrics.map(m => m.key))
  );

  const toggleMetric = (metricKey: string) => {
    const newActiveMetrics = new Set(activeMetrics);
    if (newActiveMetrics.has(metricKey)) {
      newActiveMetrics.delete(metricKey);
    } else {
      newActiveMetrics.add(metricKey);
    }
    setActiveMetrics(newActiveMetrics);
  };

  if (isLoading) {
    return (
      <div className="modern-area-chart">
        <div className="modern-area-chart__header">
          <div className="skeleton skeleton__title"></div>
          <div className="skeleton skeleton__subtitle"></div>
        </div>
        <ChartSkeleton height={height} />
      </div>
    );
  }

  return (
    <div className="modern-area-chart">
      <div className="modern-area-chart__header">
        <div className="modern-area-chart__title-section">
          <h3 className="modern-area-chart__title">{title}</h3>
          {subtitle && (
            <p className="modern-area-chart__subtitle">{subtitle}</p>
          )}
        </div>

        {/* Legend personalizada con toggle */}
        <div className="modern-area-chart__legend">
          {metrics.map((metric) => (
            <button
              key={metric.key}
              className={`modern-legend-item ${
                activeMetrics.has(metric.key) ? 'modern-legend-item--active' : 'modern-legend-item--inactive'
              }`}
              onClick={() => toggleMetric(metric.key)}
            >
              <div 
                className="modern-legend-item__color"
                style={{ backgroundColor: metric.color }}
              ></div>
              <span className="modern-legend-item__name">{metric.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="modern-area-chart__container" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              {metrics.map((metric) => (
                <linearGradient
                  key={`gradient-${metric.key}`}
                  id={`gradient-${metric.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop 
                    offset="0%" 
                    stopColor={metric.color} 
                    stopOpacity={0.4}
                  />
                  <stop 
                    offset="100%" 
                    stopColor={metric.color} 
                    stopOpacity={0.05}
                  />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255, 255, 255, 0.1)"
              horizontal={true}
              vertical={false}
            />
            
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
            />
            
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                return value.toString();
              }}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: 'rgba(255, 255, 255, 0.2)',
                strokeWidth: 1,
                strokeDasharray: '4 4'
              }}
              animationDuration={0}
              animationEasing="linear"
              allowEscapeViewBox={{ x: false, y: false }}
              position={{ x: undefined, y: undefined }}
            />

            {metrics.map((metric) => (
              activeMetrics.has(metric.key) && (
                <Area
                  key={metric.key}
                  type="monotone"
                  dataKey={metric.key}
                  stroke={metric.color}
                  strokeWidth={2.5}
                  fill={`url(#gradient-${metric.key})`}
                  dot={false}
                  activeDot={{
                    r: 4,
                    stroke: metric.color,
                    strokeWidth: 2,
                    fill: 'var(--card-bg)'
                  }}
                />
              )
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ModernAreaChart;