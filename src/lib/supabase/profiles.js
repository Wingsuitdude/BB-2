import { supabase } from './client';

export async function getProfile(address) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        home_base:bases!profiles_home_base_id_fkey(
          id, name, type, verified
        )
      `)
      .eq('address', address.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getProfile:', error);
    return null;
  }
}

export async function getAllProfiles() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        home_base:bases!profiles_home_base_id_fkey(
          id, name, type, verified
        )
      `)
      .order('reputation', { ascending: false });

    if (error) {
      console.error('Error fetching profiles:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error in getAllProfiles:', error);
    return [];
  }
}

export async function updateProfile(address, updates) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('address', address.toLowerCase())
      .select(`
        *,
        home_base:bases!profiles_home_base_id_fkey(
          id, name, type, verified
        )
      `)
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return null;
  }
}

export async function setHomeBase(profileId, baseId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ home_base_id: baseId })
      .eq('id', profileId)
      .select(`
        *,
        home_base:bases!profiles_home_base_id_fkey(
          id, name, type, verified
        )
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error setting home base:', error);
    return null;
  }
}