import { supabase } from './client';

export async function getBases() {
  try {
    const { data, error } = await supabase
      .from('bases')
      .select(`
        *,
        creator:profiles!bases_creator_id_fkey(
          id, username, avatar_url, address, verified
        ),
        members:base_members(
          profile:profiles(
            id, username, avatar_url, address
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(base => ({
      ...base,
      member_count: base.members?.length || 0,
      recent_members: base.members?.slice(0, 4).map(m => m.profile) || []
    }));
  } catch (error) {
    console.error('Error fetching bases:', error);
    return [];
  }
}

export async function getBaseById(id) {
  try {
    const { data, error } = await supabase
      .from('bases')
      .select(`
        *,
        creator:profiles!bases_creator_id_fkey(
          id, username, avatar_url, address, verified, headline
        ),
        members:base_members(
          profile:profiles(
            id, username, avatar_url, address, verified, headline, skills
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return {
      ...data,
      members: data.members?.map(m => m.profile) || []
    };
  } catch (error) {
    console.error('Error fetching base:', error);
    return null;
  }
}

export async function createBase(baseData) {
  try {
    const { data, error } = await supabase
      .from('bases')
      .insert([baseData])
      .select(`
        *,
        creator:profiles!bases_creator_id_fkey(
          id, username, avatar_url, address, verified
        ),
        members:base_members(
          profile:profiles(
            id, username, avatar_url, address
          )
        )
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating base:', error);
    return null;
  }
}

export async function updateBase(id, updates) {
  try {
    const { data, error } = await supabase
      .from('bases')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        creator:profiles!bases_creator_id_fkey(
          id, username, avatar_url, address, verified, headline
        ),
        members:base_members(
          profile:profiles(
            id, username, avatar_url, address, verified, headline, skills
          )
        )
      `)
      .single();

    if (error) throw error;
    return {
      ...data,
      members: data.members?.map(m => m.profile) || []
    };
  } catch (error) {
    console.error('Error updating base:', error);
    return null;
  }
}

export async function deleteBase(id) {
  try {
    const { error } = await supabase
      .from('bases')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting base:', error);
    return false;
  }
}

export async function joinBase(baseId, profileId) {
  try {
    const { data, error } = await supabase
      .from('base_members')
      .insert([{
        base_id: baseId,
        profile_id: profileId,
        role: 'member'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error joining base:', error);
    return null;
  }
}

export async function leaveBase(baseId, profileId) {
  try {
    const { error } = await supabase
      .from('base_members')
      .delete()
      .match({ base_id: baseId, profile_id: profileId });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error leaving base:', error);
    return false;
  }
}