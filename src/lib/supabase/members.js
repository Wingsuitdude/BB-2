import { supabase } from './client';

export async function joinBase(baseId, profileId) {
  try {
    const { data, error } = await supabase
      .from('base_members')
      .insert([{
        base_id: baseId,
        profile_id: profileId
      }])
      .select()
      .single();

    if (error) {
      console.error('Error joining base:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in joinBase:', error);
    return null;
  }
}

export async function leaveBase(baseId, profileId) {
  try {
    const { error } = await supabase
      .from('base_members')
      .delete()
      .match({ base_id: baseId, profile_id: profileId });

    if (error) {
      console.error('Error leaving base:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in leaveBase:', error);
    return false;
  }
}