import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreVertical, Pencil, Trash2, Star } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { likePost, unlikePost, deletePost } from '../../lib/supabase/posts';
import { truncateAddress } from '../../lib/utils/formatters';
import { Button } from '../common/Button';
import { PostEdit } from './PostEdit';
import { useSuperLike } from '../../hooks/useSuperLike';
import { SUPER_LIKE_COST } from '../../lib/constants';

export function PostCard({ post, onPostDeleted, onPostUpdated }) {
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { profile } = useAuthStore();
  const { superLike, isLoading: isSuperLiking, error: superLikeError } = useSuperLike();

  const isOwnPost = profile?.id === post.author_id;

  const handleLike = async () => {
    if (!profile?.id) return;

    try {
      if (isLiked) {
        await unlikePost(post.id, profile.id);
        setLikesCount(prev => prev - 1);
      } else {
        await likePost(post.id, profile.id);
        setLikesCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSuperLike = async () => {
    try {
      await superLike(post.id);
    } catch (error) {
      console.error('Error super liking:', error);
    }
  };

  const handleDelete = async () => {
    if (!isOwnPost) return;
    
    try {
      await deletePost(post.id);
      onPostDeleted?.(post.id);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <>
      <div className="bg-dark-100 rounded-lg p-4 border border-gray-800">
        {/* Author Info */}
        <div className="flex items-center justify-between mb-4">
          <Link to={`/profile/${post.author.address}`} className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-dark-200 overflow-hidden">
              <img
                src={post.author.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${post.author.address}`}
                alt={post.author.username}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-white hover:text-primary-400 transition-colors">
                {post.author.username || truncateAddress(post.author.address)}
              </h3>
              <p className="text-sm text-gray-400">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          </Link>
          {isOwnPost && (
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-1 hover:bg-dark-200 rounded-full transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>
              {showOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-dark-100 rounded-lg shadow-lg border border-gray-800 py-1 z-10">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowOptions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-400 hover:bg-dark-200 flex items-center"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Post
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-dark-200 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <p className="text-gray-200 mb-4 whitespace-pre-wrap">{post.content}</p>

        {/* Media */}
        {post.media_url && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img
              src={post.media_url}
              alt="Post media"
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-6 text-gray-400">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 hover:text-primary-400 transition-colors ${
              isLiked ? 'text-primary-400' : ''
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likesCount}</span>
          </button>
          <button
            onClick={handleSuperLike}
            disabled={isSuperLiking || isOwnPost}
            className={`flex items-center space-x-2 hover:text-yellow-400 transition-colors ${
              isSuperLiking ? 'opacity-50' : ''
            }`}
          >
            <Star className="w-5 h-5" />
            <span>{SUPER_LIKE_COST} ETH</span>
          </button>
          <button className="flex items-center space-x-2 hover:text-primary-400 transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span>{post.comments_count}</span>
          </button>
          <button className="flex items-center space-x-2 hover:text-primary-400 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
        
        {superLikeError && (
          <p className="text-red-400 text-sm mt-2">{superLikeError}</p>
        )}
      </div>

      {isEditing && (
        <PostEdit
          post={post}
          onClose={() => setIsEditing(false)}
          onUpdate={onPostUpdated}
        />
      )}
    </>
  );
}