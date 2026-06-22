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
      audit_logs: {
        Row: {
          action: string | null
          created_at: string
          detail: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      diagnoses: {
        Row: {
          created_at: string
          doctor_id: string | null
          findings: string | null
          id: string
          patient_id: string | null
          symptoms: string | null
          title: string | null
          treatment: string | null
        }
        Insert: {
          created_at?: string
          doctor_id?: string | null
          findings?: string | null
          id: string
          patient_id?: string | null
          symptoms?: string | null
          title?: string | null
          treatment?: string | null
        }
        Update: {
          created_at?: string
          doctor_id?: string | null
          findings?: string | null
          id?: string
          patient_id?: string | null
          symptoms?: string | null
          title?: string | null
          treatment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnoses_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnoses_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      id_counters: {
        Row: {
          next_val: number
          role: string
        }
        Insert: {
          next_val?: number
          role: string
        }
        Update: {
          next_val?: number
          role?: string
        }
        Relationships: []
      }
      lab_reports: {
        Row: {
          created_at: string
          id: string
          lab_id: string | null
          patient_id: string | null
          status: string | null
          summary: string | null
          test_date: string | null
          test_name: string | null
        }
        Insert: {
          created_at?: string
          id: string
          lab_id?: string | null
          patient_id?: string | null
          status?: string | null
          summary?: string | null
          test_date?: string | null
          test_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          lab_id?: string | null
          patient_id?: string | null
          status?: string | null
          summary?: string | null
          test_date?: string | null
          test_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_reports_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_reports_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_docs: {
        Row: {
          created_at: string
          doc_date: string | null
          doc_type: string | null
          id: string
          notes: string | null
          patient_id: string | null
          staff_id: string | null
        }
        Insert: {
          created_at?: string
          doc_date?: string | null
          doc_type?: string | null
          id: string
          notes?: string | null
          patient_id?: string | null
          staff_id?: string | null
        }
        Update: {
          created_at?: string
          doc_date?: string | null
          doc_type?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_docs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_docs_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string
          diagnosis: string | null
          doctor_id: string | null
          drugs: string | null
          id: string
          patient_id: string | null
        }
        Insert: {
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string | null
          drugs?: string | null
          id: string
          patient_id?: string | null
        }
        Update: {
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string | null
          drugs?: string | null
          id?: string
          patient_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      users: {
        Row: {
          address: string | null
          auth_user_id: string | null
          created_at: string
          dob: string | null
          email: string | null
          gender: string | null
          hospital: string | null
          id: string
          lab_name: string | null
          mobile: string | null
          name: string | null
          org: string | null
          reg_number: string | null
          role: string
        }
        Insert: {
          address?: string | null
          auth_user_id?: string | null
          created_at?: string
          dob?: string | null
          email?: string | null
          gender?: string | null
          hospital?: string | null
          id: string
          lab_name?: string | null
          mobile?: string | null
          name?: string | null
          org?: string | null
          reg_number?: string | null
          role: string
        }
        Update: {
          address?: string | null
          auth_user_id?: string | null
          created_at?: string
          dob?: string | null
          email?: string | null
          gender?: string | null
          hospital?: string | null
          id?: string
          lab_name?: string | null
          mobile?: string | null
          name?: string | null
          org?: string | null
          reg_number?: string | null
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_profile_id: { Args: never; Returns: string }
      get_next_id: { Args: { role_key: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "patient" | "doctor" | "lab" | "mrs"
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
      app_role: ["patient", "doctor", "lab", "mrs"],
    },
  },
} as const
