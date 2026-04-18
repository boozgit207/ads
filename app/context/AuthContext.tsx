'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createBrowserClient } from '@/lib/supabase-client';

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

export function AuthProvider({ children, initialUser }: { children: ReactNode; initialUser: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser);
  const supabase = createBrowserClient();

  const refreshUser = async () => {
    console.log('AuthContext: refreshUser called');
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      
      console.log('AuthContext: authUser:', authUser);
      console.log('AuthContext: error:', error);
      
      if (error || !authUser) {
        console.log('AuthContext: No auth user, setting user to null');
        setUser(null);
      } else {
        // Get profile data
        console.log('AuthContext: Fetching profile for user:', authUser.id);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();
        
        console.log('AuthContext: profile:', profile);
        console.log('AuthContext: profileError:', profileError);
        
        if (profile) {
          console.log('AuthContext: Setting user from profile');
          setUser(profile as User | null);
        } else {
          // Fallback to auth user data if profile not accessible
          console.log('AuthContext: Profile not accessible, using auth metadata');
          const fallbackUser = {
            id: authUser.id,
            email: authUser.email || '',
            first_name: authUser.user_metadata?.first_name || null,
            last_name: authUser.user_metadata?.last_name || null,
            avatar: authUser.user_metadata?.avatar_url || null,
            role: authUser.user_metadata?.role || 'user'
          };
          console.log('AuthContext: fallbackUser:', fallbackUser);
          setUser(fallbackUser);
        }
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
      localStorage.removeItem('ads-dark-mode');
      localStorage.removeItem('ads-language');
    } catch (error) {
      console.error('AuthContext: Error signing out:', error);
    }
  };

  useEffect(() => {
    // Only call refreshUser if we don't have initialUser from server
    if (!initialUser) {
      refreshUser();
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        console.log('AuthContext: Auth state change - event:', event, 'session:', session);
        
        // Don't override initialUser on INITIAL_SESSION if session is null
        if (event === 'INITIAL_SESSION' && !session && initialUser) {
          console.log('AuthContext: Keeping initialUser, ignoring INITIAL_SESSION with null session');
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          console.log('AuthContext: Session user found:', session.user.id);
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          
          console.log('AuthContext: Profile from state change:', profile);
          console.log('AuthContext: Profile error from state change:', profileError);
          
          if (profile) {
            console.log('AuthContext: Setting user from profile (state change)');
            setUser(profile as User | null);
          } else {
            // Fallback to auth user data if profile not accessible
            console.log('AuthContext: Profile not accessible (state change), using auth metadata');
            const fallbackUser = {
              id: session.user.id,
              email: session.user.email || '',
              first_name: session.user.user_metadata?.first_name || null,
              last_name: session.user.user_metadata?.last_name || null,
              avatar: session.user.user_metadata?.avatar_url || null,
              role: session.user.user_metadata?.role || 'user'
            };
            console.log('AuthContext: fallbackUser (state change):', fallbackUser);
            setUser(fallbackUser);
          }
        } else {
          console.log('AuthContext: No session user, setting user to null (state change)');
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [initialUser]);

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
