import { useState, useCallback } from 'react';
import apiServerClient from '@/lib/apiServerClient';
import { getSocket } from '@/lib/socketClient';
import { useAuth } from '@/contexts/AuthContext.jsx';

export const useMessages = () => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getConversations = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const  data  = await apiServerClient.get('/messages/conversations');
      setConversations(data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const getConversationHistory = useCallback(async (otherUserId) => {
    if (!currentUser || !otherUserId) return [];
    try {
      const  data  = await apiServerClient.get(`/messages/${otherUserId}`);
      return data;
    } catch (err) {
      console.error('Error fetching history:', err);
      return [];
    }
  }, [currentUser]);


  const sendMessage = useCallback(async (recipientId, text) => {
    if (!currentUser || !recipientId || !text.trim()) return null;
    try {
      const  data  = await apiServerClient.post('/messages', {
        recipientId,
        messageText: text.trim(),
      });
      return data;
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  }, [currentUser]);

  const markAsRead = useCallback(async (messageId) => {
    try {
      await apiServerClient.put(`/messages/${messageId}/read`);
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  }, []);

  
  const subscribeToMessages = useCallback((callback) => {
    const socket = getSocket();
    if (!socket) return () => {};

    const handleNewMessage = (message) => {
      callback({ action: 'create', record: message });
    };
    const handleRead = (payload) => {
      callback({ action: 'update', record: payload });
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:read', handleRead);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:read', handleRead);
    };
  }, []);

  return {
    conversations,
    isLoading,
    getConversations,
    getConversationHistory,
    sendMessage,
    markAsRead,
    subscribeToMessages
  };
};
