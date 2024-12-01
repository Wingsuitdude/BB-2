import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Profile operations
export async function getProfile(address) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
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

export async function createProfile(address) {
  try {
    // First check if profile exists
    const existingProfile = await getProfile(address);
    if (existingProfile) {
      return existingProfile;
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        address: address.toLowerCase(),
        username: `${address.slice(0, 6)}...${address.slice(-4)}`,
        bio: '',
        skills: [],
        verified: false,
        reputation: 0,
        completed_projects: 0
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createProfile:', error);
    return null;
  }
}

export async function updateProfile(address, updates) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('address', address.toLowerCase())
      .select()
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