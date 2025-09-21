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
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code?: string
          referred_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string
          referred_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      get_business_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_public_business_info: {
        Args: {
          business_row: Database["public"]["Tables"]["businesses"]["Row"]
        }
        Returns: Json
      }
      is_business_open_now: {
        Args: { business_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
