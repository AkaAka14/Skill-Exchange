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

  const fetchMatchesData = useCallback(async () => {
    if (!currentUser?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Sync local favorites and want skills
      await getFavorites();
      const fetchedWantSkills = await getWantSkills(currentUser.id);
      setWantSkills(fetchedWantSkills);
      
      // 2. Fetch semantic matches from Express backend
      // Note: apiServerClient should already handle the JSON parsing 
      // depending on how you implemented its .get() method
      const response = await apiServerClient.get('/matches/semantic');
      
      // If your apiServerClient returns the raw response object:
      const data = response.data ? response.data : response;
      
      // Your backend currently returns an array directly: [ {userId, userName, ...}, ... ]
      let fetchedMatches = Array.isArray(data) ? data : [];
      
      setMatches(fetchedMatches);
      
    } catch (err) {
      console.error('Error fetching matches data:', err);
      setError(err.message || 'Failed to fetch matches. Please try again.');
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
        // Using match.userName because that's what the backend sends
        match.userName?.toLowerCase().includes(lowerQ) ||
        match.matchingSkills?.some(s => s.skillPair?.toLowerCase().includes(lowerQ))
      );
    }
    
    return result;
  }, [matches, searchQuery, activeTab, isFavorited]);

  return (
    <div className="container mx-auto px-4 py-12">
      <Helmet>
        <title>AI Matches | SkillSwap</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            AI Skill Matches
            <Button 
              variant="outline" 
              size="icon" 
              onClick={fetchMatchesData}
              disabled={isLoading}
              className="h-8 w-8 rounded-full bg-transparent border-white/10 hover:bg-white/5"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </h1>
          <p className="text-muted-foreground mt-2">Discover partners based on deep skill compatibility.</p>
        </div>
        <div className="w-full md:w-auto">
          <SearchBar onSearch={setSearchQuery} placeholder="Search names or skills..." />
        </div>
      </div>

      {/* Skills Context Bar */}
      {wantSkills.length > 0 && !isLoading && (
        <div className="mb-8 p-4 bg-primary/5 rounded-xl border border-primary/10">
          <h3 className="text-sm font-medium text-primary mb-3 flex items-center gap-2">
            <ListChecks className="w-4 h-4" />
            Matching your needs:
          </h3>
          <div className="flex flex-wrap gap-2">
            {wantSkills.map(skill => (
              <span key={skill.id} className="text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full">
                {skill.skillName}
              </span>
            ))}
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="bg-card border border-white/10">
          <TabsTrigger value="all">All Matches</TabsTrigger>
          <TabsTrigger value="saved">
            <Heart className="h-4 w-4 mr-2" />
            Saved
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {error && (
        <div className="mb-8 p-6 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-destructive-foreground">{error}</p>
          </div>
          <Button variant="outline" onClick={fetchMatchesData} size="sm">Retry</Button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full rounded-xl bg-white/5" />)}
        </div>
      ) : filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match, index) => (
            <motion.div
              key={match.userId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <MatchCard 
                userId={match.userId}
                user ={match} 
                compatibilityScore={match.compatibilityScore}
                matchingSkills={match.matchingSkills}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center text-center border border-dashed border-white/10 rounded-2xl">
          <SearchX className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No matches found</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            We couldn't find any skills that overlap with your needs right now. Try adding more specific "Want" skills!
          </p>
          <Button asChild>
            <a href="/dashboard">Update Skills</a>
          </Button>
        </div>
      )}
    </div>
  );
};

export default MatchesPage;