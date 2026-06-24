import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { FavoriteButton } from '@/components/FavoriteButton';
import { StarRating } from '@/components/StarRating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function FavoritesPage() {
  const { favorites, loading, error, fetchFavorites } = useFavorites();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="h-5 w-5 fill-rose-500 stroke-rose-500" />
        <h1 className="text-2xl font-bold">Saved Profiles</h1>
      </div>

      {loading && (
        <p className="text-muted-foreground text-sm">Loading…</p>
      )}
      {error && <p className="text-destructive text-sm">{error}</p>}

      {!loading && favorites.length === 0 && (
        <div className="text-center py-16">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No saved profiles yet</p>
          <p className="text-muted-foreground text-sm mb-4">
            Tap the heart on any profile to save them here.
          </p>
          <Button asChild variant="outline">
            <Link to="/matches">Browse matches</Link>
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {favorites.map((user) => (
          <Card key={user._id}>
            <CardContent className="flex items-center gap-4 py-4">
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback>{user.name?.[0] ?? '?'}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <Link
                  to={`/profile/${user._id}`}
                  className="font-medium hover:underline"
                >
                  {user.name}
                </Link>
                {user.avgRating && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <StarRating value={Math.round(user.avgRating)} size="sm" />
                    <span className="text-xs text-muted-foreground">
                      {user.avgRating}
                    </span>
                  </div>
                )}
                {user.bio && (
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {user.bio}
                  </p>
                )}
                {user.skillsOffered?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {user.skillsOffered.slice(0, 3).map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <FavoriteButton userId={user._id} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
