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

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
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
            </Routes>
            </SavedCardsProvider>
          </RepositoriesProvider>
        </SavedSectionsProvider>
      </PortfoliosProvider>
    </AuthProvider>
  </BrowserRouter>
)