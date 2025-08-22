import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { PortfoliosListPage, PortfolioEditorPage, PublicPortfolioPage } from '../features/portfolios/pages';
import { NotFoundPage } from '../components/NotFoundPage';
import { Layout } from '../components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import { SlugFieldTestPage } from '../SlugFieldTestPage';

// Placeholder components for existing routes
const LoginPage = () => <div>Login Page</div>;

interface AppRouterProps {
  children?: ReactNode;
}

/**
 * Main application router configuration
 */
export function AppRouter({ children }: AppRouterProps) {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/test-slug" element={<SlugFieldTestPage />} />
        
        {/* Public portfolio view */}
        <Route path="/p/:slug" element={<PublicPortfolioPage />} />
        
        {/* Legacy public routes (redirect to new format) */}
        <Route path="/portfolio/:username/:slug" element={<Navigate to="/p/:slug" replace />} />
        <Route path="/u/:username" element={<ProfilePage />} />
        
        {/* Authenticated routes */}
        <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
        <Route path="/app/portfolios" element={<Layout><PortfoliosListPage /></Layout>} />
        <Route path="/app/portfolios/new" element={<Layout><PortfolioEditorPage /></Layout>} />
        <Route path="/app/portfolios/:id/edit" element={<Layout><PortfolioEditorPage /></Layout>} />
        <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
        
        {/* Legacy routes (redirect to new format) */}
        <Route path="/portfolios" element={<Navigate to="/app/portfolios" replace />} />
        <Route path="/portfolios/:id" element={<Navigate to="/app/portfolios/:id/edit" replace />} />
        
        {/* Catch all - 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {children}
    </BrowserRouter>
  );
}

export default AppRouter;
