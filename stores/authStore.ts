import { supabase } from '@/lib/supabase';
import type { Project, User } from '@/types/database';
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  session: { access_token: string } | null;
  loading: boolean;
  activeProject: Project | null;
  availableProjects: Project[];
  setActiveProject: (projectId: string) => void;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  loadSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  activeProject: null,
  availableProjects: [],

  setActiveProject: (projectId: string) => {
    set((state) => ({
      activeProject: state.availableProjects.find((p) => p.id === projectId) || state.activeProject,
    }));
  },

  signIn: async (email: string, password: string) => {
    let data, error;
    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      data = result.data;
      error = result.error;
    } catch (e) {
      return { error: 'Network request failed. Check your connection.' };
    }

    if (error || !data.user || !data.session) {
      return { error: error?.message ?? 'Sign in failed' };
    }

    // Fetch user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      return { error: 'Failed to load user profile' };
    }

    const { data: upData } = await supabase
      .from('user_projects')
      .select('projects(*)')
      .eq('user_id', data.user.id);

    let availableProjects: Project[] = [];
    if (upData) {
      availableProjects = upData
        .map((up: any) => up.projects as Project)
        .filter(Boolean);
    }

    const activeProject = availableProjects.length > 0 ? availableProjects[0] : null;

    set({
      session: { access_token: data.session.access_token },
      user: profile as User,
      availableProjects,
      activeProject,
    });

    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, activeProject: null, availableProjects: [] });
  },

  loadSession: async () => {
    set({ loading: true });

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const { data: upData } = await supabase
          .from('user_projects')
          .select('projects(*)')
          .eq('user_id', session.user.id);

        let availableProjects: Project[] = [];
        if (upData) {
          availableProjects = upData
            .map((up: any) => up.projects as Project)
            .filter(Boolean);
        }

        const activeProject = availableProjects.length > 0 ? availableProjects[0] : null;

        set({
          session: { access_token: session.access_token },
          user: profile as User | null,
          availableProjects,
          activeProject,
          loading: false,
        });
      } else {
        set({ user: null, session: null, activeProject: null, availableProjects: [], loading: false });
      }
    } catch {
      set({ user: null, session: null, activeProject: null, availableProjects: [], loading: false });
    }
  },
}));
