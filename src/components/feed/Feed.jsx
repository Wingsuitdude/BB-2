import React, { useState, useEffect } from 'react';
import { CreatePost } from './CreatePost';
import { PostCard } from './PostCard';
import { getFeedPosts, getUserPosts } from '../../lib/supabase/posts';

export function Feed({ userId = null, showCreatePost = true, connectionFeed = false }) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = connectionFeed 
          ? await getFeedPosts(userId)
          : await getUserPosts(userId);
        setPosts(data || []);
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      loadPosts();
    }
  }, [userId, connectionFeed]);

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      {showCreatePost && <CreatePost onPostCreated={handlePostCreated} />}
      <div className="space-y-6">
        {posts.map(post => (
          <PostCard 
            key={post.id} 
            post={post}
            onPostDeleted={handlePostDeleted}
            onPostUpdated={handlePostUpdated}
          />
        ))}
        {posts.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <p>No posts yet</p>
          </div>
        )}
      </div>
    </div>
  );
}