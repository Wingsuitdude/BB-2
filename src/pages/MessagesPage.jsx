import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { getConversations } from '../lib/supabase/messages';
import { ConversationList } from '../components/messaging/ConversationList';
import { ConversationView } from '../components/messaging/ConversationView';
import { supabase } from '../lib/supabase/client';

export function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuthStore();

  const loadConversations = async () => {
    if (!profile?.id) return;
    
    try {
      const data = await getConversations(profile.id);
      setConversations(data);
      
      // Update selected conversation if it exists
      if (selectedConversation) {
        const updated = data.find(c => c.id === selectedConversation.id);
        if (updated) {
          setSelectedConversation(updated);
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();

    // Set up real-time subscription for new messages
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'messages' 
      }, () => {
        loadConversations();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [profile?.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Messages</h1>
      
      <div className="flex gap-6">
        {/* Conversations List */}
        <div className="w-1/3">
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
            currentUserId={profile?.id}
          />
        </div>

        {/* Conversation View */}
        <div className="flex-1">
          {selectedConversation ? (
            <ConversationView
              conversation={selectedConversation}
              currentUserId={profile?.id}
              onMessageSent={loadConversations}
            />
          ) : (
            <div className="bg-dark-100 rounded-lg p-8 text-center border border-gray-800">
              <p className="text-gray-400">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}