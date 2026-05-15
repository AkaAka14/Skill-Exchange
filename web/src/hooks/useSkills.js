import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';

export const useSkills = () => {
  const { currentUser } = useAuth();
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getSkillsByUser = useCallback(async (userId) => {
    if (!userId) return [];
    setIsLoading(true);
    try {
      const records = await pb.collection('skills').getFullList({
        filter: `userId = "${userId}"`,
        sort: '-created',
        $autoCancel: false
      });
      if (userId === currentUser?.id) {
        setSkills(records);
      }
      return records;
    } catch (err) {
      console.error(err);
      setError(err.message);
      if (userId === currentUser?.id) {
        toast.error('Failed to load your skills');
      }
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const getWantSkills = useCallback(async (userId) => {
    if (!userId) return [];
    try {
      const records = await pb.collection('skills').getFullList({
        filter: `userId = "${userId}" && skillType = "want"`,
        sort: '-created',
        $autoCancel: false
      });
      return records;
    } catch (err) {
      console.error('Error fetching want skills:', err);
      toast.error('Failed to load want skills');
      return [];
    }
  }, []);

  const generateSkillEmbedding = async (skillName) => {
    try {
      const response = await apiServerClient.fetch('/skills/embedding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillName })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate embedding');
      }
      
      const data = await response.json();
      return data.embedding;
    } catch (err) {
      console.error('Embedding generation error:', err);
      return null;
    }
  };

  const addSkill = async (skillData) => {
    if (!currentUser) return null;
    try {
      // Generate embedding before saving
      const embedding = await generateSkillEmbedding(skillData.skillName);
      
      const recordData = {
        ...skillData,
        userId: currentUser.id,
      };
      
      if (embedding) {
        recordData.embedding = embedding;
      }

      const record = await pb.collection('skills').create(recordData, { $autoCancel: false });
      
      setSkills(prev => [record, ...prev]);
      toast.success('Skill added successfully');
      return record;
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to add skill');
      throw err;
    }
  };

  const removeSkill = async (skillId) => {
    try {
      await pb.collection('skills').delete(skillId, { $autoCancel: false });
      setSkills(prev => prev.filter(s => s.id !== skillId));
      toast.success('Skill removed');
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove skill');
      throw err;
    }
  };

  return {
    skills,
    isLoading,
    error,
    getSkillsByUser,
    getWantSkills,
    addSkill,
    removeSkill,
    generateSkillEmbedding
  };
};