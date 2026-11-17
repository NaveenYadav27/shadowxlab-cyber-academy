export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      programmes: {
        Row: {
          id: string;
          title: string;
          description: string;
          instructor: string;
          location: string;
          start_date: string | null;
          end_date: string | null;
          duration_label: string;
          initial_progress: number;
          published: boolean;
          archived: boolean;
          capstone_title: string;
          completion_rules: Json;
          is_system_seed: boolean;
          seed_version: number;
          customized_by_user: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          title: string;
          description?: string;
          instructor?: string;
          location?: string;
          start_date?: string | null;
          end_date?: string | null;
          duration_label?: string;
          initial_progress?: number;
          published?: boolean;
          archived?: boolean;
          capstone_title?: string;
          completion_rules?: Json;
          is_system_seed?: boolean;
          seed_version?: number;
          customized_by_user?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["programmes"]["Insert"]>;
      };
      programme_days: {
        Row: {
          programme_id: string;
          day_id: string;
          day_index: number;
          title: string;
          topics: string[];
          is_system_seed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          programme_id: string;
          day_id: string;
          day_index: number;
          title: string;
          topics?: string[];
          is_system_seed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["programme_days"]["Insert"]>;
      };
      programme_sessions: {
        Row: {
          id: string;
          programme_id: string;
          day_id: string;
          session_index: number;
          start_time: string;
          end_time: string;
          title: string;
          kind: "lesson" | "lab" | "capstone" | "assessment";
          description: string;
          is_system_seed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          programme_id: string;
          day_id: string;
          session_index: number;
          start_time: string;
          end_time: string;
          title: string;
          kind: "lesson" | "lab" | "capstone" | "assessment";
          description?: string;
          is_system_seed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["programme_sessions"]["Insert"]>;
      };
      programme_labs: {
        Row: {
          id: string;
          programme_id: string;
          day_id: string;
          title: string;
          instructions: string[];
          checklist: string[];
          is_system_seed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          programme_id: string;
          day_id: string;
          title: string;
          instructions?: string[];
          checklist?: string[];
          is_system_seed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["programme_labs"]["Insert"]>;
      };
      programme_assessments: {
        Row: {
          id: string;
          programme_id: string;
          question_index: number;
          prompt: string;
          options: string[];
          answer: number;
          is_system_seed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          programme_id: string;
          question_index: number;
          prompt: string;
          options?: string[];
          answer?: number;
          is_system_seed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["programme_assessments"]["Insert"]>;
      };
      programme_resources: {
        Row: {
          id: string;
          programme_id: string;
          title: string;
          url: string;
          kind: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          programme_id: string;
          title: string;
          url?: string;
          kind?: string;
          created_by?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["programme_resources"]["Insert"]>;
      };
      learner_session_progress: {
        Row: {
          user_id: string;
          programme_id: string;
          session_id: string;
          completed: boolean;
          completed_at: string;
        };
        Insert: {
          user_id?: string;
          programme_id: string;
          session_id: string;
          completed?: boolean;
          completed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["learner_session_progress"]["Insert"]>;
      };
      learner_lab_progress: {
        Row: {
          user_id: string;
          programme_id: string;
          checklist_key: string;
          checked: boolean;
          updated_at: string;
        };
        Insert: {
          user_id?: string;
          programme_id: string;
          checklist_key: string;
          checked?: boolean;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["learner_lab_progress"]["Insert"]>;
      };
      session_attendance: {
        Row: {
          user_id: string;
          programme_id: string;
          session_id: string;
          attended: boolean;
          recorded_at: string;
        };
        Insert: {
          user_id?: string;
          programme_id: string;
          session_id: string;
          attended?: boolean;
          recorded_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["session_attendance"]["Insert"]>;
      };
      assessment_attempts: {
        Row: {
          id: string;
          user_id: string;
          programme_id: string;
          score: number;
          answers: Json;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          programme_id: string;
          score: number;
          answers?: Json;
          submitted_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["assessment_attempts"]["Insert"]>;
      };
      learner_simulation_state: {
        Row: {
          user_id: string;
          programme_id: string;
          firewall_enabled: boolean;
          nat_enabled: boolean;
          vpn_connected: boolean;
          updated_at: string;
        };
        Insert: {
          user_id?: string;
          programme_id: string;
          firewall_enabled?: boolean;
          nat_enabled?: boolean;
          vpn_connected?: boolean;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["learner_simulation_state"]["Insert"]>;
      };
      user_roles: {
        Row: {
          user_id: string;
          role: "student" | "instructor" | "administrator";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          role?: "student" | "instructor" | "administrator";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_roles"]["Insert"]>;
      };
    };
  };
}
