import React, { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { MessageSquare, Search } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages.js';
import ChatWindow from '@/components/ChatWindow.jsx';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

const MessagesPage = () => {
  const { conversations, isLoading, getConversations, subscribeToMessages } = useMessages();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeConversation, setActiveConversation] = useState(null);

  useEffect(() => {
    getConversations();
    
    const unsubscribe = subscribeToMessages(() => {
      // Refresh conversations list when a new message arrives
      getConversations();
    });

    return () => unsubscribe();
  }, [getConversations, subscribeToMessages]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;
    const lowerQ = searchQuery.toLowerCase();
    return conversations.filter(conv => 
      conv.otherUser?.name?.toLowerCase().includes(lowerQ)
    );
  }, [conversations, searchQuery]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-4rem)] flex flex-col">
      <Helmet>
        <title>Messages | SkillSwap AI</title>
      </Helmet>

      <div className="mb-6">
        <h1 className="text-3xl font-bold font-heading text-white">Messages</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
        {/* Conversations List */}
        <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col bg-card border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search conversations..." 
                className="pl-9 bg-input border-white/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full bg-white/5" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-24 bg-white/5" />
                      <Skeleton className="h-3 w-full bg-white/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length > 0 ? (
              <div className="divide-y divide-white/5">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.otherUser.id}
                    onClick={() => setActiveConversation(conv.otherUser)}
                    className={`w-full text-left p-4 flex items-start gap-3 transition-colors hover:bg-secondary/50 ${activeConversation?.id === conv.otherUser.id ? 'bg-secondary/80' : ''}`}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12 border border-white/10">
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {getInitials(conv.otherUser.name)}
                        </AvatarFallback>
                      </Avatar>
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white border-2 border-card">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-medium text-white truncate pr-2">{conv.otherUser.name}</h4>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {new Date(conv.lastMessage.created).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-white font-medium' : 'text-muted-foreground'}`}>
                        {conv.lastMessage.messageText}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                <MessageSquare className="h-8 w-8 mb-3 opacity-50" />
                <p>No conversations found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Active Chat Area */}
        <div className="hidden md:flex flex-1 bg-card border border-white/10 rounded-xl overflow-hidden">
          {activeConversation ? (
            <div className="w-full h-full">
              <ChatWindow otherUser={activeConversation} />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Choose a contact from the list to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;