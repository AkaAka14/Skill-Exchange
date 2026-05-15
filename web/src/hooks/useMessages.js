import { useState, useCallback, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';

export const useMessages = () => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getConversations = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      // Fetch all messages involving the current user
      const records = await pb.collection('messages').getFullList({
        filter: `senderId = "${currentUser.id}" || recipientId = "${currentUser.id}"`,
        sort: '-created',
        expand: 'senderId,recipientId',
        $autoCancel: false
      });

      // Group by conversation partner
      const convMap = new Map();
      
      records.forEach(msg => {
        const otherUserId = msg.senderId === currentUser.id ? msg.recipientId : msg.senderId;
        const otherUser = msg.senderId === currentUser.id ? msg.expand?.recipientId : msg.expand?.senderId;
        
        if (!otherUser) return;

        if (!convMap.has(otherUserId)) {
          convMap.set(otherUserId, {
            otherUser,
            lastMessage: msg,
            unreadCount: (msg.recipientId === currentUser.id && !msg.isRead) ? 1 : 0
          });
        } else {
          const existing = convMap.get(otherUserId);
          if (msg.recipientId === currentUser.id && !msg.isRead) {
            existing.unreadCount += 1;
          }
        }
      });

      setConversations(Array.from(convMap.values()));
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const getConversationHistory = useCallback(async (otherUserId) => {
    if (!currentUser || !otherUserId) return [];
    try {
      const records = await pb.collection('messages').getFullList({
        filter: `(senderId = "${currentUser.id}" && recipientId = "${otherUserId}") || (senderId = "${otherUserId}" && recipientId = "${currentUser.id}")`,
        sort: 'created',
        expand: 'senderId,recipientId',
        $autoCancel: false
      });
      return records;
    } catch (err) {
      console.error('Error fetching history:', err);
      return [];
    }
  }, [currentUser]);

  const sendMessage = async (recipientId, text) => {
    if (!currentUser || !recipientId || !text.trim()) return null;
    try {
      const record = await pb.collection('messages').create({
        senderId: currentUser.id,
        recipientId,
        messageText: text.trim(),
        isRead: false
      }, { $autoCancel: false });
      return record;
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await pb.collection('messages').update(messageId, { isRead: true }, { $autoCancel: false });
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const subscribeToMessages = useCallback((callback) => {
    if (!currentUser) return () => {};
    
    pb.collection('messages').subscribe('*', (e) => {
      if (e.action === 'create' || e.action === 'update') {
        const msg = e.record;
        if (msg.senderId === currentUser.id || msg.recipientId === currentUser.id) {
          callback(e);
        }
      }
    });

    return () => {
      pb.collection('messages').unsubscribe('*');
    };
  }, [currentUser]);

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