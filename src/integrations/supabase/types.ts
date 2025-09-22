export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      business_audit_log: {
        Row: {
          access_type: string
          accessed_at: string | null
          accessed_by: string | null
          business_id: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
        }
        Insert: {
          access_type: string
          accessed_at?: string | null
          accessed_by?: string | null
          business_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string | null
          accessed_by?: string | null
          business_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_audit_log_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_hours: {
        Row: {
          business_id: string
          close_time: string | null
          created_at: string
          day_of_week: number
          id: string
          is_closed: boolean
          open_time: string | null
        }
        Insert: {
          business_id: string
          close_time?: string | null
          created_at?: string
          day_of_week: number
          id?: string
          is_closed?: boolean
          open_time?: string | null
        }
        Update: {
          business_id?: string
          close_time?: string | null
          created_at?: string
          day_of_week?: number
          id?: string
          is_closed?: boolean
          open_time?: string | null
        }
        Relationships: []
      }
      businesses: {
        Row: {
          address: string | null
          category: string
          created_at: string
          description: string | null
          email: string
          id: string
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          phone: string | null
          referral_code: string
          referred_by: string | null
          subscription_plan: string
          subscription_status: string
          timezone: string | null
        }
        Insert: {
          address?: string | null
          category: string
          created_at?: string
          description?: string | null
          email: string
          id?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          phone?: string | null
          referral_code?: string
          referred_by?: string | null
          subscription_plan?: string
          subscription_status?: string
          timezone?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          phone?: string | null
          referral_code?: string
          referred_by?: string | null
          subscription_plan?: string
          subscription_status?: string
          timezone?: string | null
        }
        Relationships: []
      }
      deals: {
        Row: {
          business_id: string
          created_at: string
          description: string
          discount_type: string
          discount_value: string
          expires_at: string
          id: string
          is_active: boolean
          prints: number
          terms: string
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          business_id: string
          created_at?: string
          description: string
          discount_type: string
          discount_value: string
          expires_at: string
          id?: string
          is_active?: boolean
          prints?: number
          terms: string
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          business_id?: string
          created_at?: string
          description?: string
          discount_type?: string
          discount_value?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          prints?: number
          terms?: string
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "deals_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          organization_id: string | null
          payment_amount: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          organization_id?: string | null
          payment_amount?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          organization_id?: string | null
          payment_amount?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          commission_rate: number
          contact_email: string
          created_at: string
          id: string
          is_active: boolean
          keyword: string
          name: string
          total_earnings: number
          total_referrals: number
          updated_at: string
        }
        Insert: {
          commission_rate?: number
          contact_email: string
          created_at?: string
          id?: string
          is_active?: boolean
          keyword: string
          name: string
          total_earnings?: number
          total_referrals?: number
          updated_at?: string
        }
        Update: {
          commission_rate?: number
          contact_email?: string
          created_at?: string
          id?: string
          is_active?: boolean
          keyword?: string
          name?: string
          total_earnings?: number
          total_referrals?: number
          updated_at?: string
        }
        Relationships: []
      }
      qr_scans: {
        Row: {
          business_id: string
          deal_id: string
          id: string
          ip_address: unknown | null
          location: Json | null
          scanned_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          business_id: string
          deal_id: string
          id?: string
          ip_address?: unknown | null
          location?: Json | null
          scanned_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          business_id?: string
          deal_id?: string
          id?: string
          ip_address?: unknown | null
          location?: Json | null
          scanned_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_scans_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_conversions: {
        Row: {
          commission_amount: number
          created_at: string
          id: string
          membership_id: string
          organization_id: string
          user_id: string
        }
        Insert: {
          commission_amount: number
          created_at?: string
          id?: string
          membership_id: string
          organization_id: string
          user_id: string
        }
        Update: {
          commission_amount?: number
          created_at?: string
          id?: string
          membership_id?: string
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_conversions_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_conversions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      share_clicks: {
        Row: {
          business_id: string
          clicked_at: string
          deal_id: string
          id: string
          ip_address: unknown | null
          platform: string | null
          referrer: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          business_id: string
          clicked_at?: string
          deal_id: string
          id?: string
          ip_address?: unknown | null
          platform?: string | null
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          business_id?: string
          clicked_at?: string
          deal_id?: string
          id?: string
          ip_address?: unknown | null
          platform?: string | null
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "share_clicks_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsored_offers: {
        Row: {
          banner_image_url: string | null
          banner_link_url: string | null
          business_id: string
          clicks: number
          created_at: string
          description: string | null
          discount_type: string | null
          discount_value: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          offer_type: string
          terms: string | null
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          banner_image_url?: string | null
          banner_link_url?: string | null
          business_id: string
          clicks?: number
          created_at?: string
          description?: string | null
          discount_type?: string | null
          discount_value?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          offer_type: string
          terms?: string | null
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          banner_image_url?: string | null
          banner_link_url?: string | null
          business_id?: string
          clicks?: number
          created_at?: string
          description?: string | null
          discount_type?: string | null
          discount_value?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          offer_type?: string
          terms?: string | null
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "sponsored_offers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string
          deal_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          id: string
          referral_code: string
          referred_by: string | null
          referred_by_organization: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code?: string
          referred_by?: string | null
          referred_by_organization?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string
          referred_by?: string | null
          referred_by_organization?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_referred_by_organization_fkey"
            columns: ["referred_by_organization"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_status: {
        Row: {
          ban_reason: string | null
          banned_until: string | null
          created_at: string
          created_by: string | null
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ban_reason?: string | null
          banned_until?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ban_reason?: string | null
          banned_until?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_admin_role: {
        Args: { target_email: string }
        Returns: boolean
      }
      admin_ban_user: {
        Args: {
          ban_duration_hours?: number
          reason?: string
          target_user_id: string
        }
        Returns: boolean
      }
      admin_disable_user: {
        Args: { reason?: string; target_user_id: string }
        Returns: boolean
      }
      admin_unban_user: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      get_active_deals_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_admin_metrics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_all_businesses: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_all_deals: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_all_users: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_business_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_deals_with_safe_business_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          business_category: string
          business_id: string
          business_name: string
          created_at: string
          description: string
          discount_type: string
          discount_value: string
          expires_at: string
          id: string
          is_active: boolean
          prints: number
          terms: string
          title: string
          views: number
        }[]
      }
      get_platform_analytics: {
        Args: { end_date?: string; start_date?: string }
        Returns: Json
      }
      get_public_business_info: {
        Args: {
          business_row: Database["public"]["Tables"]["businesses"]["Row"]
        }
        Returns: Json
      }
      get_qr_scan_analytics: {
        Args: { end_date?: string; start_date?: string }
        Returns: Json
      }
      get_referral_analytics: {
        Args: { end_date?: string; start_date?: string }
        Returns: Json
      }
      get_safe_businesses: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          created_at: string
          description: string
          id: string
          logo_url: string
          name: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_business_open_now: {
        Args: { business_uuid: string }
        Returns: boolean
      }
      remove_admin_role: {
        Args: { target_email: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
