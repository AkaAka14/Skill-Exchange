import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import Footer from '@/components/Footer.jsx';
import HomePage from '@/pages/HomePage.jsx';
import AuthPage from '@/pages/AuthPage.jsx';
import FavoritesPage from '@/pages/FavoritesPage';
import ProfilePage from '@/pages/ProfilePage.jsx';
import MatchesPage from '@/pages/MatchesPage.jsx';
import MessagesPage from '@/pages/MessagesPage.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Sidebar layout: sidebar fixed left, content scrolls right */}
        <div className="flex min-h-screen">
          <Sidebar />

          {/* Main content — offset on mobile for the fixed top bar */}
          <div className="flex flex-col flex-1 min-w-0 md:pt-0 pt-14">
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />

                <Route
                  path="/profile/:id/*"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/matches"
                  element={
                    <ProtectedRoute>
                      <MatchesPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/favorites"
                  element={
                    <ProtectedRoute>
                      <FavoritesPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <MessagesPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="*"
                  element={
                    <div className="flex flex-col items-center justify-center py-32 text-center px-4">
                      <h1 className="text-6xl font-heading font-bold text-white mb-4">404</h1>
                      <p className="text-muted-foreground mb-8 text-lg">
                        The page you're looking for doesn't exist.
                      </p>
                      <a href="/" className="text-primary hover:underline">
                        Return to Home
                      </a>
                    </div>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </div>

        <Toaster theme="dark" />
      </AuthProvider>
    </Router>
  );
}

export default App;