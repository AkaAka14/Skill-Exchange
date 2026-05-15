import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';

export const useFavorites = () => {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getFavorites = useCallback(async () => {
    if (!currentUser) return [];
    setIsLoading(true);
    try {
      const records = await pb.collection('favorites').getFullList({
        filter: `userId = "${currentUser.id}"`,
        $autoCancel: false
      });
      setFavorites(records);
      return records;
    } catch (err) {
      console.error('Error fetching favorites:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const isFavorited = useCallback((userId) => {
    return favorites.some(f => f.favoriteUserId === userId);
  }, [favorites]);

  const addFavorite = async (favoriteUserId) => {
    if (!currentUser) return null;
    try {
      const record = await pb.collection('favorites').create({
        userId: currentUser.id,
        favoriteUserId
      }, { $autoCancel: false });
      setFavorites(prev => [...prev, record]);
      toast.success('Saved to favorites');
      return record;
    } catch (err) {
      console.error('Error adding favorite:', err);
      toast.error('Failed to save favorite');
      throw err;
    }
  };

  const removeFavorite = async (favoriteUserId) => {
    if (!currentUser) return;
    try {
      const favorite = favorites.find(f => f.favoriteUserId === favoriteUserId);
      if (favorite) {
        await pb.collection('favorites').delete(favorite.id, { $autoCancel: false });
        setFavorites(prev => prev.filter(f => f.id !== favorite.id));
        toast.success('Removed from favorites');
      }
    } catch (err) {
      console.error('Error removing favorite:', err);
      toast.error('Failed to remove favorite');
      throw err;
    }
  };

  const toggleFavorite = async (favoriteUserId) => {
    if (isFavorited(favoriteUserId)) {
      await removeFavorite(favoriteUserId);
    } else {
      await addFavorite(favoriteUserId);
    }
  };

  return {
    favorites,
    isLoading,
    getFavorites,
    isFavorited,
    addFavorite,
    removeFavorite,
    toggleFavorite
  };
};