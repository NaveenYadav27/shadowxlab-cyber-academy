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

function ShadowXLabAppContent({ currentView }: ShadowXLabAppProps = {}) {
  const location = useLocation();
  const navigate = useNavigate();
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

  // Synchronize navigation ID between routes and workspaces
  const activeNavId = useMemo(() => {
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
  }, [routeView]);

  // Handle sidebar navigation clicks
  const handleSelectNav = (navId: string) => {
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
      navigate({ to: "/instructor" });
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
      navigate({ to: "/admin" });
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
    setState((prev) => ({
      ...prev,
      day1LabScores: {
        ...(prev.day1LabScores ?? {}),
        [labId]: score,
      },
    }));
    toast.success(`Lab ${labId.toUpperCase()} score recorded: ${score}%`);
  };

  const handleSaveSessionAssessmentScore = (sessionId: string, score: number) => {
    setState((prev) => ({
      ...prev,
      day1SessionAssessmentScores: {
        ...(prev.day1SessionAssessmentScores ?? {}),
        [sessionId]: score,
      },
    }));
    toast.success(`Session ${sessionId.toUpperCase()} assessment saved: ${score}%`);
  };

  const handleSaveFinalScore = (score: number) => {
    setState((prev) => ({
      ...prev,
      day1FinalAssessmentScore: score,
    }));
    toast.success(`Day 1 Comprehensive Exam recorded: ${score}%`);
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
    // If explicitly on /admin route or role is administrator
    if (routeView === "administration" || role === "administrator") {
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

    // If explicitly on /instructor route or role is instructor
    if (routeView === "instructor" || role === "instructor") {
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
