import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useSkills } from '@/hooks/useSkills.js';
import SkillForm from '@/components/SkillForm.jsx';
import SkillCard from '@/components/SkillCard.jsx';
import ReviewSection from '@/components/ReviewSection.jsx';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const { skills, isLoading, getSkillsByUser, addSkill, removeSkill } = useSkills();

  useEffect(() => {
    if (currentUser) {
      getSkillsByUser(currentUser.id);
    }
  }, [currentUser, getSkillsByUser]);

  const haveSkills = skills.filter(s => s.skillType === 'have');
  const wantSkills = skills.filter(s => s.skillType === 'want');

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Helmet>
        <title>Your Profile | SkillSwap AI</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Profile Header */}
        <div className="flex items-center gap-6 pb-8 border-b border-white/10">
          <Avatar className="h-24 w-24 rounded-2xl border-2 border-primary/20 bg-primary/10">
            <AvatarFallback className="text-2xl text-primary font-bold rounded-2xl">
              {getInitials(currentUser?.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-white font-heading">{currentUser?.name || 'Anonymous User'}</h1>
            <p className="text-muted-foreground mt-1">{currentUser?.email}</p>
          </div>
        </div>

        {/* Add Skill Form */}
        <Card className="bg-card border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-white font-heading">Add a Skill</CardTitle>
            <CardDescription className="text-muted-foreground">List a skill you can teach or a skill you want to learn.</CardDescription>
          </CardHeader>
          <CardContent>
            <SkillForm onAddSkill={addSkill} isLoading={isLoading} />
          </CardContent>
        </Card>

        {/* Skills Lists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Have Skills */}
          <Card className="bg-card border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white font-heading flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Skills I Have
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-24 bg-white/5" />
                  <Skeleton className="h-8 w-32 bg-white/5" />
                </div>
              ) : haveSkills.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {haveSkills.map(skill => (
                    <SkillCard 
                      key={skill.id} 
                      skill={skill} 
                      isOwner={true} 
                      onRemove={removeSkill} 
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">You haven't listed any skills you have yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Want Skills */}
          <Card className="bg-card border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white font-heading flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                Skills I Want
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-20 bg-white/5" />
                  <Skeleton className="h-8 w-28 bg-white/5" />
                </div>
              ) : wantSkills.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {wantSkills.map(skill => (
                    <SkillCard 
                      key={skill.id} 
                      skill={skill} 
                      isOwner={true} 
                      onRemove={removeSkill} 
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">You haven't listed any skills you want yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Reviews Section */}
        {currentUser && (
          <ReviewSection user={currentUser} />
        )}
      </motion.div>
    </div>
  );
};

export default ProfilePage;