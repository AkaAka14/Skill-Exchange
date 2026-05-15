import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useMessages } from '@/hooks/useMessages.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const ChatWindow = ({ otherUser }) => {
  const { currentUser } = useAuth();
  const { getConversationHistory, sendMessage, markAsRead, subscribeToMessages } = useMessages();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  const scrollRef = useRef(null);

  useEffect(() => {
    const loadHistory = async () => {
      if (!otherUser?.id) return;
      setIsLoading(true);
      const history = await getConversationHistory(otherUser.id);
      setMessages(history);
      
      // Mark unread messages as read
      history.forEach(msg => {
        if (msg.recipientId === currentUser.id && !msg.isRead) {
          markAsRead(msg.id);
        }
      });
      
      setIsLoading(false);
      scrollToBottom();
    };

    loadHistory();

    const unsubscribe = subscribeToMessages((e) => {
      if (e.action === 'create') {
        const msg = e.record;
        // Only add if it belongs to this conversation
        if (
          (msg.senderId === currentUser.id && msg.recipientId === otherUser.id) ||
          (msg.senderId === otherUser.id && msg.recipientId === currentUser.id)
        ) {
          setMessages(prev => [...prev, msg]);
          if (msg.recipientId === currentUser.id) {
            markAsRead(msg.id);
          }
          scrollToBottom();
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [otherUser?.id, currentUser.id, getConversationHistory, markAsRead, subscribeToMessages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(otherUser.id, newMessage);
      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (!otherUser) return null;

  return (
    <div className="flex flex-col h-[500px] max-h-[80vh] bg-card border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-secondary/30">
        <Avatar className="h-10 w-10 border border-white/10">
          <AvatarFallback className="bg-primary/20 text-primary">
            {getInitials(otherUser.name || otherUser.userName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-white">{otherUser.name || otherUser.userName}</h3>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
            <p>No messages yet.</p>
            <p className="text-sm">Send a message to start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isMine = msg.senderId === currentUser.id;
              return (
                <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      isMine 
                        ? 'bg-[hsl(var(--chat-sent))] text-[hsl(var(--chat-sent-foreground))] rounded-br-sm' 
                        : 'bg-[hsl(var(--chat-received))] text-[hsl(var(--chat-received-foreground))] rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.messageText}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {new Date(msg.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-background">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-input border-white/10 focus-visible:ring-primary"
            disabled={isSending}
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending} className="bg-primary hover:bg-primary/90 text-white shrink-0">
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;