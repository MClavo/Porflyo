/**
 * Test page for Modern Dashboard Components
 */

import { FiUsers, FiTrendingUp, FiClock, FiMonitor, FiMail, FiActivity } from 'react-icons/fi';
import { KpiCard, KpiGrid, DashboardHeader } from '../components/dashboard';
import { SkeletonProvider } from '../components/dashboard/providers';

// Import CSS
import '../styles/dashboard-theme.css';

function TestContent() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <DashboardHeader
          title="Modern Dashboard Test"
          subtitle="Testing custom components with static data"
        />

        {/* Test KPI Cards with static data */}
        <KpiGrid 
          columns={{ base: 1, sm: 2, md: 3, lg: 3, xl: 6 }}
          gap={6}
        >
          <KpiCard
            title="Total Visits"
            value="12,400"
            change={{ value: 15.3, type: 'positive' }}
            icon={<FiUsers />}
            color="blue"
          />
          
          <KpiCard
            title="Engagement Rate"
            value="67.5"
            subtitle="avg score"
            change={{ value: -2.1, type: 'negative' }}
            icon={<FiTrendingUp />}
            color="green"
          />
          
          <KpiCard
            title="Session Duration"
            value="2m 34s"
            icon={<FiClock />}
            color="purple"
          />
          
          <KpiCard
            title="Time to Interact"
            value="1.8s"
            subtitle="first interaction"
            icon={<FiActivity />}
            color="orange"
          />
          
          <KpiCard
            title="Conversion Rate"
            value="18.7%"
            change={{ value: 8.9, type: 'positive' }}
            icon={<FiMail />}
            color="pink"
          />
          
          <KpiCard
            title="Device Mix"
            value="65% / 35%"
            subtitle="desktop / mobile"
            icon={<FiMonitor />}
            color="blue"
          />
        </KpiGrid>

        {/* Test Loading State */}
        <div style={{ marginTop: 'var(--space-12)' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-6)' }}>
            Loading State Test
          </h3>
          <KpiGrid 
            columns={{ base: 1, sm: 2, md: 3 }}
            gap={6}
          >
            <KpiCard
              title="Loading Card 1"
              value="0"
              icon={<FiUsers />}
              color="blue"
              isLoading={true}
            />
            
            <KpiCard
              title="Loading Card 2"
              value="0"
              icon={<FiTrendingUp />}
              color="green"
              isLoading={true}
            />
            
            <KpiCard
              title="Loading Card 3"
              value="0"
              icon={<FiClock />}
              color="purple"
              isLoading={true}
            />
          </KpiGrid>
        </div>
      </div>
    </div>
  );
}

export default function ModernDashboardTest() {
  return (
    <SkeletonProvider>
      <TestContent />
    </SkeletonProvider>
  );
}