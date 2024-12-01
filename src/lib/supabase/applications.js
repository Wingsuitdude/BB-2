import { supabase } from './client';
import { joinBase } from './bases';

export async function applyToBase(baseId, applicantId, message) {
  try {
    const { data, error } = await supabase
      .from('base_applications')
      .insert([{
        base_id: baseId,
        applicant_id: applicantId,
        message
      }])
      .select(`
        *,
        base:bases(
          id, name
        ),
        applicant:profiles(
          id, username, avatar_url, address, verified, headline, skills
        )
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error applying to base:', error);
    return null;
  }
}

export async function getBaseApplications(baseId) {
  try {
    const { data, error } = await supabase
      .from('base_applications')
      .select(`
        *,
        applicant:profiles(
          id, username, avatar_url, address, verified, headline, skills
        )
      `)
      .eq('base_id', baseId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
}

export async function updateApplicationStatus(applicationId, status, baseId, applicantId) {
  try {
    // Start a transaction by using multiple operations
    if (status === 'accepted') {
      // First add the member to the base
      const memberResult = await joinBase(baseId, applicantId);
      if (!memberResult) throw new Error('Failed to add member');
    }

    // Then update the application status
    const { data, error } = await supabase
      .from('base_applications')
      .update({ status })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating application:', error);
    return null;
  }
}