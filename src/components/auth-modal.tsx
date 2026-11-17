import { useState, useEffect, type FormEvent } from "react";
import {
  Shield,
  LockKeyhole,
  Mail,
  KeyRound,
  User,
  LogOut,
  CloudUpload,
  CheckCircle2,
  AlertCircle,
  X,
  Radio,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import {
  DEMO_STUDENTS,
  DEFAULT_DEMO_PASSWORD,
  type DemoStudentProfile,
  type UserRole,
} from "@/lib/auth-service";
import type { TrainingState } from "@/lib/training-platform";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState?: TrainingState;
}

type AuthTab = "signin" | "signup" | "reset" | "update_password" | "demo";

export function AuthModal({ isOpen, onClose, currentState }: AuthModalProps) {
  const {
    user,
    role,
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
  } = useAuth();

  const [tab, setTab] = useState<AuthTab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    if (isRecoveryMode) {
      setTab("update_password");
    }
  }, [isRecoveryMode]);

  if (!isOpen) return null;

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);

    if (result.success) {
      toast.success(`Welcome back, ${result.user?.email}`);
      onClose();
    } else {
      toast.error(result.error ?? "Failed to sign in");
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    const result = await signUp(email, password);
    setSubmitting(false);

    if (result.success) {
      if (result.requiresEmailConfirmation) {
        toast.info("Registration successful! Check your email to confirm your account.");
      } else {
        toast.success("Account created successfully as Student");
      }
      onClose();
    } else {
      toast.error(result.error ?? "Failed to register account");
    }
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    const result = await resetPassword(email);
    setSubmitting(false);

    if (result.success) {
      toast.success("Password recovery link sent to your email");
      setTab("signin");
    } else {
      toast.error(result.error ?? "Failed to send reset link");
    }
  };

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSubmitting(true);
    const result = await updatePassword(password);
    setSubmitting(false);

    if (result.success) {
      toast.success("Password successfully saved! You are now authenticated as Student.");
      setPassword("");
      setConfirmPassword("");
      setIsRecoveryMode(false);
      onClose();
    } else {
      toast.error(result.error ?? "Failed to set password");
    }
  };

  const handleDemoSignIn = async (student: DemoStudentProfile) => {
    setSubmitting(true);
    const result = await signIn(student.email, DEFAULT_DEMO_PASSWORD);
    setSubmitting(false);
    if (result.success) {
      toast.success(`Authenticated as ${student.name} (${student.badge})`);
      onClose();
    } else {
      toast.error(result.error ?? "Failed to sign in as demo student");
    }
  };

  const handleMigrate = async () => {
    setMigrating(true);
    const summary = await migrateLocalData(currentState);
    setMigrating(false);

    if (summary.success) {
      toast.success(
        `Cloud sync complete: ${summary.sessionsMigrated} sessions, ${summary.labsMigrated} labs, ${summary.assessmentsMigrated} assessments migrated.`,
      );
    } else {
      toast.error(summary.errors[0] ?? "Local migration encountered errors");
    }
  };

  const handlePreviewRoleChange = (newRole: UserRole) => {
    setPreviewRole(newRole === "guest" ? null : newRole);
    toast.info(`Switched local preview role to: ${newRole.toUpperCase()}`);
  };

  return (
    <div
      className="editor-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="programme-editor"
        role="dialog"
        aria-modal="true"
        aria-label="Security & Authentication"
        style={{ maxWidth: "560px" }}
      >
        <header className="editor-header">
          <div>
            <div className="eyebrow">SECURITY ARCHITECTURE</div>
            <h2>Identity & Access Control</h2>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </Button>
        </header>

        <div className="editor-body">
          {/* Status Indicator Banner */}
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "6px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Shield size={18} color="var(--cyber)" />
              <div>
                <b style={{ fontSize: "13px", letterSpacing: "0.04em" }}>
                  {user ? "AUTHENTICATED SESSION" : "GUEST / LOCAL-FIRST MODE"}
                </b>
                <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>
                  {isAvailable
                    ? "Supabase Auth endpoint connected"
                    : "Running in offline fallback mode (credentials pending)"}
                </div>
              </div>
            </div>
            <span
              className="portal-badge"
              style={{
                textTransform: "uppercase",
                fontSize: "11px",
                fontWeight: 600,
                padding: "4px 8px",
              }}
            >
              {role}
            </span>
          </div>

          {user ? (
            /* Authenticated User View */
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  background: "var(--surface)",
                  padding: "16px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "4px" }}>
                  SIGNED IN AS
                </div>
                <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--foreground)" }}>
                  {user.email}
                </div>
                <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "8px" }}>
                  Assigned Role: <strong style={{ color: "var(--cyber)" }}>{user.role}</strong>
                </div>
              </div>

              {/* Explicit Local-to-Cloud Migration */}
              <div
                style={{
                  background: "var(--surface)",
                  padding: "16px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}
                >
                  <CloudUpload size={16} color="var(--cyber)" />
                  <strong style={{ fontSize: "13px" }}>Cloud Synchronization</strong>
                </div>
                <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "12px" }}>
                  Migrate your local progress, completed sessions, and custom lab checklists from
                  this browser to your cloud profile.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMigrate}
                  disabled={migrating || !isAvailable}
                >
                  <CloudUpload size={14} />
                  {migrating ? "Synchronizing..." : "Migrate Local Data to Cloud"}
                </Button>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  marginTop: "12px",
                }}
              >
                <Button variant="outline" size="sm" onClick={() => setTab("update_password")}>
                  <KeyRound size={14} /> Change Password
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    await signOut();
                    toast.info("Signed out");
                    onClose();
                  }}
                >
                  <LogOut size={15} />
                  Sign Out
                </Button>
              </div>
            </div>
          ) : tab === "update_password" ? (
            /* Set / Update Password View */
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  background: "var(--surface)",
                  padding: "16px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}
                >
                  <KeyRound size={16} color="var(--cyber)" />
                  <strong style={{ fontSize: "14px" }}>Set New Account Password</strong>
                </div>
                <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "16px" }}>
                  Enter and confirm your new password below. It will immediately activate for your
                  ShadowXLab account.
                </p>

                <form
                  onSubmit={handleUpdatePassword}
                  style={{ display: "flex", flexDirection: "column", gap: "14px" }}
                >
                  <label className="form-field">
                    <span>New Password (Minimum 6 characters)</span>
                    <Input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </label>
                  <label className="form-field">
                    <span>Confirm New Password</span>
                    <Input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </label>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "10px",
                      marginTop: "8px",
                    }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setTab(user ? "signin" : "signin")}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      <LockKeyhole size={15} />
                      {submitting ? "Saving Password..." : "Save New Password"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* Unauthenticated / Sign-in Tabs */
            <div>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: "10px",
                  marginBottom: "16px",
                }}
              >
                <Button
                  variant={tab === "signin" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTab("signin")}
                >
                  <LockKeyhole size={14} /> Sign In
                </Button>
                <Button
                  variant={tab === "demo" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTab("demo")}
                >
                  <GraduationCap size={14} /> Demo Students (10)
                </Button>
                <Button
                  variant={tab === "signup" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTab("signup")}
                >
                  <User size={14} /> Register
                </Button>
                <Button
                  variant={tab === "reset" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTab("reset")}
                >
                  <KeyRound size={14} /> Password Reset
                </Button>
                {isRecoveryMode && (
                  <Button variant="ghost" size="sm" onClick={() => setTab("update_password")}>
                    <KeyRound size={14} /> Set Password
                  </Button>
                )}
              </div>

              {tab === "signin" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {/* Quick-fill strip for Demo Student Profiles */}
                  <div
                    style={{
                      background: "color-mix(in oklab, var(--cyber) 7%, var(--surface))",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      border: "1px solid color-mix(in oklab, var(--cyber) 25%, var(--border))",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "var(--cyber)",
                          letterSpacing: "0.5px",
                        }}
                      >
                        DEMO STUDENT QUICK-FILL (Default: Student@2026)
                      </span>
                      <button
                        type="button"
                        onClick={() => setTab("demo")}
                        style={{
                          fontSize: "10px",
                          color: "var(--cyber)",
                          textDecoration: "underline",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        View All 10 Profiles →
                      </button>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {DEMO_STUDENTS.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setEmail(s.email);
                            setPassword(DEFAULT_DEMO_PASSWORD);
                          }}
                          style={{
                            fontSize: "10px",
                            padding: "3px 7px",
                            borderRadius: "4px",
                            border:
                              email === s.email
                                ? "1px solid var(--cyber)"
                                : "1px solid var(--border)",
                            background:
                              email === s.email
                                ? "color-mix(in oklab, var(--cyber) 20%, var(--surface))"
                                : "var(--background)",
                            color: "var(--foreground)",
                            cursor: "pointer",
                          }}
                          title={`${s.name} (${s.email}) - Click to autofill credentials`}
                        >
                          {s.badge}
                        </button>
                      ))}
                    </div>
                  </div>

                  <form
                    onSubmit={handleSignIn}
                    style={{ display: "flex", flexDirection: "column", gap: "14px" }}
                  >
                    <label className="form-field">
                      <span>Email Address</span>
                      <Input
                        type="email"
                        required
                        placeholder="student01@shadowxlab.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </label>
                    <label className="form-field">
                      <span>Password</span>
                      <Input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </label>
                    <Button type="submit" disabled={submitting}>
                      <LockKeyhole size={15} />
                      {submitting ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                </div>
              )}

              {tab === "demo" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div
                    style={{
                      background: "color-mix(in oklab, var(--cyber) 6%, var(--surface))",
                      padding: "12px",
                      borderRadius: "6px",
                      border: "1px solid color-mix(in oklab, var(--cyber) 25%, var(--border))",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "4px",
                      }}
                    >
                      <GraduationCap size={16} color="var(--cyber)" />
                      <strong style={{ fontSize: "13px", letterSpacing: "0.03em" }}>
                        CORPORATE TRAINING DEMO STUDENT PROFILES
                      </strong>
                    </div>
                    <p style={{ fontSize: "11px", color: "var(--muted)", margin: 0 }}>
                      10 pre-configured student accounts for hands-on labs and assessment
                      evaluation. Default password:{" "}
                      <code
                        style={{
                          background: "var(--background)",
                          padding: "2px 5px",
                          borderRadius: "3px",
                          color: "var(--cyber)",
                        }}
                      >
                        Student@2026
                      </code>
                    </p>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
                      gap: "10px",
                      maxHeight: "340px",
                      overflowY: "auto",
                      paddingRight: "4px",
                    }}
                  >
                    {DEMO_STUDENTS.map((student) => (
                      <div
                        key={student.id}
                        style={{
                          background: "var(--surface)",
                          padding: "10px 12px",
                          borderRadius: "6px",
                          border: "1px solid var(--border)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              color: "var(--cyber)",
                              background:
                                "color-mix(in oklab, var(--cyber) 12%, var(--background))",
                              padding: "2px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            {student.badge}
                          </span>
                          <span style={{ fontSize: "10px", color: "var(--muted)" }}>
                            {student.seat}
                          </span>
                        </div>
                        <div
                          style={{ fontSize: "12px", fontWeight: 600, color: "var(--foreground)" }}
                        >
                          {student.name}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--muted)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {student.email}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={submitting}
                          onClick={() => handleDemoSignIn(student)}
                          style={{
                            marginTop: "4px",
                            fontSize: "11px",
                            height: "28px",
                            width: "100%",
                          }}
                        >
                          <LockKeyhole size={12} /> Sign In
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === "signup" && (
                <form
                  onSubmit={handleSignUp}
                  style={{ display: "flex", flexDirection: "column", gap: "14px" }}
                >
                  <label className="form-field">
                    <span>Email Address</span>
                    <Input
                      type="email"
                      required
                      placeholder="student@shadowxlab.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </label>
                  <label className="form-field">
                    <span>Password (Minimum 6 characters)</span>
                    <Input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </label>
                  <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                    New registrations automatically receive the <strong>Student</strong> role.
                    Instructor and Administrator roles are provisioned by academy staff.
                  </div>
                  <Button type="submit" disabled={submitting}>
                    <User size={15} />
                    {submitting ? "Creating Account..." : "Create Student Account"}
                  </Button>
                </form>
              )}

              {tab === "reset" && (
                <form
                  onSubmit={handleReset}
                  style={{ display: "flex", flexDirection: "column", gap: "14px" }}
                >
                  <label className="form-field">
                    <span>Account Email</span>
                    <Input
                      type="email"
                      required
                      placeholder="analyst@shadowxlab.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </label>
                  <Button type="submit" disabled={submitting}>
                    <KeyRound size={15} />
                    {submitting ? "Sending Reset Email..." : "Send Password Reset Link"}
                  </Button>
                </form>
              )}

              {/* RBAC Evaluation & Testing Control - Strictly disabled in production */}
              {import.meta.env.DEV && (
                <div
                  style={{
                    marginTop: "24px",
                    padding: "14px",
                    background: "var(--surface)",
                    borderRadius: "6px",
                    border: "1px dashed var(--border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "6px",
                    }}
                  >
                    <Sparkles size={14} color="var(--cyber)" />
                    <strong style={{ fontSize: "12px", letterSpacing: "0.03em" }}>
                      RBAC EVALUATION CONTROLS (DEV ONLY)
                    </strong>
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "10px" }}>
                    Simulate access levels in this browser session to test protected routes and
                    role-aware navigation:
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {(["guest", "student", "instructor", "administrator"] as UserRole[]).map(
                      (r) => (
                        <Button
                          key={r}
                          variant={role === r ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePreviewRoleChange(r)}
                          style={{ textTransform: "capitalize", fontSize: "11px" }}
                        >
                          <Radio size={12} /> {r}
                        </Button>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="editor-footer">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </footer>
      </section>
    </div>
  );
}
