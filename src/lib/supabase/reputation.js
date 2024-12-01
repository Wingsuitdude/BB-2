import { supabase } from './client';

export const REPUTATION_POINTS = {
  SUPER_LIKE_RECEIVED: 10,
  POST_CREATED: 2,
  POST_LIKED: 1,
  BASE_CREATED: 20,
  BASE_JOINED: 5,
  PROFILE_VERIFIED: 50,
  COMMENT_CREATED: 1
};

export async function addReputationEvent(profileId, eventType, points, metadata = {}) {
  if (!profileId || !eventType || !points) {
    console.error('Missing required parameters for reputation event');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('reputation_events')
      .insert([{
        profile_id: profileId,
        event_type: eventType,
        points,
        metadata
      }])
      .select(`
        *,
        profile:profiles(reputation_points)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding reputation event:', error);
    return null;
  }
}

export async function getReputationHistory(profileId) {
  if (!profileId) return [];

  try {
    const { data, error } = await supabase
      .from('reputation_events')
      .select(`
        *,
        profile:profiles(username, avatar_url)
      `)
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching reputation history:', error);
    return [];
  }
}

export async function getReputationStats(profileId) {
  if (!profileId) return null;

  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('reputation_points')
      .eq('id', profileId)
      .single();

    if (profileError) throw profileError;

    const { data: events, error: eventsError } = await supabase
      .from('reputation_events')
      .select('event_type, points')
      .eq('profile_id', profileId);

    if (eventsError) throw eventsError;

    const stats = {
      total: profile.reputation_points,
      breakdown: events.reduce((acc, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + event.points;
        return acc;
      }, {})
    };

    return stats;
  } catch (error) {
    console.error('Error fetching reputation stats:', error);
    return null;
  }
}