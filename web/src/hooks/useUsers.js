import { useState, useCallback } from 'react';
import apiServerClient from '@/lib/apiServerClient';
import { useAuth } from '@/contexts/AuthContext.jsx';


export const useUsers = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAllUsers = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const  data  = await apiServerClient.get('/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const searchUsers = useCallback((query) => {
    if (!query) {
      getAllUsers();
      return;
    }

    const lowerQuery = query.toLowerCase();
    setUsers(prev => prev.filter(user =>
      user.name?.toLowerCase().includes(lowerQuery) ||
      user.skillsHave.some(s => s.skillName.toLowerCase().includes(lowerQuery)) ||
      user.skillsWant.some(s => s.skillName.toLowerCase().includes(lowerQuery))
    ));
  }, [getAllUsers]);

  return {
    users,
    isLoading,
    error,
    getAllUsers,
    searchUsers
  };
};
