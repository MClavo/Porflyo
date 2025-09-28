/**
 * DashboardContext - Estado compartido del dashboard moderno
 */

import { createContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { TimeRangeOption } from '../lib/timeRange';
import type { PageOption } from '../components/dashboard/layout/DashboardNavbar';

interface DashboardContextType {
  currentPage: PageOption;
  timeRange: TimeRangeOption;
  setCurrentPage: (page: PageOption) => void;
  setTimeRange: (range: TimeRangeOption) => void;
}

export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [currentPage, setCurrentPage] = useState<PageOption>('overview');
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('1month');

  return (
    <DashboardContext.Provider
      value={{
        currentPage,
        timeRange,
        setCurrentPage,
        setTimeRange,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}