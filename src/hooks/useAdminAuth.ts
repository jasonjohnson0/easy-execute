import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useAdminAuth() {
  console.log('useAdminAuth: Starting hook initialization');
  
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  console.log('useAdminAuth: Hooks initialized, user:', !!user);

  useEffect(() => {
    let isMounted = true;
    
    const checkAdminStatus = async () => {
      console.log('Checking admin status for user:', !!user, user?.id);
      
      if (!user) {
        console.log('No user found, setting isAdmin to false');
        if (isMounted) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      try {
        console.log('Calling has_role RPC for user:', user.id);
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });

        if (error) {
          console.error('RPC error:', error);
          throw error;
        }
        
        console.log('Admin check result:', data);
        if (isMounted) {
          setIsAdmin(data || false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        if (isMounted) {
          setIsAdmin(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAdminStatus();
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  return { isAdmin, loading };
}