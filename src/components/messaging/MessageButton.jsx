import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { MessageModal } from './MessageModal';
import { useAuthStore } from '../../stores/useAuthStore';

export function MessageButton({ recipientId, recipientName }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { profile } = useAuthStore();

  if (!profile || profile.id === recipientId) return null;

  return (
    <>
      <Button 
        variant="secondary" 
        onClick={() => setIsModalOpen(true)}
        className="px-3 py-2"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Message
      </Button>

      {isModalOpen && (
        <MessageModal
          recipientId={recipientId}
          recipientName={recipientName}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}