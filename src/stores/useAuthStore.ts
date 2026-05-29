import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import {
  signInWithGoogle,
  signInWithEmail,
  signOut,
  getCurrentSession,
  onAuthStateChange,
} from '../services/authService';

interface AuthState {
  session: Session | null;
  isLoading: boolean;
  isFirstLaunch: boolean;
  init: () => () => void;
  login: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setFirstLaunchComplete: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: true,
  isFirstLaunch: true,

  init: () => {
    getCurrentSession()
      .then((session) => {
        set({ session, isLoading: false });
      })
      .catch(() => {
        set({ session: null, isLoading: false });
      });

    const { data } = onAuthStateChange((session) => {
      set({ session, isLoading: false });
    });

    return () => {
      data.subscription.unsubscribe();
    };
  },

  login: async () => {
    set({ isLoading: true });
    try {
      const { session } = await signInWithGoogle();
      set({ session, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loginWithEmail: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { session } = await signInWithEmail(email, password);
      set({ session, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    await signOut();
    set({ session: null, isLoading: false, isFirstLaunch: true });
  },

  setFirstLaunchComplete: () => set({ isFirstLaunch: false }),
}));
