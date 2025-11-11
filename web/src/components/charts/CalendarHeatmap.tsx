/**
 * Calendar heatmap using @nivo/calendar
 */

import { Box, Skeleton } from '@chakra-ui/react';
import { ResponsiveCalendar } from '@nivo/calendar';

export interface CalendarHeatmapProps {
  data: Array<{
    day: string; // YYYY-MM-DD format
    value: number;
  }>;
  isLoading?: boolean;
  height?: number;
  from?: string; // Start date
  to?: string; // End date
}

export function CalendarHeatmap({ 
  data, 
  isLoading = false, 
  height = 200,
  from,
  to
}: CalendarHeatmapProps) {
  if (isLoading) {
    return <Skeleton height={`${height}px`} borderRadius="md" />;
  }

  // Auto-calculate date range if not provided
  const startDate = from || (data.length > 0 ? 
    data.reduce((min, item) => item.day < min ? item.day : min, data[0].day) :
    new Date().toISOString().split('T')[0]
  );
  
  const endDate = to || (data.length > 0 ? 
    data.reduce((max, item) => item.day > max ? item.day : max, data[0].day) :
    new Date().toISOString().split('T')[0]
  );

  return (
    <Box height={`${height}px`} width="100%">
      <ResponsiveCalendar
        data={data}
        from={startDate}
        to={endDate}
        emptyColor="var(--gray-100)"
        colors={[ 'var(--nivo-1)', 'var(--nivo-2)', 'var(--nivo-3)', 'var(--nivo-4)' ]}
        margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
        yearSpacing={40}
        monthBorderColor="var(--white)"
        dayBorderWidth={2}
        dayBorderColor="var(--white)"
        legends={[
          {
            anchor: 'bottom-right',
            direction: 'row',
            translateY: 36,
            itemCount: 4,
            itemWidth: 42,
            itemHeight: 36,
            itemsSpacing: 14,
            itemDirection: 'right-to-left'
          }
        ]}
        tooltip={({ day, value, color }) => (
              <div
            style={{
              background: 'var(--white)',
              padding: '12px 16px',
              border: '1px solid var(--muted-border)',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
              <strong>{new Date(day).toLocaleDateString('en-US', { 
              weekday: 'short',
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}</strong>
            <br />
            <span style={{ color }}>
              {value !== undefined ? value.toLocaleString() : 'No data'}
            </span>
          </div>
        )}
      />
    </Box>
  );
}