import React, { createContext, useContext, useState, useEffect } from 'react';
import apiServerClient from '@/lib/apiServerClient';
import { disconnectSocket } from '@/lib/socketClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const  data  = await apiServerClient.get('/auth/me');
        setCurrentUser(data.user);
        setIsAuthenticated(true);
      } catch (err) {

        localStorage.removeItem('token');
        setCurrentUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (email, password) => {
    const  data  = await apiServerClient.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setCurrentUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const signup = async ({ name, email, password }) => {
    const  data  = await apiServerClient.post('/auth/register', { name, email, password });
    localStorage.setItem('token', data.token);
    setCurrentUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    disconnectSocket();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  
  const updateCurrentUser = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  const value = {
    currentUser,
    isAuthenticated,
    login,
    signup,
    logout,
    updateCurrentUser,
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
