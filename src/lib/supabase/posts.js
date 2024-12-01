import { supabase } from './client';
import { addReputationEvent, REPUTATION_POINTS } from './reputation';

export async function createPost({ author_id, content, media_url = null }) {
  if (!author_id || !content) return null;

  try {
    const { data: post, error } = await supabase
      .from('posts')
      .insert([{ author_id, content, media_url }])
      .select(`
        *,
        author:profiles(*)
      `)
      .single();

    if (error) throw error;

    // Add reputation points for creating a post
    await addReputationEvent(author_id, 'POST_CREATED', REPUTATION_POINTS.POST_CREATED);
    
    return {
      ...post,
      likes_count: 0,
      comments_count: 0,
      is_liked: false
    };
  } catch (error) {
    console.error('Error creating post:', error);
    return null;
  }
}

export async function updatePost(postId, updates) {
  if (!postId || !updates) return null;

  try {
    const { data: post, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', postId)
      .select(`
        *,
        author:profiles(*)
      `)
      .single();

    if (error) throw error;
    return post;
  } catch (error) {
    console.error('Error updating post:', error);
    return null;
  }
}

export async function deletePost(postId) {
  if (!postId) return false;

  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    return false;
  }
}

export async function likePost(postId, profileId) {
  if (!postId || !profileId) return false;

  try {
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single();

    if (postError) throw postError;

    const { error: likeError } = await supabase
      .from('post_likes')
      .insert([{ post_id: postId, profile_id: profileId }]);

    if (likeError) throw likeError;

    // Add reputation points for receiving a like
    await addReputationEvent(post.author_id, 'POST_LIKED', REPUTATION_POINTS.POST_LIKED);

    return true;
  } catch (error) {
    console.error('Error liking post:', error);
    return false;
  }
}

export async function unlikePost(postId, profileId) {
  if (!postId || !profileId) return false;

  try {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .match({ post_id: postId, profile_id: profileId });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error unliking post:', error);
    return false;
  }
}

export async function getFeedPosts(userId) {
  if (!userId) return [];

  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(*),
        likes:post_likes(profile_id),
        comments:post_comments(count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return posts.map(post => ({
      ...post,
      likes_count: post.likes?.length || 0,
      comments_count: post.comments?.[0]?.count || 0,
      is_liked: post.likes?.some(like => like.profile_id === userId) || false
    }));
  } catch (error) {
    console.error('Error fetching feed posts:', error);
    return [];
  }
}

export async function getUserPosts(userId) {
  if (!userId) return [];

  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(*),
        likes:post_likes(profile_id),
        comments:post_comments(count)
      `)
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return posts.map(post => ({
      ...post,
      likes_count: post.likes?.length || 0,
      comments_count: post.comments?.[0]?.count || 0,
      is_liked: post.likes?.some(like => like.profile_id === userId) || false
    }));
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return [];
  }
}