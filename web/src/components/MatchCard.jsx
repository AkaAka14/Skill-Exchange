import React, { useState, useEffect } from 'react';
import { Mail, Sparkles, MessageCircle, Heart, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useFavorites } from '@/hooks/useFavorites.js';
import ChatWindow from './ChatWindow.jsx';

const MatchCard = ({ userId, user, compatibilityScore, matchingSkills = [] }) => {
  const { isFavorited, toggleFavorite } = useFavorites();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [isTogglingFav, setIsTogglingFav] = useState(false);

  useEffect(() => {
    if (userId) {
      setIsFav(isFavorited(userId));
    }
  }, [userId, isFavorited]);

  const userName = user?.name || 'Anonymous User';
  
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Safely construct avatar URL mapping standard object to pocketbase expected format
  const avatarUrl = user?.avatar ? pb.files.getUrl({ id: user.id || userId, collectionId: '_pb_users_auth_' }, user.avatar) : '';

  const handleToggleFavorite = async () => {
    if (!userId) return;
    setIsTogglingFav(true);
    try {
      await toggleFavorite(userId);
      setIsFav(!isFav);
    } finally {
      setIsTogglingFav(false);
    }
  };

  const score = Math.round(compatibilityScore || 0);
  
  let badgeColorClass = 'bg-[hsl(var(--compatibility-low))] text-white';
  if (score >= 80) {
    badgeColorClass = 'bg-[hsl(var(--compatibility-high))] text-white';
  } else if (score >= 50) {
    badgeColorClass = 'bg-[hsl(var(--compatibility-medium))] text-white';
  }

  return (
    <>
      <Card className="bg-card border-white/10 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 rounded-xl border border-white/10 bg-primary/20">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} className="object-cover" />}
              <AvatarFallback className="rounded-xl text-primary font-bold">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <CardTitle className="text-lg font-heading tracking-tight">{userName}</CardTitle>
            </div>
          </div>
          <div className={`flex flex-col items-center justify-center rounded-lg px-3 py-2 ${badgeColorClass}`}>
            <span className="text-xs font-medium opacity-90 uppercase tracking-wider">Match</span>
            <span className="text-xl font-bold font-heading">{score}%</span>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            Matching Skills
          </div>
          <div className="space-y-3 flex-1">
            {matchingSkills?.length > 0 ? (
              matchingSkills.map((skillMatch, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{skillMatch.skillName}</span>
                    <span className="text-xs font-medium text-foreground">
                      {Math.round(skillMatch.similarity * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${Math.round(skillMatch.similarity * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <span className="text-sm text-muted-foreground italic">No direct skill matches found.</span>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-4 border-t border-white/5 gap-2 flex-wrap sm:flex-nowrap">
          <Button 
            variant="outline" 
            asChild
            className="flex-1 border-white/10 hover:bg-white/5 h-9 px-2"
          >
            <Link to={`/profile/${userId}`}>
              <User className="h-4 w-4 mr-2 shrink-0" />
              <span className="truncate">Profile</span>
            </Link>
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 border-white/10 hover:bg-white/5 h-9 px-2"
            onClick={() => setIsChatOpen(true)}
          >
            <MessageCircle className="h-4 w-4 mr-2 shrink-0" />
            <span className="truncate">Message</span>
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            className={`border-white/10 hover:bg-white/5 transition-colors h-9 w-9 shrink-0 ${isFav ? 'text-[hsl(var(--favorite-active))] border-[hsl(var(--favorite-active))]/30 bg-[hsl(var(--favorite-active))]/10' : 'text-muted-foreground'}`}
            onClick={handleToggleFavorite}
            disabled={isTogglingFav}
            aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 bg-transparent border-none shadow-none">
          <DialogTitle className="sr-only">Chat with {userName}</DialogTitle>
          <ChatWindow otherUser={{ id: userId, name: userName }} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MatchCard;