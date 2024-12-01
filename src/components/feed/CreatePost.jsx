import React, { useState } from 'react';
import { Image, Send } from 'lucide-react';
import { Button } from '../common/Button';
import { useAuthStore } from '../../stores/useAuthStore';
import { createPost } from '../../lib/supabase/posts';

export function CreatePost({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !profile?.id) return;

    setIsSubmitting(true);
    try {
      const post = await createPost({
        author_id: profile.id,
        content: content.trim()
      });

      if (post) {
        setContent('');
        onPostCreated?.(post);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-dark-100 rounded-lg p-4 border border-gray-800 mb-6">
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 rounded-full bg-dark-200 overflow-hidden flex-shrink-0">
          <img
            src={profile?.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${profile?.address}`}
            alt={profile?.username}
            className="w-full h-full object-cover"
          />
        </div>
        <form onSubmit={handleSubmit} className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share something with your network..."
            className="w-full bg-dark-200 border border-gray-700 rounded-lg px-4 py-2 text-white min-h-[100px] focus:outline-none focus:border-primary-500"
          />
          <div className="flex justify-between items-center mt-4">
            <button
              type="button"
              className="text-gray-400 hover:text-white transition-colors"
              onClick={() => {/* TODO: Implement image upload */}}
            >
              <Image className="w-5 h-5" />
            </button>
            <Button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              isLoading={isSubmitting}
            >
              <Send className="w-4 h-4 mr-2" />
              Post
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}