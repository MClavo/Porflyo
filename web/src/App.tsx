import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomePage } from './routes/pages/HomePage';
import Root from './routes/pages/root';
import { DashboardPage } from './routes/pages/DashboardPage';
import ProfilePage from './routes/pages/ProfilePage';
import { Layout } from './components/layout/Layout';
//import { createPortfolio } from './features/portfolios/api/portfolios.api';
//import { PortfolioEditorPage } from './routes/pages/PortfolioEditorPage';
import PortfolioEditorPage from './features/portfolios/pages/PortfolioEditorPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Root />} />

            {/* Authenticated routes */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/portfolios/new" element={<PortfolioEditorPage />} />
            <Route path="/portfolios/:id/edit" element={<PortfolioEditorPage />} />

            {/* 404 */}
            <Route path="*" element={<div>Page not found</div>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
