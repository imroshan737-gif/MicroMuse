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
      achievements: {
        Row: {
          badge_url: string | null
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
          points: number | null
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          badge_url?: string | null
          created_at?: string | null
          description: string
          icon: string
          id?: string
          name: string
          points?: number | null
          requirement_type: string
          requirement_value: number
        }
        Update: {
          badge_url?: string | null
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
          points?: number | null
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      challenges: {
        Row: {
          category: Database["public"]["Enums"]["challenge_category"]
          created_at: string | null
          description: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          points: number | null
          title: string
          type: Database["public"]["Enums"]["challenge_type"]
        }
        Insert: {
          category: Database["public"]["Enums"]["challenge_category"]
          created_at?: string | null
          description: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          points?: number | null
          title: string
          type: Database["public"]["Enums"]["challenge_type"]
        }
        Update: {
          category?: Database["public"]["Enums"]["challenge_category"]
          created_at?: string | null
          description?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          points?: number | null
          title?: string
          type?: Database["public"]["Enums"]["challenge_type"]
        }
        Relationships: []
      }
      hobbies: {
        Row: {
          category: string
          created_at: string | null
          emoji: string | null
          icon: string | null
          id: string
          is_trending: boolean | null
          name: string
          popularity_count: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          emoji?: string | null
          icon?: string | null
          id?: string
          is_trending?: boolean | null
          name: string
          popularity_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          emoji?: string | null
          icon?: string | null
          id?: string
          is_trending?: boolean | null
          name?: string
          popularity_count?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          current_streak: number | null
          email: string
          full_name: string | null
          id: string
          is_profile_public: boolean | null
          location: string | null
          longest_streak: number | null
          mood: string | null
          profile_completion: number | null
          total_points: number | null
          total_sessions: number | null
          two_factor_enabled: boolean | null
          updated_at: string | null
          user_status: Database["public"]["Enums"]["user_status"] | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          current_streak?: number | null
          email: string
          full_name?: string | null
          id: string
          is_profile_public?: boolean | null
          location?: string | null
          longest_streak?: number | null
          mood?: string | null
          profile_completion?: number | null
          total_points?: number | null
          total_sessions?: number | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_status?: Database["public"]["Enums"]["user_status"] | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          current_streak?: number | null
          email?: string
          full_name?: string | null
          id?: string
          is_profile_public?: boolean | null
          location?: string | null
          longest_streak?: number | null
          mood?: string | null
          profile_completion?: number | null
          total_points?: number | null
          total_sessions?: number | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_status?: Database["public"]["Enums"]["user_status"] | null
          username?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity: {
        Row: {
          activity_date: string
          created_at: string | null
          id: string
          points_earned: number | null
          sessions_count: number | null
          user_id: string
        }
        Insert: {
          activity_date: string
          created_at?: string | null
          id?: string
          points_earned?: number | null
          sessions_count?: number | null
          user_id: string
        }
        Update: {
          activity_date?: string
          created_at?: string | null
          id?: string
          points_earned?: number | null
          sessions_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenges: {
        Row: {
          challenge_id: string
          completed_at: string | null
          id: string
          is_completed: boolean | null
          score: number | null
          started_at: string | null
          submission_url: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          score?: number | null
          started_at?: string | null
          submission_url?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          id?: string
          is_completed?: boolean | null
          score?: number | null
          started_at?: string | null
          submission_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_challenges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_hobbies: {
        Row: {
          created_at: string | null
          display_order: number | null
          hobby_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          hobby_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          hobby_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_hobbies_hobby_id_fkey"
            columns: ["hobby_id"]
            isOneToOne: false
            referencedRelation: "hobbies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_hobbies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      app_role: "admin" | "user"
      challenge_category:
        | "music"
        | "art"
        | "writing"
        | "dance"
        | "coding"
        | "photography"
        | "fitness"
        | "cooking"
        | "gaming"
        | "design"
      challenge_type: "daily" | "weekly" | "personal"
      difficulty_level: "beginner" | "moderate" | "expert"
      user_status: "online" | "away" | "busy" | "offline"
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
      app_role: ["admin", "user"],
      challenge_category: [
        "music",
        "art",
        "writing",
        "dance",
        "coding",
        "photography",
        "fitness",
        "cooking",
        "gaming",
        "design",
      ],
      challenge_type: ["daily", "weekly", "personal"],
      difficulty_level: ["beginner", "moderate", "expert"],
      user_status: ["online", "away", "busy", "offline"],
    },
  },
} as const
