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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      business_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          event_date: string
          event_time: string | null
          event_type: string
          id: string
          is_completed: boolean | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          event_date: string
          event_time?: string | null
          event_type?: string
          id?: string
          is_completed?: boolean | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          event_type?: string
          id?: string
          is_completed?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      inventory_checklist: {
        Row: {
          created_at: string
          id: string
          is_checked: boolean | null
          item_name: string
          notes: string | null
          priority: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_checked?: boolean | null
          item_name: string
          notes?: string | null
          priority?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_checked?: boolean | null
          item_name?: string
          notes?: string | null
          priority?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      order_request_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          request_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          request_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_request_images_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "order_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      order_requests: {
        Row: {
          budget: string | null
          cake_type: string
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          event_date: string
          event_type: string | null
          id: string
          request_details: string | null
          servings: number | null
          status: string
          updated_at: string
        }
        Insert: {
          budget?: string | null
          cake_type: string
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          event_date: string
          event_type?: string | null
          id?: string
          request_details?: string | null
          servings?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          budget?: string | null
          cake_type?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          event_date?: string
          event_type?: string | null
          id?: string
          request_details?: string | null
          servings?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_supplies: {
        Row: {
          cost: number | null
          created_at: string
          id: string
          order_id: string
          quantity_used: number
          supply_id: string
          user_id: string
        }
        Insert: {
          cost?: number | null
          created_at?: string
          id?: string
          order_id: string
          quantity_used: number
          supply_id: string
          user_id: string
        }
        Update: {
          cost?: number | null
          created_at?: string
          id?: string
          order_id?: string
          quantity_used?: number
          supply_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_supplies_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_supplies_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: false
            referencedRelation: "supplies"
            referencedColumns: ["id"]
          },
        ]
      }
      order_vision_images: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          order_id: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          order_id: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          order_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_vision_images_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cake_type: string
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          deposit_amount: number | null
          event_date: string
          event_type: string | null
          id: string
          order_notes: string | null
          servings: number | null
          status: string
          total_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cake_type: string
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          deposit_amount?: number | null
          event_date: string
          event_type?: string | null
          id?: string
          order_notes?: string | null
          servings?: number | null
          status?: string
          total_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cake_type?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          deposit_amount?: number | null
          event_date?: string
          event_type?: string | null
          id?: string
          order_notes?: string | null
          servings?: number | null
          status?: string
          total_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          order_id: string
          payment_date: string
          payment_method: string
          payment_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          payment_date?: string
          payment_method: string
          payment_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          payment_date?: string
          payment_method?: string
          payment_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_name: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_name?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          ip_address: string
          request_count: number
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          ip_address: string
          request_count?: number
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      seasonal_special_images: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string
          special_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          special_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          special_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seasonal_special_images_special_id_fkey"
            columns: ["special_id"]
            isOneToOne: false
            referencedRelation: "seasonal_specials"
            referencedColumns: ["id"]
          },
        ]
      }
      seasonal_specials: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          order_count: number | null
          price: number | null
          season: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          order_count?: number | null
          price?: number | null
          season: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          order_count?: number | null
          price?: number | null
          season?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      supplies: {
        Row: {
          category: string
          created_at: string
          current_stock: number | null
          id: string
          is_low_stock: boolean | null
          low_stock_threshold: number | null
          name: string
          unit: string
          unit_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          current_stock?: number | null
          id?: string
          is_low_stock?: boolean | null
          low_stock_threshold?: number | null
          name: string
          unit: string
          unit_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          current_stock?: number | null
          id?: string
          is_low_stock?: boolean | null
          low_stock_threshold?: number | null
          name?: string
          unit?: string
          unit_price?: number
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
      check_rate_limit: {
        Args: {
          p_endpoint: string
          p_ip_address: string
          p_max_requests?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_rate_limits: { Args: never; Returns: undefined }
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
