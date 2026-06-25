import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useFavorites } from '@/hooks/useFavorites.js';
import { useSkills } from '@/hooks/useSkills.js';
import apiServerClient from '@/lib/apiServerClient';
import MatchCard from '@/components/MatchCard.jsx';
import SearchBar from '@/components/SearchBar.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  SearchX, AlertCircle, Heart, RefreshCw,
  Sparkles, ArrowLeftRight, Star, Zap,
  ChevronRight, Brain
} from 'lucide-react';

// ── Pipeline step visualisation ───────────────────────────────────────────────
const PIPELINE_STEPS = [
  { label: 'Your profile',      icon: Brain,          color: 'text-pink-400',   bg: 'bg-pink-500/10 border-pink-500/20' },
  { label: 'Embedding model',   icon: Sparkles,       color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { label: 'Vector search',     icon: SearchX,        color: 'text-pink-400',   bg: 'bg-pink-500/10 border-pink-500/20' },
  { label: 'Feature scoring',   icon: Zap,            color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20' },
  { label: 'Re-ranking',        icon: ArrowLeftRight, color: 'text-teal-400',   bg: 'bg-teal-500/10 border-teal-500/20' },
  { label: 'Top 10 matches',    icon: Star,           color: 'text-emerald-400',bg: 'bg-emerald-500/10 border-emerald-500/20' },
];

function PipelineVisual({ isLoading, resultCount }) {
  return (
    <div className="mb-8 rounded-2xl border border-white/8 bg-card p-5">
      <p className="text-[10px] font-semibold text-pink-400 uppercase tracking-widest mb-4">
        Matching pipeline
      </p>
      <div className="flex items-center gap-1 flex-wrap">
        {PIPELINE_STEPS.map((step, i) => {
          const Icon = step.icon;
          const isLast = i === PIPELINE_STEPS.length - 1;
          return (
            <React.Fragment key={step.label}>
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${step.bg} ${step.color} ${isLoading && i > 0 ? 'opacity-40' : ''} transition-opacity duration-300`}>
                <Icon className={`h-3 w-3 ${isLoading && i < PIPELINE_STEPS.length - 1 ? 'animate-pulse' : ''}`} />
                <span>{isLast && !isLoading && resultCount > 0 ? `${resultCount} matches` : step.label}</span>
              </div>
              {!isLast && (
                <ChevronRight className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Score weight legend */}
      <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-x-5 gap-y-1.5">
        {[
          { label: 'Semantic similarity', weight: '50%', color: 'bg-pink-400' },
          { label: 'Reciprocal exchange', weight: '30%', color: 'bg-purple-400' },
          { label: 'Reputation',          weight: '15%', color: 'bg-amber-400' },
          { label: 'Activity',            weight: '5%',  color: 'bg-teal-400'  },
        ].map(({ label, weight, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${color} flex-shrink-0`} />
            <span className="text-[10px] text-muted-foreground">{label}</span>
            <span className="text-[10px] font-medium text-white">{weight}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
const MatchesPage = () => {
  const { currentUser } = useAuth();
  const { favorites, fetchFavorites } = useFavorites();
  const { getWantSkills } = useSkills();

  const [matches, setMatches]       = useState([]);
  const [wantSkills, setWantSkills] = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab]   = useState('all');

  const favoritedIds = useMemo(
    () => new Set(favorites.map(f => f._id?.toString())),
    [favorites]
  );

  const fetchMatchesData = useCallback(async () => {
    if (!currentUser?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      await fetchFavorites();
      const ws = await getWantSkills(currentUser.id);
      setWantSkills(ws);
      const data = await apiServerClient.get('/matches/semantic');
      setMatches(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch matches.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id, fetchFavorites, getWantSkills]);

  useEffect(() => { fetchMatchesData(); }, [fetchMatchesData]);

  const filteredMatches = useMemo(() => {
    let result = matches;
    if (activeTab === 'saved') {
      result = result.filter(m => favoritedIds.has(m.userId?.toString()));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m =>
        m.userName?.toLowerCase().includes(q) ||
        m.matchingSkills?.some(s => s.skillPair?.toLowerCase().includes(q))
      );
    }
    return result;
  }, [matches, searchQuery, activeTab, favoritedIds]);

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">AI Skill Matches</h1>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchMatchesData}
              disabled={isLoading}
              className="h-7 w-7 rounded-full border-white/10 hover:border-pink-500/30 bg-transparent hover:bg-white/5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Ranked by semantic compatibility, exchange potential, and reputation.
          </p>
        </div>
        <SearchBar onSearch={setSearchQuery} placeholder="Search names or skills…" />
      </div>

      {/* ── Pipeline visual ──────────────────────────────────────────────── */}
      <PipelineVisual isLoading={isLoading} resultCount={matches.length} />

      {/* ── Your want-skills ─────────────────────────────────────────────── */}
      {wantSkills.length > 0 && !isLoading && (
        <div className="mb-6 p-4 rounded-xl bg-pink-500/5 border border-pink-500/10">
          <p className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Matching your learning goals
          </p>
          <div className="flex flex-wrap gap-2">
            {wantSkills.map(s => (
              <span key={s.id} className="text-xs px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300">
                {s.skillName}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-card border border-white/10">
          <TabsTrigger value="all">All matches</TabsTrigger>
          <TabsTrigger value="saved">
            <Heart className="h-3.5 w-3.5 mr-1.5" /> Saved
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {error && (
        <div className="mb-6 p-5 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive-foreground">{error}</p>
          </div>
          <Button variant="outline" onClick={fetchMatchesData} size="sm">Retry</Button>
        </div>
      )}

      {/* ── Cards ────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-72 w-full rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : filteredMatches.length > 0 ? (
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMatches.map((match, i) => (
              <motion.div
                key={match.userId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
              >
                <MatchCard
                  userId={match.userId}
                  user={match}
                  compatibilityScore={match.compatibilityScore}
                  matchingSkills={match.matchingSkills}
                />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      ) : (
        <div className="py-20 flex flex-col items-center text-center border border-dashed border-white/10 rounded-2xl">
          <SearchX className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No matches found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Add more "Want to learn" skills on your profile — the more specific, the better the matches.
          </p>
          <Button asChild variant="outline" className="border-pink-500/30 text-pink-400 hover:bg-pink-500/10">
            <a href={`/profile/${currentUser?.id}`}>Add skills</a>
          </Button>
        </div>
      )}
    </div>
  );
};

export default MatchesPage;