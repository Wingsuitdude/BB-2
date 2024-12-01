import React, { useState, useEffect, useRef } from 'react';
import { Shield, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '../common/Button';
import { sendMessage, markMessageAsRead } from '../../lib/supabase/messages';

export function ConversationView({ conversation, currentUserId, onMessageSent }) {
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const otherUser = conversation.participant1_id === currentUserId
    ? conversation.participant2
    : conversation.participant1;

  useEffect(() => {
    // Mark unread messages as read
    const unreadMessages = conversation.messages?.filter(
      msg => msg.recipient_id === currentUserId && !msg.read_at
    );

    if (unreadMessages?.length > 0) {
      unreadMessages.forEach(msg => markMessageAsRead(msg.id));
    }

    // Scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages, currentUserId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsLoading(true);
    try {
      await sendMessage(currentUserId, otherUser.id, newMessage.trim());
      setNewMessage('');
      onMessageSent();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-dark-100 rounded-lg border border-gray-800 flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-dark-200 overflow-hidden">
            <img
              src={otherUser.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${otherUser.address}`}
              alt={otherUser.username}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center">
              <h3 className="font-semibold text-white">{otherUser.username}</h3>
              {otherUser.verified && (
                <Shield className="w-4 h-4 ml-1 text-primary-400" />
              )}
            </div>
            {otherUser.headline && (
              <p className="text-sm text-gray-400">{otherUser.headline}</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages?.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[70%] rounded-lg p-3
                ${message.sender_id === currentUserId
                  ? 'bg-primary-500/10 text-primary-100'
                  : 'bg-dark-200 text-gray-200'
                }
              `}
            >
              <p>{message.content}</p>
              <span className="text-xs text-gray-500 mt-1 block">
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-dark-200 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
          />
          <Button type="submit" disabled={!newMessage.trim() || isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}