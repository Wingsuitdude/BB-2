import { supabase } from './client';

export async function getConversations(userId) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant1:profiles!conversations_participant1_id_fkey(
          id, username, avatar_url, address, headline, verified
        ),
        participant2:profiles!conversations_participant2_id_fkey(
          id, username, avatar_url, address, headline, verified
        ),
        messages:messages(
          id, content, created_at, read_at, sender_id, recipient_id
        )
      `)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // Sort messages in each conversation by date
    return data.map(conversation => ({
      ...conversation,
      messages: conversation.messages.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      )
    }));
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
}

export async function getUnreadMessageCount(userId) {
  if (!userId) return 0;
  
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .is('read_at', null);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting unread message count:', error);
    return 0;
  }
}

export async function sendMessage(senderId, recipientId, content) {
  try {
    // First, get or create conversation
    let conversation = await getOrCreateConversation(senderId, recipientId);
    if (!conversation) {
      throw new Error('Failed to create conversation');
    }

    // Send message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversation.id,
        sender_id: senderId,
        recipient_id: recipientId,
        content
      }])
      .select()
      .single();

    if (messageError) throw messageError;

    // Update conversation's updated_at timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversation.id);

    return message;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
}

export async function markMessageAsRead(messageId) {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking message as read:', error);
    return false;
  }
}

async function getOrCreateConversation(participant1Id, participant2Id) {
  try {
    // Check if conversation exists
    const { data: existing } = await supabase
      .from('conversations')
      .select()
      .or(`and(participant1_id.eq.${participant1Id},participant2_id.eq.${participant2Id}),and(participant1_id.eq.${participant2Id},participant2_id.eq.${participant1Id})`)
      .maybeSingle();

    if (existing) return existing;

    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert([{
        participant1_id: participant1Id,
        participant2_id: participant2Id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error with conversation:', error);
    return null;
  }
}