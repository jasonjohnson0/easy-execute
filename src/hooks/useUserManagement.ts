import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface UserManagementActions {
  banUser: (userId: string, durationHours?: number, reason?: string) => Promise<void>;
  unbanUser: (userId: string) => Promise<void>;
  disableUser: (userId: string, reason?: string) => Promise<void>;
  promoteToAdmin: (email: string) => Promise<void>;
  demoteFromAdmin: (email: string) => Promise<void>;
}

export function useUserManagement(): UserManagementActions {
  const queryClient = useQueryClient();

  const banUserMutation = useMutation({
    mutationFn: async ({
      userId,
      durationHours,
      reason
    }: {
      userId: string;
      durationHours?: number;
      reason?: string;
    }) => {
      const { data, error } = await supabase.rpc('admin_ban_user', {
        target_user_id: userId,
        ban_duration_hours: durationHours,
        reason: reason || 'No reason provided'
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-users'] });
      toast({
        title: "User banned successfully",
        description: "The user has been banned from the platform",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to ban user",
        description: error.message || "An error occurred while banning the user",
        variant: "destructive",
      });
    }
  });

  const unbanUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.rpc('admin_unban_user', {
        target_user_id: userId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-users'] });
      toast({
        title: "User unbanned successfully",
        description: "The user has been unbanned and can access the platform again",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to unban user",
        description: error.message || "An error occurred while unbanning the user",
        variant: "destructive",
      });
    }
  });

  const disableUserMutation = useMutation({
    mutationFn: async ({
      userId,
      reason
    }: {
      userId: string;
      reason?: string;
    }) => {
      const { data, error } = await supabase.rpc('admin_disable_user', {
        target_user_id: userId,
        reason: reason || 'Account disabled by administrator'
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-users'] });
      toast({
        title: "User disabled successfully",
        description: "The user account has been disabled",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to disable user",
        description: error.message || "An error occurred while disabling the user",
        variant: "destructive",
      });
    }
  });

  const promoteToAdminMutation = useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase.rpc('add_admin_role', {
        target_email: email
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-users'] });
      toast({
        title: "User promoted to admin",
        description: "The user has been granted admin privileges",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to promote user",
        description: error.message || "An error occurred while promoting the user",
        variant: "destructive",
      });
    }
  });

  const demoteFromAdminMutation = useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase.rpc('remove_admin_role', {
        target_email: email
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-users'] });
      toast({
        title: "Admin privileges revoked",
        description: "The user no longer has admin privileges",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to demote user",
        description: error.message || "An error occurred while demoting the user",
        variant: "destructive",
      });
    }
  });

  return {
    banUser: async (userId: string, durationHours?: number, reason?: string) => {
      banUserMutation.mutate({ userId, durationHours, reason });
    },
    unbanUser: async (userId: string) => {
      unbanUserMutation.mutate(userId);
    },
    disableUser: async (userId: string, reason?: string) => {
      disableUserMutation.mutate({ userId, reason });
    },
    promoteToAdmin: async (email: string) => {
      promoteToAdminMutation.mutate(email);
    },
    demoteFromAdmin: async (email: string) => {
      demoteFromAdminMutation.mutate(email);
    }
  };
}