/**
 * Portfolio heatmap visualization using ECharts overlay
 */

import { Box, Skeleton } from '@chakra-ui/react';
import EChartsReact from 'echarts-for-react';
import type { HeatmapMeta, HeatmapCell } from '../../api/types';

export interface PortfolioHeatmapProps {
  meta: HeatmapMeta;
  cells: HeatmapCell[];
  isLoading?: boolean;
  height?: number;
}

export function PortfolioHeatmap({ 
  meta, 
  cells, 
  isLoading = false, 
  height = 400 
}: PortfolioHeatmapProps) {
  if (isLoading) {
    return <Skeleton height={`${height}px`} borderRadius="md" />;
  }

  // Convert flat index to [row, col] coordinates
  const convertIndexToCoords = (index: number): [number, number] => {
    const row = Math.floor(index / meta.columns);
    const col = index % meta.columns;
    return [col, row]; // ECharts uses [x, y] format
  };

  // Prepare data for ECharts heatmap
  const heatmapData = cells.map(cell => {
    const [x, y] = convertIndexToCoords(cell.index);
    return [x, y, cell.value];
  });

  // Find max value for color scaling
  const maxValue = cells.length > 0 ? Math.max(...cells.map(c => c.value)) : 100;

  const option = {
    tooltip: {
      position: 'top',
      formatter: (params: { data: [number, number, number] }) => {
        const [x, y, value] = params.data;
        const index = y * meta.columns + x;
        const cell = cells.find(c => c.index === index);
        return `
          <div style="padding: 8px;">
            <strong>Position:</strong> (${x}, ${y})<br/>
            <strong>Value:</strong> ${value}<br/>
            ${cell ? `<strong>Interactions:</strong> ${cell.count}` : ''}
          </div>
        `;
      }
    },
    grid: {
      height: '80%',
      top: '10%'
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: meta.columns }, (_, i) => i),
      splitArea: {
        show: true
      },
      axisLabel: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      }
    },
    yAxis: {
      type: 'category',
      data: Array.from({ length: meta.rows }, (_, i) => i),
      splitArea: {
        show: true
      },
      axisLabel: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      }
    },
    visualMap: {
      min: 0,
      max: maxValue,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      inRange: {
        color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffcc', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
      },
      text: ['High', 'Low'],
      textStyle: {
        fontSize: 12
      }
    },
    series: [{
      name: 'Heatmap',
      type: 'heatmap',
      data: heatmapData,
      label: {
        show: false
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      animation: true,
      animationDuration: 1000
    }]
  };

  return (
    <Box position="relative" height={`${height}px`} width="100%">
      {/* Portfolio mock/background could go here */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="gray.50"
        borderRadius="md"
        border="1px solid"
        borderColor="gray.200"
      >
        {/* Placeholder for portfolio layout */}
        <Box
          position="absolute"
          top="20%"
          left="10%"
          right="10%"
          height="60%"
          bg="white"
          borderRadius="md"
          border="1px solid"
          borderColor="gray.300"
          opacity={0.3}
        />
      </Box>
      
      {/* ECharts heatmap overlay */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        pointerEvents="auto"
      >
        <EChartsReact
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </Box>
    </Box>
  );
}