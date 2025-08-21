import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

// Placeholder components - these will be implemented later
const HomePage = () => <div>Home Page</div>;
const ProfilePage = () => <div>Profile Page</div>;
const PortfoliosPage = () => <div>Portfolios Page</div>;
const PortfolioDetailPage = () => <div>Portfolio Detail Page</div>;
const LoginPage = () => <div>Login Page</div>;
const NotFoundPage = () => <div>404 - Page Not Found</div>;

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
        
        {/* Portfolio public view routes */}
        <Route path="/portfolio/:username/:slug" element={<PortfolioDetailPage />} />
        <Route path="/u/:username" element={<ProfilePage />} />
        
        {/* Authenticated routes */}
        <Route path="/dashboard" element={<Navigate to="/portfolios" replace />} />
        <Route path="/portfolios" element={<PortfoliosPage />} />
        <Route path="/portfolios/:id" element={<PortfolioDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* Catch all - 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {children}
    </BrowserRouter>
  );
}

export default AppRouter;
