import React, { useState, useEffect } from 'react';
import { MessageCircle, Heart, User, Sparkles, ArrowLeftRight, Star, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useFavorites } from '@/hooks/useFavorites.js';
import apiServerClient from '@/lib/apiServerClient';
import ChatWindow from './ChatWindow.jsx';

// ── Score bar ─────────────────────────────────────────────────────────────────
function ScoreBar({ label, value, icon: Icon, color }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-3 w-3 flex-shrink-0 ${color}`} />
      <span className="text-[10px] text-muted-foreground w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color.replace('text-', 'bg-')}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[10px] font-medium text-muted-foreground w-6 text-right">{value}%</span>
    </div>
  );
}

// ── Main card ─────────────────────────────────────────────────────────────────
const MatchCard = ({ userId, user, compatibilityScore, matchingSkills = [] }) => {
  const { toggleFavorite } = useFavorites();
  const [isChatOpen, setIsChatOpen]     = useState(false);
  const [isFav, setIsFav]               = useState(false);
  const [isTogglingFav, setIsTogglingFav] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    if (!userId) return;
    apiServerClient.get(`/favorites/${userId}/status`)
      .then(d => setIsFav(d.favorited))
      .catch(() => {});
  }, [userId]);

  const userName   = user?.userName || user?.name || 'Anonymous';
  const avatarUrl  = user?.userAvatar || user?.avatarUrl || '';
  const breakdown  = user?.scoreBreakdown || {};
  const theyWant   = user?.theyWant || [];
  const score      = Math.round(compatibilityScore || 0);

  const getInitials = (name) =>
    name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  const handleToggleFavorite = async () => {
    if (!userId) return;
    setIsTogglingFav(true);
    try { await toggleFavorite(userId); setIsFav(!isFav); }
    finally { setIsTogglingFav(false); }
  };

  // Score ring colour
  const ringColor =
    score >= 80 ? 'from-emerald-400 to-teal-500' :
    score >= 55 ? 'from-pink-400 to-purple-500' :
                  'from-slate-400 to-slate-500';

  return (
    <>
      <div className="group rounded-2xl bg-card border border-white/8 hover:border-pink-500/20 transition-all duration-200 hover:shadow-lg hover:shadow-pink-900/10 flex flex-col h-full overflow-hidden">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="p-5 pb-4 flex items-start gap-4">
          <Avatar className="h-11 w-11 rounded-xl border border-white/10 flex-shrink-0">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} className="object-cover" />}
            <AvatarFallback className="rounded-xl bg-gradient-to-br from-pink-600 to-purple-700 text-white font-bold text-sm">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-base leading-tight truncate">{userName}</h3>
            {user?.avgRating != null && (
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-xs text-muted-foreground">
                  {user.avgRating.toFixed(1)} · {user.reviewCount} review{user.reviewCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Score ring */}
          <div className="flex-shrink-0 relative">
            <div className={`w-14 h-14 rounded-full p-0.5 bg-gradient-to-br ${ringColor}`}>
              <div className="w-full h-full rounded-full bg-card flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-white leading-none">{score}%</span>
                <span className="text-[8px] text-muted-foreground uppercase tracking-wide">match</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Skill pairs ────────────────────────────────────────────────── */}
        <div className="px-5 pb-3 flex-1">
          {matchingSkills.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-pink-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                <Sparkles className="h-3 w-3" /> Skill match
              </p>
              {matchingSkills.map((m, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground truncate max-w-[75%]">{m.skillPair}</span>
                    <span className="text-[10px] font-medium text-white">{Math.round((m.score || 0) * 100)}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                      style={{ width: `${Math.round((m.score || 0) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">No direct skill pairs found.</p>
          )}

          {/* Reciprocal badge — "they also want what you teach" */}
          {theyWant.length > 0 && (
            <div className="mt-3 flex items-start gap-1.5 p-2 rounded-lg bg-purple-500/8 border border-purple-500/15">
              <ArrowLeftRight className="h-3 w-3 text-purple-400 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-purple-300 leading-snug">
                They want to learn: <span className="font-medium">{theyWant.join(', ')}</span>
              </p>
            </div>
          )}
        </div>

        {/* ── Score breakdown (expandable) ───────────────────────────────── */}
        {Object.keys(breakdown).length > 0 && (
          <div className="px-5 pb-3">
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-white transition-colors"
            >
              {showBreakdown ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              Score breakdown
            </button>

            {showBreakdown && (
              <div className="mt-2 space-y-1.5 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <ScoreBar label="Semantic"   value={breakdown.semantic   ?? 0} icon={Sparkles}       color="text-pink-400" />
                <ScoreBar label="Reciprocal" value={breakdown.reciprocal ?? 0} icon={ArrowLeftRight}  color="text-purple-400" />
                <ScoreBar label="Reputation" value={breakdown.reputation ?? 0} icon={Star}            color="text-amber-400" />
                <ScoreBar label="Activity"   value={breakdown.activity   ?? 0} icon={Zap}             color="text-teal-400" />
              </div>
            )}
          </div>
        )}

        {/* ── Footer actions ─────────────────────────────────────────────── */}
        <div className="px-5 pb-5 pt-3 border-t border-white/5 flex gap-2">
          <Button variant="outline" asChild className="flex-1 h-8 text-xs border-white/10 hover:bg-white/5 hover:border-pink-500/30">
            <Link to={`/profile/${userId}`}>
              <User className="h-3.5 w-3.5 mr-1.5" /> Profile
            </Link>
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-8 text-xs border-white/10 hover:bg-white/5 hover:border-purple-500/30"
            onClick={() => setIsChatOpen(true)}
          >
            <MessageCircle className="h-3.5 w-3.5 mr-1.5" /> Message
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={`h-8 w-8 flex-shrink-0 border-white/10 hover:bg-white/5 transition-colors ${
              isFav ? 'text-rose-400 border-rose-400/30 bg-rose-400/10' : 'text-muted-foreground'
            }`}
            onClick={handleToggleFavorite}
            disabled={isTogglingFav}
          >
            <Heart className={`h-3.5 w-3.5 ${isFav ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>

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