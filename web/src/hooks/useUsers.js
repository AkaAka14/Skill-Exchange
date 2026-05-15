import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';

export const useUsers = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAllUsers = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      // First, get all users except current
      const usersRecords = await pb.collection('users').getFullList({
        filter: `id != "${currentUser.id}"`,
        $autoCancel: false
      });

      // To display their skills, we need to fetch all skills and map them
      // In a real large app, this might be a custom endpoint or expand if relation went the other way.
      // Here, since skills have userId, we fetch all skills for these users.
      const userIds = usersRecords.map(u => `"${u.id}"`).join(',');
      let allSkills = [];
      if (userIds.length > 0) {
         allSkills = await pb.collection('skills').getFullList({
          filter: `userId ?= [${userIds}]`,
          $autoCancel: false
        });
      }

      const usersWithSkills = usersRecords.map(user => {
        const userSkills = allSkills.filter(s => s.userId === user.id);
        return {
          ...user,
          skillsHave: userSkills.filter(s => s.skillType === 'have'),
          skillsWant: userSkills.filter(s => s.skillType === 'want')
        };
      });

      setUsers(usersWithSkills);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const searchUsers = useCallback((query) => {
    if (!query) {
      getAllUsers();
      return;
    }
    
    // Client-side filtering for simplicity given the loaded data
    const lowerQuery = query.toLowerCase();
    setUsers(prev => prev.filter(user => 
      user.name?.toLowerCase().includes(lowerQuery) ||
      user.skillsHave.some(s => s.skillName.toLowerCase().includes(lowerQuery)) ||
      user.skillsWant.some(s => s.skillName.toLowerCase().includes(lowerQuery))
    ));
  }, [getAllUsers]);

  return {
    users,
    isLoading,
    error,
    getAllUsers,
    searchUsers
  };
};