import { useState, useCallback } from 'react';
import apiServerClient from '@/lib/apiServerClient';


export function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiServerClient.get('/favorites');
      setFavorites(data);
    } catch (err) {
      setError(err.message || 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }, []);

  
  const toggleFavorite = useCallback(async (userId) => {
    try {
      const result = await apiServerClient.post(`/favorites/${userId}`);
      return result; // { favorited: true/false }
    } catch (err) {
      throw new Error(err.message || 'Failed to toggle favorite');
    }
  }, []);

 
  const checkFavoriteStatus = useCallback(async (userId) => {
    try {
      const result = await apiServerClient.get(`/favorites/${userId}/status`);
      return result.favorited;
    } catch {
      return false;
    }
  }, []);

  return {
    favorites,
    loading,
    error,
    fetchFavorites,
    toggleFavorite,
    checkFavoriteStatus,
  };
}
