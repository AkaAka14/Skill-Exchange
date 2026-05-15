import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import HomePage from '@/pages/HomePage.jsx';
import AuthPage from '@/pages/AuthPage.jsx';
import ProfilePage from '@/pages/ProfilePage.jsx';
import MatchesPage from '@/pages/MatchesPage.jsx';
import MessagesPage from '@/pages/MessagesPage.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              
              <Route 
                path="/profile" 
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
                path="/messages" 
                element={
                  <ProtectedRoute>
                    <MessagesPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all route */}
              <Route 
                path="*" 
                element={
                  <div className="flex-1 flex flex-col items-center justify-center py-32 text-center px-4">
                    <h1 className="text-6xl font-heading font-bold text-white mb-4">404</h1>
                    <p className="text-muted-foreground mb-8 text-lg">The page you are looking for doesn't exist.</p>
                    <a href="/" className="text-primary hover:underline">Return to Home</a>
                  </div>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster theme="dark" />
      </AuthProvider>
    </Router>
  );
}

export default App;