import { supabase } from './client';

export async function getSystemStats() {
  try {
    // Get verified users count
    const { count: verifiedUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('verified', true);

    // Get total bases count
    const { count: totalBases } = await supabase
      .from('bases')
      .select('*', { count: 'exact', head: true });

    // Get total ETH in pool (for now it's 0)
    const ethPool = 0;

    // Get total BASES holders (for now it's 0)
    const basesHolders = 0;

    return {
      verifiedUsers: verifiedUsers || 0,
      totalBases: totalBases || 0,
      ethPool,
      basesHolders
    };
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return {
      verifiedUsers: 0,
      totalBases: 0,
      ethPool: 0,
      basesHolders: 0
    };
  }
}