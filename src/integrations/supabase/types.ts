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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      academy_achievements: {
        Row: {
          created_at: string
          description: string | null
          icon_type: string | null
          id: string
          title: string
          year: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_type?: string | null
          id?: string
          title: string
          year: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_type?: string | null
          id?: string
          title?: string
          year?: string
        }
        Relationships: []
      }
      academy_events: {
        Row: {
          audience: string
          created_at: string
          created_by: string | null
          description: string | null
          display_color: string
          end_time: string | null
          event_date: string
          id: string
          is_all_day: boolean
          location: string | null
          start_time: string | null
          title: string
          updated_at: string
        }
        Insert: {
          audience?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_color?: string
          end_time?: string | null
          event_date: string
          id?: string
          is_all_day?: boolean
          location?: string | null
          start_time?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_color?: string
          end_time?: string | null
          event_date?: string
          id?: string
          is_all_day?: boolean
          location?: string | null
          start_time?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      achievements: {
        Row: {
          created_at: string
          date: string | null
          description: string | null
          id: string
          student_id: string
          title: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          student_id: string
          title: string
        }
        Update: {
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          student_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          message: string
          target_batch: string | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          message: string
          target_batch?: string | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          message?: string
          target_batch?: string | null
          title?: string
        }
        Relationships: []
      }
      daily_reports: {
        Row: {
          attendance: string
          created_at: string
          date: string
          id: string
          performance: string | null
          remarks: string | null
          sensei_id: string | null
          skills_practiced: string | null
          student_id: string
        }
        Insert: {
          attendance?: string
          created_at?: string
          date?: string
          id?: string
          performance?: string | null
          remarks?: string | null
          sensei_id?: string | null
          skills_practiced?: string | null
          student_id: string
        }
        Update: {
          attendance?: string
          created_at?: string
          date?: string
          id?: string
          performance?: string | null
          remarks?: string | null
          sensei_id?: string | null
          skills_practiced?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_reports_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      fees: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          note: string | null
          plan_name: string
          price: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          note?: string | null
          plan_name: string
          price: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          note?: string | null
          plan_name?: string
          price?: string
        }
        Relationships: []
      }
      gallery_photos: {
        Row: {
          alt_text: string | null
          category: string
          created_at: string
          display_order: number | null
          id: string
          image_url: string
        }
        Insert: {
          alt_text?: string | null
          category?: string
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
        }
        Update: {
          alt_text?: string | null
          category?: string
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          belt_level: string
          contact_number: string | null
          created_at: string
          date_of_birth: string | null
          date_of_joining: string | null
          father_name: string | null
          full_name: string
          id: string
          profile_photo_url: string | null
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          belt_level?: string
          contact_number?: string | null
          created_at?: string
          date_of_birth?: string | null
          date_of_joining?: string | null
          father_name?: string | null
          full_name: string
          id?: string
          profile_photo_url?: string | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          belt_level?: string
          contact_number?: string | null
          created_at?: string
          date_of_birth?: string | null
          date_of_joining?: string | null
          father_name?: string | null
          full_name?: string
          id?: string
          profile_photo_url?: string | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      timings: {
        Row: {
          batch_name: string
          created_at: string
          days: string
          display_order: number | null
          id: string
          time_slot: string
        }
        Insert: {
          batch_name: string
          created_at?: string
          days: string
          display_order?: number | null
          id?: string
          time_slot: string
        }
        Update: {
          batch_name?: string
          created_at?: string
          days?: string
          display_order?: number | null
          id?: string
          time_slot?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weekly_reports: {
        Row: {
          id: string
          pushed_at: string
          student_id: string
          summary: string | null
          week_end: string
          week_start: string
        }
        Insert: {
          id?: string
          pushed_at?: string
          student_id: string
          summary?: string | null
          week_end: string
          week_start: string
        }
        Update: {
          id?: string
          pushed_at?: string
          student_id?: string
          summary?: string | null
          week_end?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_reports_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "student"
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
      app_role: ["admin", "student"],
    },
  },
} as const
