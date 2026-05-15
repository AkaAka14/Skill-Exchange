import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // 1. Added useParams
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useSkills } from '@/hooks/useSkills.js';
import pb from '@/lib/pocketbaseClient'; // 2. Import your PocketBase client
import SkillForm from '@/components/SkillForm.jsx';
import SkillCard from '@/components/SkillCard.jsx';
import ReviewSection from '@/components/ReviewSection.jsx';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const ProfilePage = () => {
  const { id } = useParams(); // 3. Get the ID from the URL
  const { currentUser } = useAuth();
  const { skills, isLoading, getSkillsByUser, addSkill, removeSkill } = useSkills();
  
  // 4. State for the user whose profile we are viewing
  const [profileUser, setProfileUser] = useState(null);
  const [isFetchingUser, setIsFetchingUser] = useState(true);

  // 5. Determine if this is YOUR profile or someone else's
  const isOwnProfile = !id || id === currentUser?.id;
  const targetId = isOwnProfile ? currentUser?.id : id;

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!targetId) return;
      setIsFetchingUser(true);
      
      try {
        // Fetch Skills
        await getSkillsByUser(targetId);

        // Fetch User Info (Name, Email, etc.)
        if (isOwnProfile) {
          setProfileUser(currentUser);
        } else {
          const userRecord = await pb.collection('users').getOne(targetId);
          setProfileUser(userRecord);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setIsFetchingUser(false);
      }
    };

    fetchProfileData();
  }, [targetId, isOwnProfile, currentUser, getSkillsByUser]);

  const haveSkills = skills.filter(s => s.skillType === 'have');
  const wantSkills = skills.filter(s => s.skillType === 'want');

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (isFetchingUser && !profileUser) {
    return <div className="container mx-auto p-20 text-center text-white">Loading Profile...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Helmet>
        <title>{profileUser?.name || 'User'} | SkillSwap AI</title>
      </Helmet>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        
        {/* Profile Header */}
        <div className="flex items-center gap-6 pb-8 border-b border-white/10">
          <Avatar className="h-24 w-24 rounded-2xl border-2 border-primary/20 bg-primary/10">
            <AvatarFallback className="text-2xl text-primary font-bold rounded-2xl">
              {getInitials(profileUser?.name || profileUser?.userName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-white font-heading">
              {profileUser?.name || profileUser?.userName || 'Anonymous User'}
            </h1>
            <p className="text-muted-foreground mt-1">{profileUser?.email}</p>
          </div>
        </div>

        {/* 6. Only show Add Form if it's YOUR profile */}
        {isOwnProfile && (
          <Card className="bg-card border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white font-heading">Add a Skill</CardTitle>
              <CardDescription className="text-muted-foreground">List a skill you can teach or a skill you want to learn.</CardDescription>
            </CardHeader>
            <CardContent>
              <SkillForm onAddSkill={addSkill} isLoading={isLoading} />
            </CardContent>
          </Card>
        )}

        {/* Skills Lists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white font-heading flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" /> Skills I Have
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {haveSkills.map(skill => (
                  <SkillCard 
                    key={skill.id} 
                    skill={skill} 
                    isOwner={isOwnProfile} // 7. Only show delete button if owner
                    onRemove={removeSkill} 
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white font-heading flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" /> Skills I Want
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {wantSkills.map(skill => (
                  <SkillCard 
                    key={skill.id} 
                    skill={skill} 
                    isOwner={isOwnProfile} 
                    onRemove={removeSkill} 
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {profileUser && <ReviewSection user={profileUser} />}
      </motion.div>
    </div>
  );
};

export default ProfilePage;