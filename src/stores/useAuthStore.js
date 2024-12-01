import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,
  setProfile: (profile) => set({ profile, isLoading: false, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  clearProfile: () => set({ profile: null, isLoading: false, error: null }),
  getDisplayName: () => {
    const state = get();
    return state.profile?.username || state.profile?.address;
  }
}));