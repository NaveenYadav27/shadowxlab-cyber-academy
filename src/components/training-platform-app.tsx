import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AuthModal } from "@/components/auth-modal";
import { persistenceService } from "@/lib/persistence-service";
import {
  INITIAL_PROGRAMME,
  STORAGE_KEY,
  createInitialState,
  type ProgrammeConfig,
  type TrainingState,
} from "@/lib/training-platform";
import type { LabMode, StandardLabVerificationState } from "@/lib/lab-readiness-types";
import { WorkspaceHeader } from "@/components/navigation/workspace-header";
import { WorkspaceSidebar } from "@/components/navigation/workspace-sidebar";
import { StudentWorkspace } from "@/components/workspaces/student-workspace";
import { InstructorWorkspace } from "@/components/workspaces/instructor-workspace";
import { AdminWorkspace } from "@/components/workspaces/admin-workspace";
import { AuthService } from "@/lib/auth-service";
import { Button } from "@/components/ui/button";
import { LockKeyhole, Shield } from "lucide-react";

export type ViewKey =
  | "dashboard"
  | "programmes"
  | "schedule"
  | "modules"
  | "lab"
  | "assessments"
  | "resources"
  | "progress"
  | "instructor"
  | "administration";

export const viewToPath: Record<ViewKey, string> = {
  dashboard: "/dashboard",
  programmes: "/programmes",
  schedule: "/schedule",
  modules: "/modules",
  lab: "/lab",
  assessments: "/assessments",
  resources: "/resources",
  progress: "/progress",
  instructor: "/instructor",
  administration: "/admin",
};

export const pathToView: Record<string, ViewKey> = {
  "/": "dashboard",
  "/dashboard": "dashboard",
  "/programmes": "programmes",
  "/schedule": "schedule",
  "/modules": "modules",
  "/lab": "lab",
  "/assessments": "assessments",
  "/resources": "resources",
  "/progress": "progress",
  "/instructor": "instructor",
  "/admin": "administration",
  "/administration": "administration",
};

export interface ShadowXLabAppProps {
  currentView?: ViewKey;
}

const currentTemplate = createInitialState();

function readState(): TrainingState {
  if (typeof window === "undefined") return currentTemplate;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const saved = JSON.parse(raw) as Partial<TrainingState>;
    const fallback = createInitialState();
    const programmes =
      Array.isArray(saved.programmes) && saved.programmes.length > 0
        ? saved.programmes
        : fallback.programmes;
    const firstProgramme = programmes[0] ?? fallback.programmes[0] ?? INITIAL_PROGRAMME;
    return {
      ...fallback,
      ...saved,
      programmes,
      activeProgrammeId: programmes.some((programme) => programme.id === saved.activeProgrammeId)
        ? (saved.activeProgrammeId as string)
        : firstProgramme.id,
    };
  } catch {
    return createInitialState();
  }
}

function useSafeLocation() {
  try {
    return useLocation();
  } catch {
    return { pathname: "/" };
  }
}

function useSafeNavigate() {
  try {
    return useNavigate();
  } catch {
    return () => {};
  }
}

function ShadowXLabAppContent({ currentView }: ShadowXLabAppProps = {}) {
  const location = useSafeLocation();
  const navigate = useSafeNavigate();
  const { user, role, isRecoveryMode } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isRecoveryMode) {
      setAuthModalOpen(true);
    }
  }, [isRecoveryMode]);

  const routeView: ViewKey = currentView ?? pathToView[location.pathname] ?? "dashboard";
  const [state, setState] = useState<TrainingState>(readState);

  // Active Programme
  const programmes = state.programmes;
  const programme =
    programmes.find((item) => item.id === state.activeProgrammeId) ??
    programmes[0] ??
    INITIAL_PROGRAMME;

  // Persistence sync on changes
  useEffect(() => {
    persistenceService.saveState(state, user?.id);
  }, [state, user?.id]);

  // Sub-navigation state within workspaces
  const [activeSubNav, setActiveSubNav] = useState<string | null>(null);

  // Reset sub-navigation when the top-level routeView changes
  useEffect(() => {
    setActiveSubNav(null);
  }, [routeView]);

  // Synchronize navigation ID between routes and workspaces
  const activeNavId = useMemo(() => {
    if (activeSubNav) return activeSubNav;
    if (routeView === "dashboard") return "my-learning";
    if (routeView === "programmes") return "programmes";
    if (routeView === "schedule") return "sessions";
    if (routeView === "modules") return "concepts";
    if (routeView === "lab") return "cyber-range";
    if (routeView === "assessments") return "assessments";
    if (routeView === "resources") return "resources";
    if (routeView === "progress") return "progress";
    if (routeView === "instructor") return "instructor-overview";
    if (routeView === "administration") return "admin-overview";
    return "my-learning";
  }, [routeView, activeSubNav]);

  // Handle sidebar navigation clicks
  const handleSelectNav = (navId: string) => {
    setActiveSubNav(navId);

    // Student Workspace mappings
    if (navId === "my-learning") navigate({ to: "/dashboard" });
    else if (navId === "programmes") navigate({ to: "/programmes" });
    else if (navId === "sessions") navigate({ to: "/schedule" });
    else if (navId === "concepts") navigate({ to: "/modules" });
    else if (navId === "labs") navigate({ to: "/lab" });
    else if (navId === "cyber-range") navigate({ to: "/lab" });
    else if (navId === "assessments") navigate({ to: "/assessments" });
    else if (navId === "progress") navigate({ to: "/progress" });
    else if (navId === "resources") navigate({ to: "/resources" });
    else if (navId === "readiness") navigate({ to: "/lab" });

    // Instructor Workspace mappings
    else if (
      [
        "instructor-overview",
        "cohorts",
        "session-delivery",
        "curriculum",
        "lab-control",
        "classroom-monitoring",
        "assessment-review",
        "student-performance",
        "attendance",
        "reports",
      ].includes(navId)
    ) {
      if (routeView !== "instructor") {
        navigate({ to: "/instructor" });
      }
    }

    // Administrator Workspace mappings
    else if (
      [
        "admin-overview",
        "user-management",
        "role-management",
        "programme-management",
        "cohort-management",
        "curriculum-admin",
        "scheduling-admin",
        "lab-management",
        "assessment-admin",
        "platform-health",
        "audit-logs",
        "institutional-reports",
        "system-config",
      ].includes(navId)
    ) {
      if (routeView !== "administration") {
        navigate({ to: "/admin" });
      }
    }
  };

  // State mutation callbacks
  const handleToggleSessionComplete = (sessionId: string) => {
    setState((prev) => {
      const alreadyDone = prev.completedSessionIds.includes(sessionId);
      const nextCompleted = alreadyDone
        ? prev.completedSessionIds.filter((id) => id !== sessionId)
        : [...prev.completedSessionIds, sessionId];

      toast.success(
        alreadyDone
          ? `Marked session ${sessionId.toUpperCase()} incomplete.`
          : `Session ${sessionId.toUpperCase()} completed! Progress saved.`,
      );

      return {
        ...prev,
        completedSessionIds: nextCompleted,
        progressTouched: true,
      };
    });
  };

  const handleToggleConceptComplete = (conceptId: string) => {
    setState((prev) => {
      if (conceptId.startsWith("day2-")) {
        const list = prev.day2CompletedConceptIds ?? [];
        const isDone = list.includes(conceptId);
        const updated = isDone ? list.filter((id) => id !== conceptId) : [...list, conceptId];
        return {
          ...prev,
          day2CompletedConceptIds: updated,
        };
      }
      const list = prev.day1CompletedConceptIds ?? [];
      const isDone = list.includes(conceptId);
      const updated = isDone ? list.filter((id) => id !== conceptId) : [...list, conceptId];
      return {
        ...prev,
        day1CompletedConceptIds: updated,
      };
    });
  };

  const handleSaveLabScore = (labId: string, score: number) => {
    setState((prev) => {
      if (labId.startsWith("day2-")) {
        return {
          ...prev,
          day2LabScores: {
            ...(prev.day2LabScores ?? {}),
            [labId]: score,
          },
        };
      }
      return {
        ...prev,
        day1LabScores: {
          ...(prev.day1LabScores ?? {}),
          [labId]: score,
        },
      };
    });
    toast.success(`Lab ${labId.toUpperCase()} score recorded: ${score}%`);
  };

  const handleSaveSessionAssessmentScore = (sessionId: string, score: number) => {
    setState((prev) => {
      if (sessionId.startsWith("d2-")) {
        return {
          ...prev,
          day2SessionAssessmentScores: {
            ...(prev.day2SessionAssessmentScores ?? {}),
            [sessionId]: score,
          },
        };
      }
      return {
        ...prev,
        day1SessionAssessmentScores: {
          ...(prev.day1SessionAssessmentScores ?? {}),
          [sessionId]: score,
        },
      };
    });
    toast.success(`Session ${sessionId.toUpperCase()} assessment saved: ${score}%`);
  };

  const handleSaveFinalScore = (score: number) => {
    setState((prev) => ({
      ...prev,
      day1FinalAssessmentScore: score,
      day2FinalAssessmentScore: score,
    }));
    toast.success(`Comprehensive Exam score recorded: ${score}%`);
  };

  const handleSelectLabMode = (mode: LabMode) => {
    setState((prev) => ({
      ...prev,
      selectedLabMode: mode,
    }));
    toast.info(`Lab execution mode changed to ${mode.toUpperCase()}.`);
  };

  const handleUpdateVerification = (update: Partial<StandardLabVerificationState>) => {
    setState((prev) => ({
      ...prev,
      standardLabVerification: {
        ...(prev.standardLabVerification ?? {
          kaliIpVerified: false,
          pfsensePingVerified: false,
          ubuntuPingVerified: false,
          internetPingVerified: false,
          dnsLookupVerified: false,
          pfsenseWebGuiVerified: false,
        }),
        ...update,
      },
    }));
  };

  const handleUpdateAttendance = (studentId: string, attended: boolean) => {
    setState((prev) => ({
      ...prev,
      attendance: {
        ...prev.attendance,
        [studentId]: attended,
      },
    }));
    toast.success(`Attendance updated for student ${studentId}.`);
  };

  const handleResetToSeed = () => {
    const fresh = createInitialState();
    setState(fresh);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
    toast.info("Platform state reset to initial seed.");
  };

  // Determine which workspace to render based on user role and current route
  const renderActiveWorkspace = () => {
    // If explicitly on /admin route
    if (routeView === "administration") {
      if (!AuthService.canAccessAdmin(role)) {
        return (
          <div className="flex min-h-[60vh] items-center justify-center p-4">
            <div className="max-w-md rounded-xl border border-border/80 bg-card p-6 text-center shadow-xl">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-950/50 text-purple-400 border border-purple-500/30">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Administrator Console Restricted</h2>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {role === "student"
                  ? "Your account currently has the Student role. Only designated platform administrators can access governance and configuration settings."
                  : "This workspace requires an authenticated Administrator session."}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button size="sm" onClick={() => setAuthModalOpen(true)} className="bg-purple-600 hover:bg-purple-500 text-white text-xs">
                  <Shield className="h-3.5 w-3.5 mr-1.5" />
                  <span>Sign In / Switch Role</span>
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigate({ to: "/dashboard" })} className="text-xs">
                  Return to My Learning
                </Button>
              </div>
            </div>
          </div>
        );
      }
      return (
        <AdminWorkspace
          state={state}
          programme={programme}
          activeNavId={activeNavId}
          onSelectNav={handleSelectNav}
          onResetToSeed={handleResetToSeed}
        />
      );
    }

    // If explicitly on /instructor route
    if (routeView === "instructor") {
      if (!AuthService.canAccessInstructor(role)) {
        return (
          <div className="flex min-h-[60vh] items-center justify-center p-4">
            <div className="max-w-md rounded-xl border border-border/80 bg-card p-6 text-center shadow-xl">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Instructor Console Restricted</h2>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {role === "student"
                  ? "Your account currently has the Student role. Only designated course instructors or administrators can access classroom monitoring and delivery controls."
                  : "This workspace requires an authenticated Instructor or Administrator session."}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button size="sm" onClick={() => setAuthModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs">
                  <Shield className="h-3.5 w-3.5 mr-1.5" />
                  <span>Sign In / Switch Role</span>
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigate({ to: "/dashboard" })} className="text-xs">
                  Return to My Learning
                </Button>
              </div>
            </div>
          </div>
        );
      }
      return (
        <InstructorWorkspace
          state={state}
          programme={programme}
          activeNavId={activeNavId}
          onSelectNav={handleSelectNav}
          onUpdateAttendance={handleUpdateAttendance}
        />
      );
    }

    // Default: Student Workspace
    return (
      <StudentWorkspace
        state={state}
        programme={programme}
        activeNavId={activeNavId}
        onSelectNav={handleSelectNav}
        onToggleSessionComplete={handleToggleSessionComplete}
        onToggleConceptComplete={handleToggleConceptComplete}
        onSaveLabScore={handleSaveLabScore}
        onSaveSessionAssessmentScore={handleSaveSessionAssessmentScore}
        onSaveFinalScore={handleSaveFinalScore}
        onSelectLabMode={handleSelectLabMode}
        onUpdateVerification={handleUpdateVerification}
        onOpenReadiness={() => handleSelectNav("readiness")}
      />
    );
  };

  return (
    <div className="app-shell min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Navigation Header */}
      <WorkspaceHeader
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        selectedLabMode={state.selectedLabMode ?? "simulation"}
        onOpenReadiness={() => handleSelectNav("readiness")}
      />

      {/* Main Workspace Body with Dynamic Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <WorkspaceSidebar
          role={role}
          activeNavId={activeNavId}
          onSelectNav={handleSelectNav}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {renderActiveWorkspace()}
        </main>
      </div>

      {/* Supabase Authentication & Demo Student Picker Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}

export default function ShadowXLabApp(props: ShadowXLabAppProps) {
  return (
    <AuthProvider>
      <ShadowXLabAppContent {...props} />
    </AuthProvider>
  );
}
