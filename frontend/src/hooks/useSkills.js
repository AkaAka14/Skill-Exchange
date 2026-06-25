import { useState, useCallback } from 'react';
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
      const  data  = await apiServerClient.get('/skills', { params: { userId } });
      if (userId === currentUser?.id) {
        setSkills(data);
      }
      return data;
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
      const  data  = await apiServerClient.get('/skills', { params: { userId, skillType: 'want' } });
      return data;
    } catch (err) {
      console.error('Error fetching want skills:', err);
      toast.error('Failed to load want skills');
      return [];
    }
  }, []);


  const addSkill = async (skillData) => {
    if (!currentUser) return null;
    try {
      const  data = await apiServerClient.post('/skills', skillData);
      setSkills(prev => [data, ...prev]);
      toast.success('Skill added successfully');
      return data;
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to add skill');
      throw err;
    }
  };

  const removeSkill = async (skillId) => {
    try {
      await apiServerClient.delete(`/skills/${skillId}`);
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
    removeSkill
  };
};
