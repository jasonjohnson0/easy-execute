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
      console.log('🔍 Fetching profile for user:', authUser.id, authUser.email);
      
      // Check if this is a new user that needs profile creation
      const userMetadata = authUser.user_metadata;
      console.log('📋 User metadata:', userMetadata);
      
      // Check if user is a business owner
      const { data: business, error: businessError } = await (supabase as any)
        .from('businesses')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      console.log('🏢 Business query result:', { business, businessError });

      // Check user profile for referral code
      const { data: profile, error: profileError } = await (supabase as any)
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      console.log('👤 Profile query result:', { profile, profileError });

      // If this is a new business user without a profile, create it
      if (userMetadata?.user_type === 'business' && !business && userMetadata?.business_data) {
        try {
          console.log('🆕 Creating new business profile...');
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
          console.log('✅ New business user created:', userWithProfiles);
          setUser(userWithProfiles);
          return;
        } catch (error) {
          console.error('Failed to create business profile on login:', error);
        }
      }

      // If this is a new hunter user without a profile, create it
      if (userMetadata?.user_type === 'hunter' && !profile) {
        try {
          console.log('🆕 Creating new user profile...');
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
          console.log('✅ New hunter user created:', userWithProfiles);
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

      console.log('✅ Final user with profiles:', {
        id: userWithProfiles.id,
        email: userWithProfiles.email,
        hasBusinessProfile: !!userWithProfiles.businessProfile,
        hasUserProfile: !!userWithProfiles.userProfile,
        businessProfile: userWithProfiles.businessProfile
      });

      setUser(userWithProfiles);
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
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
      (event, session) => {
        // Only synchronous state updates here
        if (session?.user) {
          // Defer Supabase calls with setTimeout to prevent deadlocks
          setTimeout(() => {
            fetchUserProfile(session.user);
          }, 0);
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
    signIn,
    signUp,
    signOut,
    createBusinessProfile,
    createUserProfile,
  };
}