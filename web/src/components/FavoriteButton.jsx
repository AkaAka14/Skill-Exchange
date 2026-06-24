import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';

/**
 * FavoriteButton
 *
 * Props:
 *   userId  — the user to favorite/unfavorite
 *   variant — 'icon' (default) | 'full' (shows text label)
 */
export function FavoriteButton({ userId, variant = 'icon' }) {
  const { currentUser } = useAuth();
  const { toggleFavorite, checkFavoriteStatus } = useFavorites();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check initial status
  useEffect(() => {
    if (!currentUser || userId === currentUser.id) return;
    checkFavoriteStatus(userId).then(setFavorited);
  }, [userId, currentUser, checkFavoriteStatus]);

  if (!currentUser || userId === currentUser.id) return null;

  const handleToggle = async () => {
    setLoading(true);
    try {
      const result = await toggleFavorite(userId);
      setFavorited(result.favorited);
    } catch (err) {
      console.error('Favorite toggle failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const heartClass = favorited
    ? 'fill-rose-500 stroke-rose-500'
    : 'fill-none stroke-current';

  if (variant === 'full') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        disabled={loading}
        className={favorited ? 'border-rose-300 text-rose-500' : ''}
      >
        <Heart className={`h-4 w-4 mr-1.5 ${heartClass}`} />
        {favorited ? 'Saved' : 'Save'}
      </Button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      className="p-1.5 rounded-full hover:bg-muted transition-colors"
    >
      <Heart className={`h-5 w-5 ${heartClass}`} />
    </button>
  );
}
