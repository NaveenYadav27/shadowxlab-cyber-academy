import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase-client";
import demoStudentsData from "@/data/demo-students.json";

export type UserRole = "guest" | "student" | "instructor" | "administrator";

export interface DemoStudentProfile {
  id: string;
  email: string;
  name: string;
  badge: string;
  role: UserRole;
  seat: string;
}

export const DEMO_STUDENTS: DemoStudentProfile[] = demoStudentsData as DemoStudentProfile[];
export const DEFAULT_DEMO_PASSWORD = "Student@2026";
const LOCAL_DEMO_USER_KEY = "shadowxlab_demo_user_v1";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  isGuest: boolean;
  createdAt?: string | undefined;
  lastSignInAt?: string | undefined;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser | undefined;
  error?: string | undefined;
  requiresEmailConfirmation?: boolean | undefined;
}

const LOCAL_PREVIEW_ROLE_KEY = "shadowxlab_preview_role_v1";

export class AuthService {
  private previewRole: UserRole | null = null;
  private listeners = new Set<(user: AuthUser | null, event?: string) => void>();

  private notifyListeners(user: AuthUser | null, event?: string): void {
    this.listeners.forEach((cb) => {
      try {
        cb(user, event);
      } catch (err) {
        console.error("Auth listener callback error:", err);
      }
    });
  }

  constructor() {
    if (this.isDevEnvironment() && typeof window !== "undefined") {
      try {
        const saved = window.sessionStorage.getItem(LOCAL_PREVIEW_ROLE_KEY);
        if (saved && ["guest", "student", "instructor", "administrator"].includes(saved)) {
          this.previewRole = saved as UserRole;
        }
      } catch {
        // sessionStorage restricted or disabled
      }
    }
  }

  /**
   * Identifies whether the client is executing in development mode.
   * Local role preview is strictly disabled in production builds.
   */
  public isDevEnvironment(): boolean {
    if (typeof import.meta !== "undefined" && import.meta.env) {
      return Boolean(import.meta.env.DEV);
    }
    return false;
  }

  /**
   * Checks if Supabase authentication is available.
   */
  public isAvailable(): boolean {
    return isSupabaseConfigured();
  }

  /**
   * Sets a local preview role for testing role-gated views in local/offline environment.
   * Disabled in production environments.
   */
  public setPreviewRole(role: UserRole | null): void {
    if (!this.isDevEnvironment()) {
      this.previewRole = null;
      return;
    }
    this.previewRole = role;
    if (typeof window !== "undefined") {
      try {
        if (role) {
          window.sessionStorage.setItem(LOCAL_PREVIEW_ROLE_KEY, role);
        } else {
          window.sessionStorage.removeItem(LOCAL_PREVIEW_ROLE_KEY);
        }
      } catch {
        // Ignored
      }
    }
  }

  public getPreviewRole(): UserRole | null {
    if (!this.isDevEnvironment()) {
      return null;
    }
    return this.previewRole;
  }

  /**
   * Fetches the role assigned to a given user ID from the secure public.user_roles table.
   * Never trusts client-side user metadata for privileged operations.
   */
  public async fetchUserRole(userId: string): Promise<UserRole> {
    if (this.isDevEnvironment() && this.previewRole) {
      return this.previewRole;
    }

    const client = getSupabaseClient();
    if (!client) return "student";

    try {
      const { data, error } = await client
        .from("user_roles" as never)
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (error || !data) {
        return "student";
      }

      const roleStr = (data as { role?: string })?.role;
      if (roleStr && ["student", "instructor", "administrator"].includes(roleStr)) {
        return roleStr as UserRole;
      }
      return "student";
    } catch {
      return "student";
    }
  }

  /**
   * Resolves an authenticated user's role, verifying that untrusted user_metadata
   * cannot grant administrator or instructor privileges.
   */
  public resolveRoleFromUser(user: Partial<User>, dbRole?: UserRole): UserRole {
    // Explicit protection against forged user_metadata.role
    if (dbRole && ["student", "instructor", "administrator"].includes(dbRole)) {
      return dbRole;
    }
    return "student";
  }

  /**
   * Retrieves the current user session and resolved role.
   */
  public async getCurrentUser(): Promise<AuthUser | null> {
    if (typeof window !== "undefined") {
      try {
        const rawDemo = window.sessionStorage.getItem(LOCAL_DEMO_USER_KEY);
        if (rawDemo) {
          const parsed = JSON.parse(rawDemo) as AuthUser;
          if (parsed && parsed.id && parsed.email) {
            return parsed;
          }
        }
      } catch {
        // sessionStorage restricted
      }
    }

    const client = getSupabaseClient();
    if (!client) {
      if (this.isDevEnvironment() && this.previewRole && this.previewRole !== "guest") {
        return {
          id: "local-preview-user",
          email: `${this.previewRole}@shadowxlab.local`,
          role: this.previewRole,
          isGuest: false,
          createdAt: new Date().toISOString(),
        };
      }
      return null;
    }

    try {
      const {
        data: { session },
        error,
      } = await client.auth.getSession();

      if (error || !session?.user) {
        if (this.isDevEnvironment() && this.previewRole && this.previewRole !== "guest") {
          return {
            id: "local-preview-user",
            email: `${this.previewRole}@shadowxlab.local`,
            role: this.previewRole,
            isGuest: false,
          };
        }
        return null;
      }

      const user = session.user;
      const role = await this.fetchUserRole(user.id);

      return {
        id: user.id,
        email: user.email ?? "unknown@shadowxlab.com",
        role,
        isGuest: false,
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at,
      };
    } catch {
      return null;
    }
  }

  /**
   * Signs in an existing user with email and password.
   */
  public async signIn(email: string, password: string): Promise<AuthResult> {
    const trimmedEmail = email.trim().toLowerCase();
    const isDemoStudent = DEMO_STUDENTS.find(
      (s) =>
        s.email.toLowerCase() === trimmedEmail ||
        s.email.replace("student0", "student").toLowerCase() === trimmedEmail,
    );

    if (isDemoStudent) {
      if (password !== DEFAULT_DEMO_PASSWORD) {
        return {
          success: false,
          error: "Invalid credentials. Default password for demo students is Student@2026.",
        };
      }

      // If Supabase is available, attempt live authentication as well
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client.auth.signInWithPassword({
            email: isDemoStudent.email,
            password,
          });
          if (!error && data.user) {
            const role = await this.fetchUserRole(data.user.id);
            const user: AuthUser = {
              id: data.user.id,
              email: data.user.email ?? isDemoStudent.email,
              role,
              isGuest: false,
              createdAt: data.user.created_at,
              lastSignInAt: data.user.last_sign_in_at,
            };
            if (typeof window !== "undefined") {
              window.sessionStorage.setItem(LOCAL_DEMO_USER_KEY, JSON.stringify(user));
            }
            this.notifyListeners(user, "SIGNED_IN");
            return { success: true, user };
          }
        } catch {
          // Fall through to instant verified demo session
        }
      }

      // Instant verified demo session for corporate training resilience
      const user: AuthUser = {
        id: isDemoStudent.id,
        email: isDemoStudent.email,
        role: "student",
        isGuest: false,
        createdAt: "2026-11-16T08:00:00.000Z",
        lastSignInAt: new Date().toISOString(),
      };
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(LOCAL_DEMO_USER_KEY, JSON.stringify(user));
      }
      this.notifyListeners(user, "SIGNED_IN");
      return { success: true, user };
    }

    const client = getSupabaseClient();
    if (!client) {
      return {
        success: false,
        error:
          "Supabase authentication is unconfigured. Set VITE_SUPABASE_ANON_KEY to enable remote sign-in.",
      };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return {
          success: false,
          error: "Failed to retrieve user after sign-in.",
        };
      }

      const role = await this.fetchUserRole(data.user.id);
      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email ?? email,
          role,
          isGuest: false,
          createdAt: data.user.created_at,
          lastSignInAt: data.user.last_sign_in_at,
        },
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /**
   * Registers a new student account.
   */
  public async signUp(email: string, password: string): Promise<AuthResult> {
    const client = getSupabaseClient();
    if (!client) {
      return {
        success: false,
        error:
          "Supabase authentication is unconfigured. Set VITE_SUPABASE_ANON_KEY to enable remote registration.",
      };
    }

    try {
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/dashboard`
          : "http://localhost:8080/dashboard";
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return {
          success: false,
          error: "Sign-up did not return a user record.",
        };
      }

      const requiresConfirmation = Boolean(data.user && !data.session);

      return {
        success: true,
        requiresEmailConfirmation: requiresConfirmation,
        user: {
          id: data.user.id,
          email: data.user.email ?? email,
          role: "student",
          isGuest: false,
          createdAt: data.user.created_at,
        },
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /**
   * Sends a password reset email via Supabase.
   */
  public async resetPassword(
    email: string,
  ): Promise<{ success: boolean; error?: string | undefined }> {
    const client = getSupabaseClient();
    if (!client) {
      return {
        success: false,
        error:
          "Supabase authentication is unconfigured. Set VITE_SUPABASE_ANON_KEY to enable password recovery.",
      };
    }

    try {
      const redirectUrl =
        typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined;
      const options = redirectUrl ? { redirectTo: redirectUrl } : {};
      const { error } = await client.auth.resetPasswordForEmail(email, options);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /**
   * Updates the password for the current authenticated user (e.g. during recovery flow).
   */
  public async updatePassword(
    newPassword: string,
  ): Promise<{ success: boolean; user?: AuthUser | undefined; error?: string | undefined }> {
    const client = getSupabaseClient();
    if (!client) {
      return {
        success: false,
        error: "Supabase authentication is unconfigured. Set VITE_SUPABASE_ANON_KEY.",
      };
    }

    try {
      const { data, error } = await client.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: "Failed to update password." };
      }

      const role = await this.fetchUserRole(data.user.id);
      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email ?? "unknown@shadowxlab.com",
          role,
          isGuest: false,
          createdAt: data.user.created_at,
          lastSignInAt: data.user.last_sign_in_at,
        },
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /**
   * Signs out the current user and clears session tokens.
   */
  public async signOut(): Promise<void> {
    const client = getSupabaseClient();
    this.previewRole = null;
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.removeItem(LOCAL_PREVIEW_ROLE_KEY);
        window.sessionStorage.removeItem(LOCAL_DEMO_USER_KEY);
      } catch {
        // Ignored
      }
    }

    this.notifyListeners(null, "SIGNED_OUT");

    if (client) {
      try {
        await client.auth.signOut();
      } catch (err) {
        console.warn("Supabase sign-out encountered an error:", err);
      }
    }
  }

  /**
   * Subscribes to auth state changes from Supabase and local demo sessions.
   */
  public onAuthStateChange(callback: (user: AuthUser | null, event?: string) => void): () => void {
    this.listeners.add(callback);
    const client = getSupabaseClient();

    let supabaseUnsubscribe: (() => void) | undefined;

    if (client) {
      const {
        data: { subscription },
      } = client.auth.onAuthStateChange(async (event: string, session: Session | null) => {
        // If a demo user is currently active in this tab, preserve demo user state
        if (typeof window !== "undefined") {
          try {
            const rawDemo = window.sessionStorage.getItem(LOCAL_DEMO_USER_KEY);
            if (rawDemo) {
              const parsed = JSON.parse(rawDemo) as AuthUser;
              if (parsed && parsed.id) {
                callback(parsed, event);
                return;
              }
            }
          } catch {
            // Ignore
          }
        }

        if (!session?.user) {
          callback(null, event);
          return;
        }

        const role = await this.fetchUserRole(session.user.id);
        callback(
          {
            id: session.user.id,
            email: session.user.email ?? "unknown@shadowxlab.com",
            role,
            isGuest: false,
            createdAt: session.user.created_at,
            lastSignInAt: session.user.last_sign_in_at,
          },
          event,
        );
      });

      supabaseUnsubscribe = () => subscription.unsubscribe();
    }

    return () => {
      this.listeners.delete(callback);
      if (supabaseUnsubscribe) {
        supabaseUnsubscribe();
      }
    };
  }

  // --- Authorization & RBAC Boundaries ---

  public static canAccessInstructor(role: UserRole): boolean {
    return role === "instructor" || role === "administrator";
  }

  public static canAccessAdmin(role: UserRole): boolean {
    return role === "administrator";
  }

  public static canManageCurriculum(role: UserRole): boolean {
    return role === "administrator";
  }

  public static canRecordAttendance(role: UserRole): boolean {
    return role === "instructor" || role === "administrator";
  }
}

export const authService = new AuthService();
