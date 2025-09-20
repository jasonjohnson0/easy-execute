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
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchUserProfile = async (authUser: User) => {
    setProfileLoading(true);
    try {
      // Check if this is a new user that needs profile creation
      const userMetadata = authUser.user_metadata;
      
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

      // If this is a new business user without a profile, create it
      if (userMetadata?.user_type === 'business' && !business && userMetadata?.business_data) {
        try {
          await createBusinessProfile(authUser, userMetadata.business_data, authUser.email || '');
          // Refresh business data after creation
          const { data: newBusiness } = await (supabase as any)
            .from('businesses')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();
          
          const userWithProfiles: AuthUser = {
            ...authUser,
            businessProfile: newBusiness || undefined,
            userProfile: profile || undefined
          };
          setUser(userWithProfiles);
          return;
        } catch (error) {
          console.error('Failed to create business profile on login:', error);
        }
      }

      // If this is a new hunter user without a profile, create it
      if (userMetadata?.user_type === 'hunter' && !profile) {
        try {
          await createUserProfile(authUser);
          // Refresh profile data after creation
          const { data: newProfile } = await (supabase as any)
            .from('user_profiles')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();
          
          const userWithProfiles: AuthUser = {
            ...authUser,
            businessProfile: business || undefined,
            userProfile: newProfile || undefined
          };
          setUser(userWithProfiles);
          return;
        } catch (error) {
          console.error('Failed to create user profile on login:', error);
        }
      }

      const userWithProfiles: AuthUser = {
        ...authUser,
        businessProfile: business || undefined,
        userProfile: profile || undefined
      };

      setUser(userWithProfiles);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(authUser);
    } finally {
      setProfileLoading(false);
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
      (event, session) => {
        // Only synchronous state updates here
        if (session?.user) {
          // Defer Supabase calls with setTimeout to prevent deadlocks
          setTimeout(() => {
            fetchUserProfile(session.user);
          }, 0);
        } else {
          setUser(null);
          setProfileLoading(false);
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

  const signUp = async (email: string, password: string, userType: 'hunter' | 'business', businessData?: any) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          user_type: userType,
          business_data: businessData
        }
      }
    });

    return { data, error };
  };

  const createBusinessProfile = async (user: User, businessData: any, email: string) => {
    try {
      const { error } = await (supabase as any)
        .from('businesses')
        .insert({
          id: user.id,
          name: businessData.name,
          email: email,
          phone: businessData.phone,
          address: businessData.address,
          category: businessData.category,
          description: businessData.description
        });

      if (error) {
        console.error('Error creating business profile:', error);
        throw new Error('Failed to create business profile');
      }
    } catch (error) {
      console.error('Error in createBusinessProfile:', error);
      throw error;
    }
  };

  const createUserProfile = async (user: User) => {
    try {
      const { error } = await (supabase as any).from('user_profiles').insert({
        id: user.id,
      });

      if (error) {
        console.error('Error creating user profile:', error);
        throw new Error('Failed to create user profile');
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    loading,
    profileLoading,
    signIn,
    signUp,
    signOut,
    createBusinessProfile,
    createUserProfile,
  };
}