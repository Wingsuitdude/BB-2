import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../common/Button';
import { updatePost } from '../../lib/supabase/posts';

export function PostEdit({ post, onClose, onUpdate }) {
  const [content, setContent] = useState(post.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const updatedPost = await updatePost(post.id, {
        content: content.trim()
      });

      if (updatedPost) {
        onUpdate?.(updatedPost);
        onClose();
      }
    } catch (error) {
      console.error('Error updating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-dark-100 rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Edit Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-dark-200 border border-gray-700 rounded-lg px-4 py-2 text-white min-h-[120px] focus:outline-none focus:border-primary-500"
          />

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={!content.trim() || content === post.content}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}