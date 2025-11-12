import { createRoot } from 'react-dom/client'
import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { OAuthCallback } from './components/auth/OAuthCallback'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import ShaderBackground from './components/ShaderBackground/ShaderBackgorund'
import { AuthProvider } from './contexts/AuthContext'
import { PortfoliosProvider } from './contexts/PortfoliosContext'
import { RepositoriesProvider } from './contexts/RepositoriesContext'
import { SavedSectionsProvider } from './contexts/SavedSectionsContext'
import { ThemeProvider } from './contexts/theme'
import { NavbarProvider } from './providers/NavbarProvider'
import Home from './pages/Home.tsx'
import MetricsTest from './pages/MetricsTest.tsx'
import ModernDashboard from './pages/ModernDashboard'
import ModernProjects from './pages/ModernProjects'
import PortfolioEditor from './pages/PortfolioEditor.tsx'
import ProfilePage from './pages/ProfilePage.tsx'
import PublicPortfolio from './pages/PublicPortfolio.tsx'
import Root from './pages/root.tsx'
import Test from './pages/Test.tsx'
import { SavedCardsProvider } from './state/SavedCards.context'
import './styles/dashboard-theme.css'
import './styles/modern-dashboard.css'
import './styles/professional-dashboard.css'
import './styles/theme.css'
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
    <ThemeProvider>
      <AuthProvider>
        <PortfoliosProvider>
          <SavedSectionsProvider>
            <RepositoriesProvider>
              <SavedCardsProvider>
                <NavbarProvider>
                  <BackgroundWrapper />
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
                    
                    {/* Metrics Dashboard Routes */}
                    
                    <Route path="/dashboard/:portfolioId" element={<ModernDashboard />} />
                    <Route path="/dashboard/:portfolioId/projects" element={<ModernProjects />} />
                    <Route path='/m-test' element={<MetricsTest />} />
                  </Routes>
              </NavbarProvider>
            </SavedCardsProvider>
          </RepositoriesProvider>
        </SavedSectionsProvider>
      </PortfoliosProvider>
    </AuthProvider>
    </ThemeProvider>
  )
}

function BackgroundWrapper() {
  const location = useLocation();
  const isPublicPortfolio = location.pathname.startsWith('/p/');
  useEffect(() => {
    // Only add the class when this route is NOT a public portfolio.
    if (isPublicPortfolio) return;

    // mark body so page-level backgrounds can be adjusted by CSS
    document.body.classList.add('has-shader');
    return () => {
      document.body.classList.remove('has-shader');
    };
  }, [isPublicPortfolio]);

  if (isPublicPortfolio) {
    return null;
  }
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
      pointerEvents: 'none'
    }}>
      <ShaderBackground />
    </div>
  );
}