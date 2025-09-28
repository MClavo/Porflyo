import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PortfoliosProvider } from './contexts/PortfoliosContext'
import { SavedSectionsProvider } from './contexts/SavedSectionsContext'
import { RepositoriesProvider } from './contexts/RepositoriesContext'
import { SavedCardsProvider } from './state/SavedCards.context'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { OAuthCallback } from './components/auth/OAuthCallback'
import Root from './pages/Root.tsx'
import Home from './pages/Home.tsx'
import Test from './pages/Test.tsx'
import EditorTest from './pages/EditorTest.tsx'
import ProfilePage from './pages/ProfilePage.tsx'
import PortfolioEditor from './pages/PortfolioEditor.tsx'
import PublicPortfolio from './pages/PublicPortfolio.tsx'
import MetricsTest from './pages/MetricsTest.tsx'
import { ChakraProvider } from '@chakra-ui/react'
import theme from './styles/theme'
import { Layout } from './components/layout/Layout'
import './styles/modern-dashboard.css'
import './styles/professional-dashboard.css'
import './styles/dashboard-theme.css'
import OverviewPage from './pages/OverviewPage'
import ModernDashboard from './pages/ModernDashboard'
import ModernDashboardTest from './pages/ModernDashboardTest'
import ModernProjects from './pages/ModernProjects'
import HeatmapPage from './pages/HeatmapPage'
import ProjectsPage from './pages/ProjectsPage'
import DailyPage from './pages/DailyPage'
import TrendsPage from './pages/TrendsPage'
// analytics initialization intentionally removed from global startup.
// When running MetricsTest we will initialize analytics locally there.

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/metrics-test" element={<MetricsTest />} />
      <Route path="/*" element={<AppWithProviders />} />
    </Routes>
  </BrowserRouter>
)

export function AppWithProviders() {
  return (
    <AuthProvider>
      <PortfoliosProvider>
        <SavedSectionsProvider>
          <RepositoriesProvider>
            <SavedCardsProvider>
              <Routes>
                <Route path="/" element={<Root />} />
                <Route path="/auth/callback" element={<OAuthCallback />} />

                {/* Public portfolio route - no authentication required */}
                <Route path="/p/:slug" element={<PublicPortfolio />} />

                <Route path="/home" element={
                    <ProtectedRoute fallback={<Root />}>
                      <Home />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/profile" element={
                  <ProtectedRoute fallback={<Root />}> 
                    <ProfilePage />
                  </ProtectedRoute>
                } />

                <Route path='/portfolios/new' element={
                  <ProtectedRoute fallback={<Root />}>
                    <PortfolioEditor />
                  </ProtectedRoute>
                } />
                <Route path='/portfolios/:id/edit' element={
                  <ProtectedRoute fallback={<Root />}>
                    <PortfolioEditor />
                  </ProtectedRoute>
                } />
                <Route path="/t" element={<Test />} />
                <Route path="/editor-test" element={<EditorTest />} />
                
                {/* Metrics Dashboard Routes */}
                <Route path="/dashboard" element={
                  <ChakraProvider value={theme}>
                    <Layout>
                      <OverviewPage />
                    </Layout>
                  </ChakraProvider>
                } />
                <Route path="/dashboard/overview" element={
                  <ChakraProvider value={theme}>
                    <Layout>
                      <OverviewPage />
                    </Layout>
                  </ChakraProvider>
                } />
                <Route path="/dashboard/modern" element={<ModernDashboard />} />
                <Route path="/dashboard/modern/projects" element={<ModernProjects />} />
                <Route path='/m-test' element={<MetricsTest />} />

                <Route path="/dashboard/test" element={
                  <ChakraProvider value={theme}>
                    <Layout>
                      <ModernDashboardTest />
                    </Layout>
                  </ChakraProvider>
                } />
                <Route path="/dashboard/heatmap" element={
                  <ChakraProvider value={theme}>
                    <Layout>
                      <HeatmapPage />
                    </Layout>
                  </ChakraProvider>
                } />
                <Route path="/dashboard/projects" element={
                  <ChakraProvider value={theme}>
                    <Layout>
                      <ProjectsPage />
                    </Layout>
                  </ChakraProvider>
                } />
                <Route path="/dashboard/daily" element={
                  <ChakraProvider value={theme}>
                    <Layout>
                      <DailyPage />
                    </Layout>
                  </ChakraProvider>
                } />
                <Route path="/dashboard/trends" element={
                  <ChakraProvider value={theme}>
                    <Layout>
                      <TrendsPage />
                    </Layout>
                  </ChakraProvider>
                } />
              </Routes>
            </SavedCardsProvider>
          </RepositoriesProvider>
        </SavedSectionsProvider>
      </PortfoliosProvider>
    </AuthProvider>
  )
}