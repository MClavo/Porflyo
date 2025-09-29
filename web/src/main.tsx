import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { OAuthCallback } from './components/auth/OAuthCallback'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import { PortfoliosProvider } from './contexts/PortfoliosContext'
import { RepositoriesProvider } from './contexts/RepositoriesContext'
import { SavedSectionsProvider } from './contexts/SavedSectionsContext'
import { NavbarProvider } from './providers/NavbarProvider'
import EditorTest from './pages/EditorTest.tsx'
import Home from './pages/Home.tsx'
import MetricsTest from './pages/MetricsTest.tsx'
import ModernDashboard from './pages/ModernDashboard'
import ModernProjects from './pages/ModernProjects'
import PortfolioEditor from './pages/PortfolioEditor.tsx'
import ProfilePage from './pages/ProfilePage.tsx'
import PublicPortfolio from './pages/PublicPortfolio.tsx'
import Root from './pages/Root.tsx'
import Test from './pages/Test.tsx'
import { SavedCardsProvider } from './state/SavedCards.context'
import './styles/dashboard-theme.css'
import './styles/modern-dashboard.css'
import './styles/professional-dashboard.css'
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
              <NavbarProvider>
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
                  
                  <Route path="/dashboard/modern" element={<ModernDashboard />} />
                  <Route path="/dashboard/modern/projects" element={<ModernProjects />} />
                  <Route path='/m-test' element={<MetricsTest />} />
                </Routes>
              </NavbarProvider>
            </SavedCardsProvider>
          </RepositoriesProvider>
        </SavedSectionsProvider>
      </PortfoliosProvider>
    </AuthProvider>
  )
}