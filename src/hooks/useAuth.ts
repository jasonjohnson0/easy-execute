import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Business } from '@/types/database';

interface AuthUser extends User {
  businessProfile?: Business;
  userProfile?: {
    id: string;
    referral_code: string;
  };
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (authUser: User) => {
    try {
      // Check if user is a business owner
      const { data: business } = await (supabase as any)
        .from('businesses')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      // Check user profile for referral code
      const { data: profile } = await (supabase as any)
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      const userWithProfiles: AuthUser = {
        ...authUser,
        businessProfile: business || undefined,
        userProfile: profile || undefined
      };

      setUser(userWithProfiles);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(authUser);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, userType: 'hunter' | 'business') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (!error && data.user && userType === 'hunter') {
      // Create user profile for deal hunters
      await (supabase as any).from('user_profiles').insert({
        id: data.user.id,
      });
    }

    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}