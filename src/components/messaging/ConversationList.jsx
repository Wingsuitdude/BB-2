import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Shield } from 'lucide-react';

export function ConversationList({ 
  conversations, 
  selectedConversation, 
  onSelectConversation, 
  currentUserId 
}) {
  const getOtherParticipant = (conversation) => {
    return conversation.participant1_id === currentUserId
      ? conversation.participant2
      : conversation.participant1;
  };

  return (
    <div className="space-y-2">
      {conversations.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <p>No messages yet</p>
        </div>
      ) : (
        conversations.map((conversation) => {
          const otherUser = getOtherParticipant(conversation);
          const lastMessage = conversation.messages?.[0];
          const isSelected = selectedConversation?.id === conversation.id;

          return (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`
                bg-dark-100 rounded-lg p-4 border cursor-pointer transition-colors
                ${isSelected ? 'border-primary-500' : 'border-gray-800 hover:border-gray-700'}
              `}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-dark-200 overflow-hidden flex-shrink-0">
                  <img
                    src={otherUser.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${otherUser.address}`}
                    alt={otherUser.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <h3 className="font-semibold text-white truncate">
                      {otherUser.username}
                    </h3>
                    {otherUser.verified && (
                      <Shield className="w-4 h-4 ml-1 text-primary-400" />
                    )}
                  </div>
                  {lastMessage && (
                    <>
                      <p className="text-sm text-gray-400 truncate">
                        {lastMessage.content}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })}
                      </span>
                    </>
                  )}
                </div>
                {!lastMessage?.read_at && lastMessage?.recipient_id === currentUserId && (
                  <div className="w-3 h-3 bg-primary-500 rounded-full flex-shrink-0"></div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}