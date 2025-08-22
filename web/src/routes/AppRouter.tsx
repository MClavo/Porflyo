import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { PortfoliosListPage, PortfolioEditorPage, PublicPortfolioPage } from '../features/portfolios/pages';
import { NotFoundPage } from '../components/NotFoundPage';
import { Layout } from '../components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';

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
        
        {/* Public portfolio view */}
        <Route path="/p/:slug" element={<PublicPortfolioPage />} />
        
        {/* Legacy public routes (redirect to new format) */}
        <Route path="/portfolio/:username/:slug" element={<Navigate to="/p/:slug" replace />} />
        <Route path="/u/:username" element={<ProfilePage />} />
        
        {/* Authenticated routes */}
        <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
  <Route path="/portfolios" element={<Layout><PortfoliosListPage /></Layout>} />
  <Route path="/portfolios/new" element={<Layout><PortfolioEditorPage /></Layout>} />
  <Route path="/portfolios/:id/edit" element={<Layout><PortfolioEditorPage /></Layout>} />
        <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
        
        {/* Legacy routes (redirect to new format) */}
  <Route path="/portfolios" element={<Navigate to="/portfolios" replace />} />
  <Route path="/portfolios/:id" element={<Navigate to="/portfolios/:id/edit" replace />} />
        
        {/* Catch all - 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {children}
    </BrowserRouter>
  );
}

export default AppRouter;
