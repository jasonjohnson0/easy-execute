import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Business } from '@/types/database';
import { authRateLimiter } from '@/lib/security/sanitization';
import { updateBusinessData, logBusinessAccess } from '@/lib/security/businessData';

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
  const [isNewBusinessUser, setIsNewBusinessUser] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const fetchUserProfile = async (authUser: User, isVerificationEvent = false) => {
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
          
          // If this is from email verification and it's a new business user, show welcome modal
          if (isVerificationEvent && userMetadata?.user_type === 'business') {
            setIsNewBusinessUser(true);
            setTimeout(() => setShowWelcomeModal(true), 1000);
          }
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

      // Check if this is a returning business user after email verification
      if (isVerificationEvent && userMetadata?.user_type === 'business' && business) {
        setIsNewBusinessUser(true);
        setTimeout(() => setShowWelcomeModal(true), 1000);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(authUser);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    let isComponentMounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, !!session?.user);
        
        if (!isComponentMounted) return;
        
        // Only synchronous state updates here
        if (session?.user) {
          // Check if this is an email verification event
          const isVerificationEvent = event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN';
          
          // Defer Supabase calls with setTimeout to prevent deadlocks
          setTimeout(() => {
            if (isComponentMounted) {
              fetchUserProfile(session.user, isVerificationEvent);
            }
          }, 0);
        } else {
          setUser(null);
          setProfileLoading(false);
          setShowWelcomeModal(false);
          setIsNewBusinessUser(false);
        }
        setLoading(false);
      }
    );

    // THEN get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          setLoading(false);
          return;
        }
        
        console.log('Initial session loaded:', !!session?.user);
        
        if (!isComponentMounted) return;
        
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      isComponentMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    // Rate limiting check
    if (!authRateLimiter.isAllowed(email)) {
      return { error: new Error('Too many login attempts. Please try again in 5 minutes.') };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.warn(`Failed login attempt for ${email}:`, error.message);
    } else {
      // Reset rate limiter on successful login
      authRateLimiter.reset(email);
    }

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
      // Sanitize business data before insertion
      const sanitizedData = {
        id: user.id,
        name: businessData.name,
        email: email,
        phone: businessData.phone,
        address: businessData.address,
        category: businessData.category,
        description: businessData.description
      };

      const { error } = await (supabase as any)
        .from('businesses')
        .insert(sanitizedData);

      if (error) {
        console.error('Error creating business profile:', error);
        throw new Error('Failed to create business profile');
      }

      // Log the business profile creation
      await logBusinessAccess(user.id, 'PROFILE_CREATED');
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
    isNewBusinessUser,
    showWelcomeModal,
    setShowWelcomeModal,
    signIn,
    signUp,
    signOut,
    createBusinessProfile,
    createUserProfile,
  };
}