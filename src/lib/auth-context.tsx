import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { toast } from "sonner";
import { authService, type AuthUser, type UserRole, type AuthResult } from "./auth-service";
import { persistenceService, type MigrationSummary } from "./persistence-service";
import type { TrainingState } from "./training-platform";

export interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  loading: boolean;
  isAvailable: boolean;
  isRecoveryMode: boolean;
  setIsRecoveryMode: (val: boolean) => void;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string | undefined }>;
  updatePassword: (
    newPassword: string,
  ) => Promise<{ success: boolean; user?: AuthUser | undefined; error?: string | undefined }>;
  setPreviewRole: (role: UserRole | null) => void;
  migrateLocalData: (customState?: TrainingState) => Promise<MigrationSummary>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const isAvailable = authService.isAvailable();

  const refreshUser = useCallback(async () => {
    try {
      const current = await authService.getCurrentUser();
      setUser(current);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Process and clean auth callback fragments from URL (e.g. error=access_denied&error_code=otp_expired, type=recovery)
    if (typeof window !== "undefined" && window.location.hash) {
      try {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const errorCode = hashParams.get("error_code");
        const errorDesc = hashParams.get("error_description");
        const error = hashParams.get("error");
        const isRecovery =
          hashParams.get("type") === "recovery" || window.location.hash.includes("type=recovery");

        if (isRecovery) {
          setIsRecoveryMode(true);
        }

        if (errorCode || error) {
          if (errorCode === "otp_expired") {
            toast.info(
              "Confirmation link has already been used or expired. If your account is confirmed, please sign in.",
              { duration: 6000 },
            );
          } else if (errorDesc) {
            toast.error(decodeURIComponent(errorDesc).replace(/\+/g, " "), { duration: 5000 });
          }
          // Clean the error fragment from address bar so it does not loop or persist
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        } else if (hashParams.get("access_token")) {
          // Token present: clear hash after client session initialization
          setTimeout(() => {
            window.history.replaceState(
              null,
              "",
              window.location.pathname + window.location.search,
            );
          }, 400);
        }
      } catch {
        // Fallback for non-standard URL states
      }
    }

    void refreshUser();
    const unsubscribe = authService.onAuthStateChange((updatedUser, event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecoveryMode(true);
      }
      setUser(updatedUser);
      setLoading(false);
    });
    return () => {
      unsubscribe();
    };
  }, [refreshUser]);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true);
    const result = await authService.signIn(email, password);
    if (result.success && result.user) {
      setUser(result.user);
    }
    setLoading(false);
    return result;
  };

  const signUp = async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true);
    const result = await authService.signUp(email, password);
    if (result.success && result.user && !result.requiresEmailConfirmation) {
      setUser(result.user);
    }
    setLoading(false);
    return result;
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    await authService.signOut();
    setUser(null);
    setLoading(false);
  };

  const resetPassword = async (
    email: string,
  ): Promise<{ success: boolean; error?: string | undefined }> => {
    return authService.resetPassword(email);
  };

  const updatePassword = async (
    newPassword: string,
  ): Promise<{ success: boolean; user?: AuthUser | undefined; error?: string | undefined }> => {
    setLoading(true);
    const result = await authService.updatePassword(newPassword);
    if (result.success && result.user) {
      setUser(result.user);
      setIsRecoveryMode(false);
    }
    setLoading(false);
    return result;
  };

  const setPreviewRole = (newRole: UserRole | null): void => {
    authService.setPreviewRole(newRole);
    void refreshUser();
  };

  const migrateLocalData = async (customState?: TrainingState): Promise<MigrationSummary> => {
    return persistenceService.migrateLocalToRemote(customState);
  };

  const role: UserRole = user?.role ?? authService.getPreviewRole() ?? "guest";

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        isAvailable,
        isRecoveryMode,
        setIsRecoveryMode,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        setPreviewRole,
        migrateLocalData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    // Graceful fallback for non-provider contexts (e.g. isolated test environments)
    return {
      user: null,
      role: authService.getPreviewRole() ?? "guest",
      loading: false,
      isAvailable: authService.isAvailable(),
      isRecoveryMode: false,
      setIsRecoveryMode: () => {},
      signIn: async () => ({ success: false, error: "Auth provider missing" }),
      signUp: async () => ({ success: false, error: "Auth provider missing" }),
      signOut: async () => {},
      resetPassword: async () => ({ success: false, error: "Auth provider missing" }),
      updatePassword: async () => ({ success: false, error: "Auth provider missing" }),
      setPreviewRole: () => {},
      migrateLocalData: async () => ({
        success: false,
        programmesMigrated: 0,
        daysMigrated: 0,
        sessionsMigrated: 0,
        labsMigrated: 0,
        assessmentsMigrated: 0,
        resourcesMigrated: 0,
        errors: ["Auth provider missing"],
      }),
    };
  }
  return context;
}
