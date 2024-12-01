import { supabase } from './client';

export async function getConnectionStatus(requesterId, receiverId) {
  if (!requesterId || !receiverId) return null;
  
  try {
    const { data, error } = await supabase
      .from('connections')
      .select('status')
      .or(`and(requester_id.eq.${requesterId},receiver_id.eq.${receiverId}),and(requester_id.eq.${receiverId},receiver_id.eq.${requesterId})`)
      .maybeSingle();

    if (error) {
      console.error('Error getting connection status:', error);
      return null;
    }

    return data?.status || null;
  } catch (error) {
    console.error('Error in getConnectionStatus:', error);
    return null;
  }
}

export async function sendConnectionRequest(requesterId, receiverId) {
  if (!requesterId || !receiverId) return null;

  try {
    const { data, error } = await supabase
      .from('connections')
      .insert([{
        requester_id: requesterId,
        receiver_id: receiverId,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error sending connection request:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in sendConnectionRequest:', error);
    return null;
  }
}

export async function removeConnection(userId1, userId2) {
  if (!userId1 || !userId2) return false;

  try {
    const { error } = await supabase
      .from('connections')
      .delete()
      .or(`and(requester_id.eq.${userId1},receiver_id.eq.${userId2}),and(requester_id.eq.${userId2},receiver_id.eq.${userId1})`);

    if (error) {
      console.error('Error removing connection:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in removeConnection:', error);
    return false;
  }
}

export async function getPendingConnectionCount(userId) {
  if (!userId) return 0;

  try {
    const { count, error } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('status', 'pending');

    if (error) {
      console.error('Error getting pending connection count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getPendingConnectionCount:', error);
    return 0;
  }
}