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
      assistant_conversations: {
        Row: {
          answer: string
          context_trades_count: number | null
          created_at: string
          id: string
          question: string
          user_id: string
        }
        Insert: {
          answer: string
          context_trades_count?: number | null
          created_at?: string
          id?: string
          question: string
          user_id: string
        }
        Update: {
          answer?: string
          context_trades_count?: number | null
          created_at?: string
          id?: string
          question?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_prep: {
        Row: {
          checklist: Json | null
          created_at: string
          date: string
          id: string
          key_levels: string | null
          market_outlook: string | null
          mindset: string | null
          trading_plan: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          checklist?: Json | null
          created_at?: string
          date: string
          id?: string
          key_levels?: string | null
          market_outlook?: string | null
          mindset?: string | null
          trading_plan?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          checklist?: Json | null
          created_at?: string
          date?: string
          id?: string
          key_levels?: string | null
          market_outlook?: string | null
          mindset?: string | null
          trading_plan?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_summaries: {
        Row: {
          created_at: string
          date: string
          highlights: Json | null
          id: string
          net_pnl: number
          suggestions: Json | null
          summary_text: string
          trades_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          highlights?: Json | null
          id?: string
          net_pnl?: number
          suggestions?: Json | null
          summary_text: string
          trades_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          highlights?: Json | null
          id?: string
          net_pnl?: number
          suggestions?: Json | null
          summary_text?: string
          trades_count?: number
          user_id?: string
        }
        Relationships: []
      }
      email_change_tracking: {
        Row: {
          change_type: string
          created_at: string
          id: string
          new_email: string | null
          old_email: string | null
          user_id: string
        }
        Insert: {
          change_type: string
          created_at?: string
          id?: string
          new_email?: string | null
          old_email?: string | null
          user_id: string
        }
        Update: {
          change_type?: string
          created_at?: string
          id?: string
          new_email?: string | null
          old_email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string | null
          date: string
          id: string
          linked_trade_ids: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          date: string
          id?: string
          linked_trade_ids?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          date?: string
          id?: string
          linked_trade_ids?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      news_cache: {
        Row: {
          articles: Json
          cache_key: string
          created_at: string
          expires_at: string
          id: string
          sentiment_data: Json | null
          symbols: string[]
        }
        Insert: {
          articles: Json
          cache_key: string
          created_at?: string
          expires_at: string
          id?: string
          sentiment_data?: Json | null
          symbols: string[]
        }
        Update: {
          articles?: Json
          cache_key?: string
          created_at?: string
          expires_at?: string
          id?: string
          sentiment_data?: Json | null
          symbols?: string[]
        }
        Relationships: []
      }
      news_source_preferences: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          source_id: string
          source_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          source_id: string
          source_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          source_id?: string
          source_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      news_translations: {
        Row: {
          article_uuid: string
          created_at: string | null
          expires_at: string | null
          id: string
          language: string
          translated_description: string | null
          translated_title: string
        }
        Insert: {
          article_uuid: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          language: string
          translated_description?: string | null
          translated_title: string
        }
        Update: {
          article_uuid?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          language?: string
          translated_description?: string | null
          translated_title?: string
        }
        Relationships: []
      }
      ninjatrader_executions: {
        Row: {
          account: string
          account_type: string | null
          action: string
          created_at: string | null
          execution_id: string
          id: string
          instrument: string
          market: string
          market_position: string | null
          order_id: string | null
          price: number
          quantity: number
          symbol: string
          timestamp: string
          user_id: string
        }
        Insert: {
          account: string
          account_type?: string | null
          action: string
          created_at?: string | null
          execution_id: string
          id?: string
          instrument: string
          market: string
          market_position?: string | null
          order_id?: string | null
          price: number
          quantity: number
          symbol: string
          timestamp: string
          user_id: string
        }
        Update: {
          account?: string
          account_type?: string | null
          action?: string
          created_at?: string | null
          execution_id?: string
          id?: string
          instrument?: string
          market?: string
          market_position?: string | null
          order_id?: string | null
          price?: number
          quantity?: number
          symbol?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name?: string
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          id: string
          ip_address: string
          request_count: number
          window_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address: string
          request_count?: number
          window_start?: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      sector_sentiments: {
        Row: {
          article_count: number | null
          articles: Json | null
          avg_sentiment: number | null
          created_at: string | null
          date: string
          expires_at: string
          id: string
          sector: string
        }
        Insert: {
          article_count?: number | null
          articles?: Json | null
          avg_sentiment?: number | null
          created_at?: string | null
          date: string
          expires_at: string
          id?: string
          sector: string
        }
        Update: {
          article_count?: number | null
          articles?: Json | null
          avg_sentiment?: number | null
          created_at?: string | null
          date?: string
          expires_at?: string
          id?: string
          sector?: string
        }
        Relationships: []
      }
      trades: {
        Row: {
          account_name: string | null
          account_size_at_trade: number | null
          account_type: string | null
          created_at: string | null
          entry_price: number
          entry_time: string
          exit_price: number
          exit_time: string
          fees: number | null
          id: string
          initial_risk: number | null
          mae_price: number | null
          market: string | null
          mfe_price: number | null
          news_context: Json | null
          note: string | null
          pnl_net: number
          qty: number
          r: number | null
          rating: number | null
          screenshot_url: string | null
          setup: string | null
          setup_checklist_completed: boolean[] | null
          side: string
          stop_loss_price: number | null
          symbol: string
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_name?: string | null
          account_size_at_trade?: number | null
          account_type?: string | null
          created_at?: string | null
          entry_price: number
          entry_time: string
          exit_price: number
          exit_time: string
          fees?: number | null
          id?: string
          initial_risk?: number | null
          mae_price?: number | null
          market?: string | null
          mfe_price?: number | null
          news_context?: Json | null
          note?: string | null
          pnl_net: number
          qty: number
          r?: number | null
          rating?: number | null
          screenshot_url?: string | null
          setup?: string | null
          setup_checklist_completed?: boolean[] | null
          side: string
          stop_loss_price?: number | null
          symbol: string
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_name?: string | null
          account_size_at_trade?: number | null
          account_type?: string | null
          created_at?: string | null
          entry_price?: number
          entry_time?: string
          exit_price?: number
          exit_time?: string
          fees?: number | null
          id?: string
          initial_risk?: number | null
          mae_price?: number | null
          market?: string | null
          mfe_price?: number | null
          news_context?: Json | null
          note?: string | null
          pnl_net?: number
          qty?: number
          r?: number | null
          rating?: number | null
          screenshot_url?: string | null
          setup?: string | null
          setup_checklist_completed?: boolean[] | null
          side?: string
          stop_loss_price?: number | null
          symbol?: string
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achieved_at: string | null
          achievement_type: string
          id: string
          metadata: Json | null
          notified: boolean | null
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          achievement_type: string
          id?: string
          metadata?: Json | null
          notified?: boolean | null
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          achievement_type?: string
          id?: string
          metadata?: Json | null
          notified?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          base_currency: string | null
          created_at: string | null
          daily_goal_amount: number | null
          daily_goal_max_trades: number | null
          default_fees: number | null
          default_slippage: number | null
          drawdown_warning_threshold: number | null
          id: string
          notification_sound: boolean | null
          notifications_enabled: boolean | null
          setup_definitions: Json | null
          setups: string[] | null
          subscription_tier: string | null
          tags: string[] | null
          timezone: string | null
          updated_at: string | null
          user_id: string
          webhook_api_key: string | null
        }
        Insert: {
          base_currency?: string | null
          created_at?: string | null
          daily_goal_amount?: number | null
          daily_goal_max_trades?: number | null
          default_fees?: number | null
          default_slippage?: number | null
          drawdown_warning_threshold?: number | null
          id?: string
          notification_sound?: boolean | null
          notifications_enabled?: boolean | null
          setup_definitions?: Json | null
          setups?: string[] | null
          subscription_tier?: string | null
          tags?: string[] | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
          webhook_api_key?: string | null
        }
        Update: {
          base_currency?: string | null
          created_at?: string | null
          daily_goal_amount?: number | null
          daily_goal_max_trades?: number | null
          default_fees?: number | null
          default_slippage?: number | null
          drawdown_warning_threshold?: number | null
          id?: string
          notification_sound?: boolean | null
          notifications_enabled?: boolean | null
          setup_definitions?: Json | null
          setups?: string[] | null
          subscription_tier?: string | null
          tags?: string[] | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
          webhook_api_key?: string | null
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string | null
          email: string
          id: string
          ip_address: string | null
          source: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          ip_address?: string | null
          source?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          source?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clean_expired_news_cache: { Args: never; Returns: undefined }
      cleanup_old_ninjatrader_executions: { Args: never; Returns: undefined }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
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
