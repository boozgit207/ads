'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createBrowserClient } from '@/lib/supabase-client';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar?: string | null;
  role?: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  created_at?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function loadProfileFromSession(
  supabase: ReturnType<typeof createBrowserClient>,
  authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }
): Promise<User> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (profile) return profile as User;

  return {
    id: authUser.id,
    email: authUser.email || '',
    first_name: (authUser.user_metadata?.first_name as string) || null,
    last_name: (authUser.user_metadata?.last_name as string) || null,
    avatar: (authUser.user_metadata?.avatar_url as string) || null,
    role: (authUser.user_metadata?.role as string) || 'user',
  };
}

export function AuthProvider({ children, initialUser }: { children: ReactNode; initialUser: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser);
  const supabase = createBrowserClient();

  const refreshUser = async () => {
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      if (error || !authUser) {
        setUser(null);
      } else {
        setUser(await loadProfileFromSession(supabase, authUser));
      }
    } catch (error) {
      console.error('AuthContext: Error in refreshUser:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      setUser(null);
    } catch (error) {
      console.error('AuthContext: Error signing out:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    setLoading(false);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        return;
      }

      if (event === 'SIGNED_IN' && session?.user) {
        setUser(await loadProfileFromSession(supabase, session.user));
        return;
      }

      if (event === 'USER_UPDATED' && session?.user) {
        setUser(await loadProfileFromSession(supabase, session.user));
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
