import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../common/Button';
import { sendMessage } from '../../lib/supabase/messages';
import { useAuthStore } from '../../stores/useAuthStore';

export function MessageModal({ recipientId, recipientName, onClose }) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { profile } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    try {
      await sendMessage(profile.id, recipientId, message.trim());
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-dark-100 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">
            Message {recipientName}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message..."
            className="w-full bg-dark-200 border border-gray-700 rounded-lg px-4 py-2 text-white min-h-[120px] focus:outline-none focus:border-primary-500"
          />

          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              isLoading={isSending}
              disabled={!message.trim()}
            >
              Send Message
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}