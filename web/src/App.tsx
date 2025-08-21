import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomePage } from './routes/pages/HomePage';
import { DashboardPage } from './routes/pages/DashboardPage';
import ProfilePage from './routes/pages/ProfilePage';
import { Layout } from './components/layout/Layout';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          
          {/* Authenticated routes with Layout */}
          <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
          <Route path="/app/profile" element={<Layout><ProfilePage /></Layout>} />
          
          {/* Legacy redirects */}
          <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
          
          {/* 404 */}
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
