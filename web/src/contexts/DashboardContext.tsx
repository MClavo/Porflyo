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
  portfolioId: string;
  setCurrentPage: (page: PageOption) => void;
  setTimeRange: (range: TimeRangeOption) => void;
  setPortfolioId: (id: string) => void;
}

export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
  portfolioId: string;
}

export function DashboardProvider({ children, portfolioId: initialPortfolioId }: DashboardProviderProps) {
  const [currentPage, setCurrentPage] = useState<PageOption>('overview');
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('1month');
  const [portfolioId, setPortfolioId] = useState<string>(initialPortfolioId);

  return (
    <DashboardContext.Provider
      value={{
        currentPage,
        timeRange,
        portfolioId,
        setCurrentPage,
        setTimeRange,
        setPortfolioId,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}