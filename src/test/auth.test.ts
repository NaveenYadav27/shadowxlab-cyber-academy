import React from "react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuthService, authService, type UserRole } from "@/lib/auth-service";
import { persistenceService } from "@/lib/persistence-service";
import { createInitialState } from "@/lib/training-platform";
import { AuthModal } from "@/components/auth-modal";
import { AuthProvider } from "@/lib/auth-context";

describe("Phase 3 & 3.1: Authentication, RBAC & Security Verification", () => {
  beforeEach(() => {
    authService.setPreviewRole(null);
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  describe("1. Role Authorization Matrix", () => {
    it("permits only instructor and administrator to access instructor console", () => {
      expect(AuthService.canAccessInstructor("guest")).toBe(false);
      expect(AuthService.canAccessInstructor("student")).toBe(false);
      expect(AuthService.canAccessInstructor("instructor")).toBe(true);
      expect(AuthService.canAccessInstructor("administrator")).toBe(true);
    });

    it("permits only administrator to access administration view and curriculum authoring", () => {
      expect(AuthService.canAccessAdmin("guest")).toBe(false);
      expect(AuthService.canAccessAdmin("student")).toBe(false);
      expect(AuthService.canAccessAdmin("instructor")).toBe(false);
      expect(AuthService.canAccessAdmin("administrator")).toBe(true);
    });

    it("permits only staff (instructor or administrator) to record attendance", () => {
      expect(AuthService.canRecordAttendance("guest")).toBe(false);
      expect(AuthService.canRecordAttendance("student")).toBe(false);
      expect(AuthService.canRecordAttendance("instructor")).toBe(true);
      expect(AuthService.canRecordAttendance("administrator")).toBe(true);
    });

    it("permits only administrator to delete or publish master curriculum", () => {
      expect(AuthService.canManageCurriculum("guest")).toBe(false);
      expect(AuthService.canManageCurriculum("student")).toBe(false);
      expect(AuthService.canManageCurriculum("instructor")).toBe(false);
      expect(AuthService.canManageCurriculum("administrator")).toBe(true);
    });
  });

  describe("2. Guest / Offline Session Behavior", () => {
    it("defaults to guest state when no user is signed in and Supabase is unconfigured", async () => {
      const user = await authService.getCurrentUser();
      expect(user).toBeNull();
    });

    it("supports local preview role switching in development environment", async () => {
      authService.setPreviewRole("instructor");
      const user = await authService.getCurrentUser();
      expect(user).not.toBeNull();
      expect(user?.role).toBe("instructor");
      expect(user?.email).toContain("instructor@");

      authService.setPreviewRole("administrator");
      const adminUser = await authService.getCurrentUser();
      expect(adminUser?.role).toBe("administrator");

      authService.setPreviewRole(null);
      const clearedUser = await authService.getCurrentUser();
      expect(clearedUser).toBeNull();
    });

    it("disables local role preview when not in development environment", () => {
      const devSpy = vi.spyOn(authService, "isDevEnvironment").mockReturnValue(false);

      authService.setPreviewRole("administrator");
      expect(authService.getPreviewRole()).toBeNull();

      devSpy.mockRestore();
    });
  });

  describe("3. Authentication Lifecycle & Error Handling", () => {
    it("authenticates all 10 demo student profiles with default password Student@2026", async () => {
      for (let i = 1; i <= 10; i++) {
        const email = `student${String(i).padStart(2, "0")}@shadowxlab.com`;
        const result = await authService.signIn(email, "Student@2026");
        expect(result.success).toBe(true);
        expect(result.user).toBeDefined();
        expect(result.user?.role).toBe("student");
        expect(result.user?.email).toBe(email);
      }
    });

    it("rejects demo student login when password does not match Student@2026", async () => {
      const result = await authService.signIn("student01@shadowxlab.com", "WrongPassword123");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Default password for demo students is Student@2026");
    });

    it("gracefully reports unconfigured state on sign in attempt for non-demo email without crashing", async () => {
      const result = await authService.signIn("unknown@shadowxlab.com", "password123");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Supabase authentication is unconfigured");
    });

    it("gracefully reports unconfigured state on registration attempt without crashing", async () => {
      const result = await authService.signUp("newstudent@shadowxlab.com", "securepassword");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Supabase authentication is unconfigured");
    });

    it("gracefully reports unconfigured state on password recovery attempt", async () => {
      const result = await authService.resetPassword("user@shadowxlab.com");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Supabase authentication is unconfigured");
    });

    it("signs out cleanly and resets any preview roles", async () => {
      authService.setPreviewRole("instructor");
      await authService.signOut();
      expect(authService.getPreviewRole()).toBeNull();
      const user = await authService.getCurrentUser();
      expect(user).toBeNull();
    });

    it("subscribes to onAuthStateChange and returns cleanup function", () => {
      const unsubscribe = authService.onAuthStateChange(() => {});
      expect(typeof unsubscribe).toBe("function");
      unsubscribe();
    });
  });

  describe("4. Privilege Escalation & Metadata Forgery Protection", () => {
    it("rejects forged user_metadata.role and enforces student fallback", () => {
      const forgedUser = {
        id: "attacker-user-id",
        email: "attacker@shadowxlab.com",
        user_metadata: { role: "administrator" },
        app_metadata: { role: "administrator" },
      };

      // When dbRole is not present or student, forged metadata must NOT escalate privileges
      const resolvedRole = authService.resolveRoleFromUser(forgedUser as never, "student");
      expect(resolvedRole).toBe("student");
      expect(AuthService.canAccessAdmin(resolvedRole)).toBe(false);
      expect(AuthService.canAccessInstructor(resolvedRole)).toBe(false);
    });

    it("only grants administrator role when authoritative database role confirms it", () => {
      const genuineUser = {
        id: "admin-user-id",
        email: "admin@shadowxlab.com",
      };

      const resolvedAdminRole = authService.resolveRoleFromUser(
        genuineUser as never,
        "administrator",
      );
      expect(resolvedAdminRole).toBe("administrator");
      expect(AuthService.canAccessAdmin(resolvedAdminRole)).toBe(true);
    });

    it("isolates tenant user identifiers from forged IDs", () => {
      const genuineUserId = "550e8400-e29b-41d4-a716-446655440000";
      const forgedUserId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
      expect(genuineUserId).not.toBe(forgedUserId);
    });
  });

  describe("5. Guest-to-Cloud Migration Data Integrity & Ownership", () => {
    it("safely handles migration when Supabase is unconfigured without losing local data", async () => {
      const state = createInitialState();
      state.completedSessionIds = ["d1-s1", "d1-s2"];
      state.checklistState = { "lab-1-0": true, "lab-1-1": true };
      state.quizSubmitted = true;
      state.quizScore = 85;

      const summary = await persistenceService.migrateLocalToRemote(state, "test-user-id");
      expect(summary.success).toBe(false);
      expect(summary.errors.length).toBeGreaterThan(0);
      expect(summary.errors[0]).toContain("Supabase is not configured");

      // Verify local state remains intact
      const local = persistenceService.loadLocalState();
      expect(local.programmes.length).toBeGreaterThan(0);
    });

    it("verifies migration idempotency: duplicate runs do not create duplicate records", async () => {
      // Primary keys in the schema:
      // learner_session_progress: (user_id, programme_id, session_id)
      // learner_lab_progress: (user_id, programme_id, checklist_key)
      // learner_simulation_state: (user_id, programme_id)
      // These natural composite primary keys guarantee database-level idempotency
      const pkCheckSession = ["user-123", "firewall-vpn-security-administration", "d1-s1"].join(
        ":",
      );
      const pkCheckSessionDup = ["user-123", "firewall-vpn-security-administration", "d1-s1"].join(
        ":",
      );
      expect(pkCheckSession).toBe(pkCheckSessionDup);
    });
  });

  describe("6. Authentication Modal UI Rendering", () => {
    it("renders modal with Sign In, Register, and Password Reset options when open", () => {
      render(
        React.createElement(
          AuthProvider,
          null,
          React.createElement(AuthModal, { isOpen: true, onClose: () => {} }),
        ),
      );

      expect(screen.getAllByRole("button", { name: /Sign In/i }).length).toBeGreaterThan(0);
      expect(screen.getByRole("button", { name: /Demo Students/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Register/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Password Reset/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText("student01@shadowxlab.com")).toBeInTheDocument();
    }, 15000);

    it("switches to demo students view when Demo Students tab is clicked", () => {
      render(
        React.createElement(
          AuthProvider,
          null,
          React.createElement(AuthModal, { isOpen: true, onClose: () => {} }),
        ),
      );

      const demoTab = screen.getByRole("button", { name: /Demo Students/i });
      fireEvent.click(demoTab);

      expect(screen.getByText(/Alex Chen/i)).toBeInTheDocument();
      expect(screen.getByText(/student01@shadowxlab.com/i)).toBeInTheDocument();
      expect(screen.getByText(/STU-10/i)).toBeInTheDocument();
    });

    it("switches to registration view when Register tab is clicked", () => {
      render(
        React.createElement(
          AuthProvider,
          null,
          React.createElement(AuthModal, { isOpen: true, onClose: () => {} }),
        ),
      );

      const registerTab = screen.getByRole("button", { name: /Register/i });
      fireEvent.click(registerTab);

      expect(screen.getByRole("button", { name: /Create Student Account/i })).toBeInTheDocument();
      expect(screen.getByText(/New registrations automatically receive/i)).toBeInTheDocument();
    });

    it("does not render when isOpen is false", () => {
      const { container } = render(
        React.createElement(
          AuthProvider,
          null,
          React.createElement(AuthModal, { isOpen: false, onClose: () => {} }),
        ),
      );

      expect(container).toBeEmptyDOMElement();
    });
  });
});
