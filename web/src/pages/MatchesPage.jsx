import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useFavorites } from '@/hooks/useFavorites.js';
import { useSkills } from '@/hooks/useSkills.js';
import apiServerClient from '@/lib/apiServerClient';
import MatchCard from '@/components/MatchCard.jsx';
import SearchBar from '@/components/SearchBar.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SearchX, AlertCircle, Heart, RefreshCw, ListChecks } from 'lucide-react';

const MatchesPage = () => {
  const { currentUser } = useAuth();
  const { getFavorites, isFavorited } = useFavorites();
  const { getWantSkills } = useSkills();
  
  const [matches, setMatches] = useState([]);
  const [wantSkills, setWantSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [apiMessage, setApiMessage] = useState('');

  const fetchMatchesData = useCallback(async () => {
    if (!currentUser?.id) return;
    
    setIsLoading(true);
    setError(null);
    setApiMessage('');
    
    try {
      // 1. Fetch user favorites to sync local state
      await getFavorites();
      
      // 2. Fetch the user's current 'want' skills for debugging/context
      const fetchedWantSkills = await getWantSkills(currentUser.id);
      setWantSkills(fetchedWantSkills);
      
      // 3. Fetch semantic matches from Express backend
      const response = await apiServerClient.get('/matches/semantic');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch matches. Please try again.');
      }
      
      const data = await response.json();
      
      // The backend returns { matches: [...], message: string }
      let fetchedMatches = Array.isArray(data.matches) ? data.matches : [];
      
      // Ensure it's sorted descending by compatibilityScore
      fetchedMatches.sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0));
      
      setMatches(fetchedMatches);
      setApiMessage(data.message || '');
      
    } catch (err) {
      console.error('Error fetching matches data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id, getFavorites, getWantSkills]);

  useEffect(() => {
    fetchMatchesData();
  }, [fetchMatchesData]);

  const filteredMatches = useMemo(() => {
    let result = matches;
    
    if (activeTab === 'saved') {
      result = result.filter(match => isFavorited(match.userId));
    }

    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(match => 
        match.user?.name?.toLowerCase().includes(lowerQ) ||
        match.matchingSkills?.some(s => s.skillName?.toLowerCase().includes(lowerQ))
      );
    }
    
    return result;
  }, [matches, searchQuery, activeTab, isFavorited]);

  return (
    <div className="container mx-auto px-4 py-12">
      <Helmet>
        <title>Semantic Matches | SkillSwap AI</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading text-white flex items-center gap-3">
            AI Skill Matches
            <Button 
              variant="outline" 
              size="icon" 
              onClick={fetchMatchesData}
              disabled={isLoading}
              className="h-8 w-8 rounded-full border-white/10 hover:bg-white/5"
              aria-label="Refresh matches"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-primary' : 'text-muted-foreground'}`} />
            </Button>
          </h1>
          <p className="text-muted-foreground mt-2">Discover professionals based on semantic skill compatibility.</p>
        </div>
        <div className="w-full md:w-auto">
          <SearchBar onSearch={setSearchQuery} placeholder="Search matches..." />
        </div>
      </div>

      {wantSkills.length > 0 && !isLoading && (
        <div className="mb-8 p-4 bg-secondary/30 rounded-xl border border-white/5">
          <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-primary" />
            Matching against your desired skills:
          </h3>
          <div className="flex flex-wrap gap-2">
            {wantSkills.map(skill => (
              <span key={skill.id} className="text-xs bg-primary/10 text-primary-foreground border border-primary/20 px-2.5 py-1 rounded-md">
                {skill.skillName}
              </span>
            ))}
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="bg-card border border-white/10">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            All Matches
          </TabsTrigger>
          <TabsTrigger value="saved" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Heart className="h-4 w-4 mr-2" />
            Saved Matches
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {error && (
        <div className="mb-8 p-6 bg-destructive/10 border border-destructive/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-destructive-foreground">
            <AlertCircle className="h-6 w-6 text-destructive shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
          <Button 
            onClick={fetchMatchesData} 
            className="bg-destructive hover:bg-destructive/90 text-white shrink-0"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="border border-white/5 bg-card p-6 rounded-xl flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-center">
                  <Skeleton className="h-12 w-12 rounded-xl bg-white/5" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32 bg-white/5" />
                    <Skeleton className="h-3 w-24 bg-white/5" />
                  </div>
                </div>
                <Skeleton className="h-12 w-16 rounded-lg bg-white/5" />
              </div>
              <Skeleton className="h-4 w-32 bg-white/5 mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-full bg-white/5" />
                <Skeleton className="h-8 w-full bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      ) : !error && filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match, index) => (
            <motion.div
              key={match.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="h-full"
            >
              <MatchCard 
                userId={match.userId}
                user={match.user}
                compatibilityScore={match.compatibilityScore}
                matchingSkills={match.matchingSkills}
              />
            </motion.div>
          ))}
        </div>
      ) : !error ? (
        <div className="py-20 flex flex-col items-center justify-center text-center border border-white/5 bg-card rounded-2xl">
          {activeTab === 'saved' ? (
            <>
              <Heart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold text-white font-heading mb-2">No saved matches</h3>
              <p className="text-muted-foreground max-w-md">
                You haven't saved any matches yet. Click the heart icon on a match card to save them here.
              </p>
            </>
          ) : (
            <>
              <SearchX className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold text-white font-heading mb-2">No matches found</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                {apiMessage || (searchQuery 
                  ? "Try adjusting your search criteria." 
                  : "Add more 'want' skills to your profile to generate semantic AI matches.")}
              </p>
              {!searchQuery && (
                <Button asChild className="bg-primary text-white hover:bg-primary/90">
                  <a href="/profile">Update My Skills</a>
                </Button>
              )}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default MatchesPage;