import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  Activity,
  Archive,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  Copy,
  Download,
  FileJson2,
  FlaskConical,
  GraduationCap,
  LayoutDashboard,
  Layers,
  LockKeyhole,
  Menu,
  MonitorCog,
  Network,
  Plus,
  RadioTower,
  Save,
  Settings2,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Upload,
  Users,
  Wifi,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { persistenceService } from "@/lib/persistence-service";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AuthService } from "@/lib/auth-service";
import { AuthModal } from "@/components/auth-modal";
import {
  INITIAL_PROGRAMME,
  STORAGE_KEY,
  calculateProgress,
  countCapstones,
  countSessions,
  createInitialState,
  dateRangeLabel,
  dayDateLabel,
  type ProgrammeConfig,
  type TrainingSession,
  type TrainingState,
} from "@/lib/training-platform";
import logoImg from "@/assets/shadowxlab-logo.png";
import hero from "@/assets/shadowxlab-cyber-range.jpg";
import { Day1ScheduleAccordion } from "@/components/day1/day1-schedule-accordion";
import { ConceptLearningPanel } from "@/components/day1/concept-learning-panel";
import { Day1Labs } from "@/components/day1/day1-labs";
import PacketJourneySimulator from "@/components/day1/packet-journey-simulator";
import { Day1Assessments } from "@/components/day1/day1-assessments";
import { calculateDay1Metrics } from "@/lib/day1-curriculum";
import { LabReadinessCenter } from "@/components/lab-readiness/lab-readiness-center";
import { StandardPfSenseLab } from "@/components/lab-readiness/standard-pfsense-lab";
import { LabTroubleshootingWizard } from "@/components/lab-readiness/lab-troubleshooting-wizard";
import { InstructorLabReadinessPanel } from "@/components/lab-readiness/instructor-lab-readiness-panel";
import type {
  LabMode,
  StandardLabVerificationState,
  AssistanceRequest,
} from "@/lib/lab-readiness-types";
import { DEMO_STUDENTS } from "@/lib/auth-service";

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

const navItems: { id: ViewKey; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "programmes", label: "Programmes", icon: GraduationCap },
  { id: "schedule", label: "Schedule", icon: CalendarDays },
  { id: "modules", label: "Learning Modules", icon: BookOpen },
  { id: "lab", label: "Virtual Lab", icon: MonitorCog },
  { id: "assessments", label: "Assessments", icon: ClipboardCheck },
  { id: "resources", label: "Resources", icon: FileJson2 },
  { id: "progress", label: "Progress", icon: Activity },
  { id: "instructor", label: "Instructor Console", icon: Users },
  { id: "administration", label: "Administration", icon: Settings2 },
];

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

function createBlankProgramme(): ProgrammeConfig {
  const fresh = createInitialState().programmes[0];
  const stamp = crypto.randomUUID();
  return {
    ...fresh,
    id: `programme-${stamp}`,
    title: "New programme",
    description: "Configure the programme description.",
    instructor: "",
    location: "",
    startDate: "",
    endDate: "",
    durationLabel: "",
    initialProgress: 0,
    published: false,
    archived: false,
    days: [],
    labs: [],
    assessments: [],
    capstoneTitle: "",
    completionRules: { completeAllSessions: true, passScore: 70 },
  };
}

function Card({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <section className={`surface-card ${className}`} style={style}>
      {children}
    </section>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  detail,
  action,
}: {
  icon: typeof Shield;
  title: string;
  detail?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-heading">
      <div className="section-heading-main">
        <Icon size={18} />
        <div>
          <h2>{title}</h2>
          {detail && <p>{detail}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function ShadowXLabAppContent({ currentView }: ShadowXLabAppProps = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, isRecoveryMode } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (isRecoveryMode) {
      setAuthModalOpen(true);
    }
  }, [isRecoveryMode]);

  const routeView: ViewKey = currentView ?? pathToView[location.pathname] ?? "dashboard";
  const [state, setState] = useState<TrainingState>(readState);
  const [activeView, setActiveView] = useState<ViewKey>(routeView);

  useEffect(() => {
    setActiveView(routeView);
  }, [routeView]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editor, setEditor] = useState<ProgrammeConfig | null>(null);
  const [resourceDraft, setResourceDraft] = useState({ title: "", url: "", kind: "Reference" });
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const importRef = useRef<HTMLInputElement>(null);
  const programmes = state.programmes;
  const programme =
    programmes.find((item) => item.id === state.activeProgrammeId) ??
    programmes[0] ??
    INITIAL_PROGRAMME;
  const selectedDay =
    programme.days.find((day) => day.id === state.selectedDayId) ?? programme.days[0];
  const progress = state.progressTouched
    ? calculateProgress(state.completedSessionIds, programme)
    : programme.initialProgress;
  const totalSessions = countSessions(programme);
  const labsCount = programme.labs.length;
  const capstones = countCapstones(programme);
  const completedCount = programme.days.reduce(
    (count, day) =>
      count + day.sessions.filter((item) => state.completedSessionIds.includes(item.id)).length,
    0,
  );
  const visibleProgrammes = programmes.filter(
    (item) => !item.archived && !state.archivedProgrammeIds.includes(item.id),
  );
  const nextSession = programme.days
    .flatMap((day) =>
      day.sessions.map((item) => ({
        ...item,
        dayId: day.id,
        dayTitle: day.title,
        dayIndex: programme.days.indexOf(day),
      })),
    )
    .find((item) => !state.completedSessionIds.includes(item.id));

  useEffect(() => {
    persistenceService.saveState(state, user?.id);
  }, [state, user?.id]);

  const patchState = (change: Partial<TrainingState>) =>
    setState((previous) => ({ ...previous, ...change }));
  const updateProgramme = (updated: ProgrammeConfig) =>
    setState((previous) => ({
      ...previous,
      programmes: previous.programmes.map((item) => (item.id === updated.id ? updated : item)),
    }));
  const selectProgramme = (id: string) =>
    setState((previous) => ({
      ...previous,
      activeProgrammeId: id,
      selectedDayId: previous.programmes.find((item) => item.id === id)?.days[0]?.id ?? "",
    }));

  const completeSession = (sessionId: string) => {
    const exists = state.completedSessionIds.includes(sessionId);
    patchState({
      completedSessionIds: exists
        ? state.completedSessionIds.filter((id) => id !== sessionId)
        : [...state.completedSessionIds, sessionId],
      progressTouched: true,
    });
  };

  const toggleConceptComplete = (conceptId: string) => {
    const current = state.day1CompletedConceptIds ?? [];
    const exists = current.includes(conceptId);
    const updated = exists ? current.filter((id) => id !== conceptId) : [...current, conceptId];
    patchState({ day1CompletedConceptIds: updated, progressTouched: true });
    toast.success(exists ? "Concept marked incomplete" : "Concept marked completed!");
  };

  const selectConcept = (conceptId: string | null) => {
    patchState({ activeConceptId: conceptId });
  };

  const saveDay1LabScore = (labId: string, score: number) => {
    patchState({
      day1LabScores: { ...(state.day1LabScores ?? {}), [labId]: score },
      progressTouched: true,
    });
    toast.success(`Lab ${labId} score saved: ${score}%`);
  };

  const saveDay1SessionScore = (sessionId: string, score: number) => {
    patchState({
      day1SessionAssessmentScores: {
        ...(state.day1SessionAssessmentScores ?? {}),
        [sessionId]: score,
      },
      progressTouched: true,
    });
    toast.success(`Session ${sessionId.toUpperCase()} Assessment score: ${score}%`);
  };

  const saveDay1FinalScore = (score: number) => {
    patchState({
      day1FinalAssessmentScore: score,
      progressTouched: true,
    });
    toast.success(`Day 1 Final Exam score: ${score}%`);
  };

  const currentDemoStudent = user?.email
    ? DEMO_STUDENTS.find(
        (s) =>
          s.email.toLowerCase() === user.email.toLowerCase() ||
          s.email.replace("student0", "student").toLowerCase() === user.email.toLowerCase(),
      )
    : undefined;
  const currentStudentName =
    currentDemoStudent?.name ?? (user?.email ? user.email.split("@")[0] : "Alex Chen");
  const currentStudentEmail = user?.email ?? "student01@shadowxlab.com";
  const currentSeat = currentDemoStudent?.seat ?? "Station 01";

  const handleSelectLabMode = (mode: LabMode) => {
    patchState({ selectedLabMode: mode });
    toast.info(`Switched Lab Mode to: ${mode.toUpperCase()}`);
  };

  const handleUpdateVerification = (update: Partial<StandardLabVerificationState>) => {
    const current = state.standardLabVerification ?? {
      kaliIpVerified: false,
      pfsensePingVerified: false,
      ubuntuPingVerified: false,
      internetPingVerified: false,
      dnsLookupVerified: false,
      pfsenseWebGuiVerified: false,
    };
    patchState({ standardLabVerification: { ...current, ...update } });
  };

  const handleSubmitEvidence = (evidence: string, notes: string) => {
    const current = state.standardLabVerification ?? {
      kaliIpVerified: false,
      pfsensePingVerified: false,
      ubuntuPingVerified: false,
      internetPingVerified: false,
      dnsLookupVerified: false,
      pfsenseWebGuiVerified: false,
    };
    patchState({
      standardLabVerification: {
        ...current,
        kaliIpOutput: evidence,
        completionEvidenceNotes: notes,
        completedAt: new Date().toISOString(),
      },
    });
  };

  const handleSubmitAssistanceRequest = (
    req: Omit<AssistanceRequest, "id" | "timestamp" | "status">,
  ) => {
    const newTicket: AssistanceRequest = {
      ...req,
      id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      status: "open",
    };
    const currentList = state.assistanceRequests ?? [];
    patchState({ assistanceRequests: [newTicket, ...currentList] });
  };

  const handleUpdateTicketStatus = (
    ticketId: string,
    ticketStatus: AssistanceRequest["status"],
    note?: string,
  ) => {
    const currentList = state.assistanceRequests ?? [];
    patchState({
      assistanceRequests: currentList.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: ticketStatus,
              instructorNote: note ?? t.instructorNote,
            }
          : t,
      ),
    });
  };

  const switchView = (view: ViewKey) => {
    setActiveView(view);
    setSidebarOpen(false);
    const targetPath = viewToPath[view] ?? "/dashboard";
    if (navigate && location && location.pathname !== targetPath) {
      navigate({ to: targetPath });
    }
  };

  const duplicateProgramme = (target: ProgrammeConfig) => {
    const clone = structuredClone(target);
    clone.id = `programme-${crypto.randomUUID()}`;
    clone.title = `${target.title} (Copy)`;
    clone.published = false;
    clone.archived = false;
    setState((previous) => ({
      ...previous,
      programmes: [...previous.programmes, clone],
      activeProgrammeId: clone.id,
      selectedDayId: clone.days[0]?.id ?? "",
    }));
    toast.success("Programme duplicated");
  };

  const archiveProgramme = (target: ProgrammeConfig) => {
    if (programmes.length < 2) {
      toast.error("Create another programme before archiving the only one.");
      return;
    }
    const archived = { ...target, archived: true };
    const alternative = visibleProgrammes.find((item) => item.id !== target.id);
    setState((previous) => ({
      ...previous,
      programmes: previous.programmes.map((item) => (item.id === target.id ? archived : item)),
      activeProgrammeId:
        previous.activeProgrammeId === target.id && alternative
          ? alternative.id
          : previous.activeProgrammeId,
    }));
    toast.success("Programme archived");
  };

  const exportProgramme = (target: ProgrammeConfig) => {
    const blob = new Blob([JSON.stringify(target, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${target.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Configuration exported");
  };

  const importProgramme = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const value = JSON.parse(await file.text()) as ProgrammeConfig;
      if (!value.title || !Array.isArray(value.days) || !Array.isArray(value.labs))
        throw new Error("This file is missing programme fields.");
      const imported = { ...value, id: `programme-${crypto.randomUUID()}`, archived: false };
      setState((previous) => ({
        ...previous,
        programmes: [...previous.programmes, imported],
        activeProgrammeId: imported.id,
        selectedDayId: imported.days[0]?.id ?? "",
      }));
      toast.success("Programme configuration imported");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not import this configuration.");
    }
    event.target.value = "";
  };

  const moveToSession = (dayId: string, sessionId: string) => {
    const day = programme.days.find((item) => item.id === dayId);
    if (!day) return;
    patchState({ selectedDayId: dayId });
    switchView("schedule");
    window.setTimeout(
      () =>
        document
          .getElementById(`session-${sessionId}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" }),
      100,
    );
  };

  const editSession = (dayId: string, sessionId: string, change: Partial<TrainingSession>) => {
    const updated = {
      ...programme,
      days: programme.days.map((day) =>
        day.id !== dayId
          ? day
          : {
              ...day,
              sessions: day.sessions.map((item) =>
                item.id === sessionId ? { ...item, ...change } : item,
              ),
            },
      ),
    };
    updateProgramme(updated);
  };

  const submitResource = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!resourceDraft.title.trim()) return;
    patchState({ resources: [...state.resources, { ...resourceDraft, id: crypto.randomUUID() }] });
    setResourceDraft({ title: "", url: "", kind: "Reference" });
    toast.success("Resource added");
  };

  const submitQuiz = () => {
    const correct = programme.assessments.filter(
      (question) => quizAnswers[question.id] === question.answer,
    ).length;
    const score = programme.assessments.length
      ? Math.round((correct / programme.assessments.length) * 100)
      : 0;
    patchState({ quizScore: score, quizSubmitted: true });
    toast.success(`Assessment scored ${score}%`);
  };

  const activeName = navItems.find((item) => item.id === activeView)?.label ?? "Dashboard";

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand-lockup">
          <img src={logoImg} alt="ShadowXLab" />
          <div className="brand-caption">
            CYBER RANGE <span>●</span> LEARNING SYSTEM
          </div>
        </div>
        <div className="side-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant="ghost"
              className={`nav-item ${activeView === id ? "nav-item-active" : ""}`}
              onClick={() => switchView(id)}
              aria-current={activeView === id ? "page" : undefined}
            >
              <Icon size={17} />
              <span>{label}</span>
              {id === "lab" && <span className="nav-status" />}
            </Button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-status">
            <span className="status-indicator" />
            Environment ready
          </div>
          <span>
            SHADOWXLAB PLATFORM <b>v1.0</b>
          </span>
        </div>
      </aside>
      {sidebarOpen && (
        <button
          className="scrim"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <main className="main-workspace">
        <header className="topbar">
          <div className="topbar-heading">
            <Button
              variant="ghost"
              size="icon"
              className="mobile-menu"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={19} />
            </Button>
            <div className="eyebrow">
              SHADOWXLAB <span>/</span> {activeName.toUpperCase()}
            </div>
            <div className="page-header">
              <h1>
                {activeView === "dashboard"
                  ? `Welcome, ${user ? (user.email.split("@")[0] ?? "Learner") : programme.instructor || "Instructor"}`
                  : activeName}
              </h1>
              <span className="header-divider" />
              {programme.instructor && (
                <span className="header-subtitle">
                  {activeView === "dashboard" ? "Instructor Dashboard" : programme.title}
                </span>
              )}
            </div>
          </div>
          <div className="topbar-tools">
            <span className="range-period">
              <CalendarDays size={15} />
              {programme.startDate && programme.endDate
                ? dateRangeLabel(programme.startDate, programme.endDate)
                : "Dates not set"}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="portal-badge"
              onClick={() => setAuthModalOpen(true)}
              title="Security & Account Access"
              aria-label="Security & Account Access"
            >
              <Shield size={14} />
              <span>{user ? user.email.split("@")[0] : "Guest"}</span>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  padding: "1px 5px",
                  background: "var(--surface-2)",
                  borderRadius: "3px",
                  letterSpacing: "0.03em",
                  color:
                    role === "administrator"
                      ? "var(--cyber)"
                      : role === "instructor"
                        ? "var(--gold)"
                        : "var(--muted)",
                }}
              >
                {role.toUpperCase()}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Administration settings"
              title="Administration settings"
              onClick={() => switchView("administration")}
            >
              <Settings2 size={18} />
            </Button>
            <Button
              variant="outline"
              className="portal-badge"
              onClick={() => switchView("programmes")}
            >
              <RadioTower size={15} />
              {programme.title || "Programme portal"}
              <ChevronDown size={14} />
            </Button>
          </div>
        </header>
        <div className="page-content">
          {activeView === "dashboard" && (
            <>
              <section
                className="hero-banner"
                style={{
                  backgroundImage: `linear-gradient(90deg, var(--hero-shade) 0%, color-mix(in oklab, var(--hero-shade) 96%, transparent) 34%, color-mix(in oklab, var(--hero-shade) 20%, transparent) 75%), url(${hero})`,
                }}
              >
                <div className="hero-copy">
                  <div className="hero-kicker">
                    <span className="live-dot" />
                    ACTIVE PROGRAMME{" "}
                    <span className="hero-location">
                      <Network size={13} />
                      {programme.location || "Cyber range"}
                    </span>
                  </div>
                  <h2>{programme.title || "Untitled programme"}</h2>
                  <p>{programme.description}</p>
                  <div className="progress-label">
                    <span>PROGRAMME PROGRESS</span>
                    <strong>{progress}%</strong>
                  </div>
                  <div className="progress-track">
                    <div style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                  <span className="progress-note">
                    {completedCount} of {totalSessions} sessions complete
                  </span>
                </div>
                <div className="hero-corner">
                  <span>TRAINING ENVIRONMENT</span>
                  <b>
                    <ShieldCheck size={16} /> SIMULATION ACTIVE
                  </b>
                </div>
              </section>
              <div className="kpi-grid">
                <Kpi
                  icon={CalendarDays}
                  label="PROGRAMME DURATION"
                  value={programme.durationLabel || "—"}
                  hint={
                    programme.startDate && programme.endDate
                      ? dateRangeLabel(programme.startDate, programme.endDate)
                      : "Schedule not set"
                  }
                  tone="cyan"
                />
                <Kpi
                  icon={Layers}
                  label="SESSIONS"
                  value={String(totalSessions)}
                  hint={
                    programme.days.length
                      ? `${Math.round(totalSessions / programme.days.length)} sessions per day`
                      : "No days configured"
                  }
                  tone="blue"
                />
                <Kpi
                  icon={FlaskConical}
                  label="PRACTICAL LABS"
                  value={String(labsCount)}
                  hint="Hands-on simulations"
                  tone="teal"
                />
                <Kpi
                  icon={Shield}
                  label="CAPSTONE"
                  value={String(capstones)}
                  hint={programme.capstoneTitle || "Configured capstones"}
                  tone="gold"
                />
              </div>
              <div className="dashboard-grid">
                <Card className="schedule-card">
                  <SectionHeading
                    icon={CalendarDays}
                    title="Today's Schedule"
                    detail={
                      selectedDay
                        ? `${selectedDay.title} · Day ${programme.days.indexOf(selectedDay) + 1} of ${programme.days.length}`
                        : "No programme days configured"
                    }
                    action={
                      <Button variant="ghost" size="sm" onClick={() => switchView("schedule")}>
                        Full schedule <ArrowRight size={14} />
                      </Button>
                    }
                  />
                  {selectedDay ? (
                    <div className="timeline">
                      {selectedDay.sessions.map((item) => (
                        <button
                          key={item.id}
                          className={`timeline-item ${state.completedSessionIds.includes(item.id) ? "timeline-done" : ""}`}
                          onClick={() => moveToSession(selectedDay.id, item.id)}
                        >
                          <span className="timeline-marker">
                            {state.completedSessionIds.includes(item.id) ? (
                              <Check size={11} />
                            ) : null}
                          </span>
                          <span className="time-chip">
                            {item.start}
                            <i />
                            {item.end}
                          </span>
                          <span className="timeline-title">{item.title}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <EmptyState text="Add programme days to see the timetable." />
                  )}
                </Card>
                <Card className="topology-card">
                  <SectionHeading
                    icon={Network}
                    title="Network Topology"
                    detail="SIMULATED LAB ENVIRONMENT"
                    action={
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Open virtual lab"
                        title="Open virtual lab"
                        onClick={() => switchView("lab")}
                      >
                        <ArrowRight size={16} />
                      </Button>
                    }
                  />
                  <Topology onOpen={() => switchView("lab")} />
                </Card>
                <Card className="upcoming-card">
                  <SectionHeading
                    icon={Zap}
                    title="Upcoming Session"
                    action={
                      nextSession && <span className="next-tag">NEXT · {nextSession.start}</span>
                    }
                  />
                  {nextSession ? (
                    <>
                      <div className="upcoming-accent">
                        <span>
                          DAY {nextSession.dayIndex + 1} · {programme.days.length} DAY PROGRAMME
                        </span>
                        <h3>{nextSession.title}</h3>
                      </div>
                      <div className="upcoming-meta">
                        <span>
                          <CalendarDays size={15} />
                          {dayDateLabel(programme.startDate, nextSession.dayIndex)}
                        </span>
                        <span>
                          <Clock3 size={15} />
                          {nextSession.start} – {nextSession.end}
                        </span>
                      </div>
                      <p className="upcoming-description">{nextSession.description}</p>
                      <Button
                        className="launch-button"
                        onClick={() => moveToSession(nextSession.dayId, nextSession.id)}
                      >
                        <Zap size={15} />
                        Open session <ArrowRight size={15} />
                      </Button>
                    </>
                  ) : (
                    <EmptyState text="All sessions are marked complete." />
                  )}
                </Card>
              </div>
              <Card className="roadmap-card">
                <SectionHeading
                  icon={Layers}
                  title="Programme Roadmap"
                  detail="TRAINING DAYS & TOPICS"
                  action={
                    <span className="date-range-chip">
                      {programme.startDate && programme.endDate
                        ? dateRangeLabel(programme.startDate, programme.endDate)
                        : "Configure dates"}
                    </span>
                  }
                />
                <div className="roadmap-track">
                  {programme.days.map((day, index) => {
                    const done =
                      day.sessions.length > 0 &&
                      day.sessions.every((item) => state.completedSessionIds.includes(item.id));
                    const current = selectedDay?.id === day.id;
                    return (
                      <button
                        key={day.id}
                        className={`roadmap-day ${done ? "roadmap-done" : ""} ${current ? "roadmap-current" : ""}`}
                        onClick={() => patchState({ selectedDayId: day.id })}
                      >
                        <div className="roadmap-day-top">
                          <span>
                            DAY {index + 1} <i>·</i>{" "}
                            {programme.startDate
                              ? dayDateLabel(programme.startDate, index)
                                  .split(", ")
                                  .slice(1)
                                  .join(", ")
                              : "DATE TBD"}
                          </span>
                          {done ? (
                            <CheckCircle2 size={17} />
                          ) : current ? (
                            <span className="current-pill">CURRENT</span>
                          ) : (
                            <ArrowRight size={15} />
                          )}
                        </div>
                        <div className="roadmap-title-row">
                          <RoadmapIcon index={index} />
                          <b>{day.title}</b>
                        </div>
                        <span className="roadmap-topic">{day.topics.slice(0, 3).join(" · ")}</span>
                        <div className="roadmap-mini-track">
                          <span
                            style={{
                              width: `${day.sessions.length ? Math.round((day.sessions.filter((item) => state.completedSessionIds.includes(item.id)).length / day.sessions.length) * 100) : 0}%`,
                            }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </>
          )}
          {activeView === "programmes" && (
            <ProgrammesView
              programmes={programmes}
              activeId={programme.id}
              archivedIds={state.archivedProgrammeIds}
              onSelect={selectProgramme}
              onCreate={() => setEditor(createBlankProgramme())}
              onEdit={setEditor}
              onDuplicate={duplicateProgramme}
              onArchive={archiveProgramme}
              onExport={exportProgramme}
              onImport={() => importRef.current?.click()}
            />
          )}
          {activeView === "schedule" && (
            <ScheduleView
              programme={programme}
              selectedDay={selectedDay}
              state={state}
              onDaySelect={(id) => patchState({ selectedDayId: id, activeConceptId: null })}
              onComplete={completeSession}
              onEditSession={editSession}
              onToggleConceptComplete={toggleConceptComplete}
              onSelectConcept={selectConcept}
              onOpenLab={(labId) => {
                switchView("lab");
              }}
              onOpenSessionAssessment={(sessionId) => {
                switchView("assessments");
              }}
            />
          )}
          {activeView === "modules" && (
            <ModulesView
              programme={programme}
              selectedDayId={state.selectedDayId}
              onSelectDay={(id) => patchState({ selectedDayId: id })}
              onNavigate={() => switchView("schedule")}
              onSelectConcept={(conceptId) => {
                patchState({ selectedDayId: "day-1", activeConceptId: conceptId });
                switchView("schedule");
              }}
            />
          )}
          {activeView === "lab" && (
            <LabView
              programme={programme}
              state={state}
              onChecklist={(id, checked) =>
                patchState({ checklistState: { ...state.checklistState, [id]: checked } })
              }
              onSimulation={(name, value) =>
                patchState({ simulation: { ...state.simulation, [name]: value } })
              }
              onSaveDay1LabScore={saveDay1LabScore}
              onNavigateToSchedule={() => switchView("schedule")}
              currentStudentName={currentStudentName}
              currentStudentEmail={currentStudentEmail}
              currentSeat={currentSeat}
              onSelectLabMode={handleSelectLabMode}
              onUpdateVerification={handleUpdateVerification}
              onSubmitEvidence={handleSubmitEvidence}
              onSubmitAssistanceRequest={handleSubmitAssistanceRequest}
            />
          )}
          {activeView === "assessments" && (
            <AssessmentsView
              programme={programme}
              answers={quizAnswers}
              score={state.quizScore}
              submitted={state.quizSubmitted}
              passScore={programme.completionRules.passScore}
              onAnswer={(id, answer) =>
                setQuizAnswers((previous) => ({ ...previous, [id]: answer }))
              }
              onSubmit={submitQuiz}
              sessionScores={state.day1SessionAssessmentScores}
              finalScore={state.day1FinalAssessmentScore}
              onSaveSessionScore={saveDay1SessionScore}
              onSaveFinalScore={saveDay1FinalScore}
              onNavigateToSchedule={() => switchView("schedule")}
            />
          )}
          {activeView === "resources" && (
            <ResourcesView
              resources={state.resources}
              draft={resourceDraft}
              onDraft={setResourceDraft}
              onSubmit={submitResource}
              onRemove={(id) =>
                patchState({ resources: state.resources.filter((item) => item.id !== id) })
              }
            />
          )}
          {activeView === "progress" && (
            <ProgressView
              programme={programme}
              state={state}
              progress={progress}
              onComplete={completeSession}
            />
          )}
          {activeView === "instructor" &&
            (AuthService.canAccessInstructor(role) ? (
              <InstructorView
                programme={programme}
                state={state}
                onAttendance={(id, value) =>
                  patchState({ attendance: { ...state.attendance, [id]: value } })
                }
                onNavigate={() => switchView("programmes")}
                onUpdateTicketStatus={handleUpdateTicketStatus}
              />
            ) : (
              <Card
                className="full-schedule"
                style={{
                  padding: "48px 24px",
                  textAlign: "center",
                  maxWidth: "600px",
                  margin: "40px auto",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    padding: "16px",
                    borderRadius: "50%",
                    background: "var(--surface-2)",
                    marginBottom: "16px",
                  }}
                >
                  <LockKeyhole size={36} color="var(--cyber)" />
                </div>
                <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>
                  Instructor Console Restricted
                </h2>
                <p style={{ color: "var(--muted)", marginBottom: "24px", lineHeight: "1.6" }}>
                  {role === "student"
                    ? "Your account currently has the Student role. Only designated course instructors or administrators can access attendance tracking and instructor controls."
                    : "This workspace requires an authenticated Instructor or Administrator session."}
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                  <Button variant="default" onClick={() => setAuthModalOpen(true)}>
                    <Shield size={15} />{" "}
                    {role === "student" ? "Switch / Manage Role" : "Sign In to Access"}
                  </Button>
                  <Button variant="outline" onClick={() => switchView("dashboard")}>
                    Return to Dashboard
                  </Button>
                </div>
              </Card>
            ))}
          {activeView === "administration" &&
            (AuthService.canAccessAdmin(role) ? (
              <AdministrationView
                state={state}
                programme={programme}
                onEdit={() => setEditor(structuredClone(programme))}
                onExport={() => exportProgramme(programme)}
                onImport={() => importRef.current?.click()}
                onReset={() => {
                  if (
                    window.confirm(
                      "Reset local settings and progress to the supplied initial programme?",
                    )
                  ) {
                    window.localStorage.removeItem(STORAGE_KEY);
                    setState(createInitialState());
                    toast.success("Local data reset");
                  }
                }}
              />
            ) : (
              <Card
                className="full-schedule"
                style={{
                  padding: "48px 24px",
                  textAlign: "center",
                  maxWidth: "600px",
                  margin: "40px auto",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    padding: "16px",
                    borderRadius: "50%",
                    background: "var(--surface-2)",
                    marginBottom: "16px",
                  }}
                >
                  <ShieldCheck size={36} color="var(--gold)" />
                </div>
                <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>
                  Administrator Privileges Required
                </h2>
                <p style={{ color: "var(--muted)", marginBottom: "24px", lineHeight: "1.6" }}>
                  {role === "guest"
                    ? "Master programme publishing, configuration resets, and system administration are restricted to authenticated administrators."
                    : `Your current role is ${role.toUpperCase()}. Curriculum management and system settings require Administrator privileges.`}
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                  <Button variant="default" onClick={() => setAuthModalOpen(true)}>
                    <Shield size={15} />{" "}
                    {role === "guest" ? "Sign In as Administrator" : "Switch / Manage Role"}
                  </Button>
                  <Button variant="outline" onClick={() => switchView("dashboard")}>
                    Return to Dashboard
                  </Button>
                </div>
              </Card>
            ))}
          <footer className="workspace-footer">
            <span>SHADOWXLAB CYBERSECURITY LEARNING & SIMULATION ENVIRONMENT</span>
            <span>
              <span className="status-indicator" />
              LOCAL DATA SAVED
            </span>
          </footer>
        </div>
      </main>
      <input
        ref={importRef}
        type="file"
        accept="application/json,.json"
        className="visually-hidden"
        onChange={importProgramme}
      />
      {editor && (
        <ProgrammeEditor
          programme={editor}
          onChange={setEditor}
          onClose={() => setEditor(null)}
          onSave={(updated) => {
            const isNew = !programmes.some((item) => item.id === updated.id);
            setState((previous) => ({
              ...previous,
              programmes: isNew
                ? [...previous.programmes, updated]
                : previous.programmes.map((item) => (item.id === updated.id ? updated : item)),
              activeProgrammeId: updated.id,
              selectedDayId: updated.days[0]?.id ?? "",
            }));
            setEditor(null);
            toast.success(isNew ? "Programme created" : "Programme settings saved");
          }}
        />
      )}
      <div className="mobile-dock">
        {navItems.slice(0, 5).map(({ id, icon: Icon, label }) => (
          <Button
            variant="ghost"
            size="icon"
            key={id}
            title={label}
            aria-label={label}
            className={activeView === id ? "dock-active" : ""}
            onClick={() => switchView(id)}
          >
            <Icon size={18} />
          </Button>
        ))}
      </div>
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentState={state}
      />
    </div>
  );
}

function ShadowXLabApp(props: ShadowXLabAppProps = {}) {
  return (
    <AuthProvider>
      <ShadowXLabAppContent {...props} />
    </AuthProvider>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  tone: string;
}) {
  return (
    <div className={`kpi-card kpi-${tone}`}>
      <div className="kpi-icon">
        <Icon size={21} />
      </div>
      <div className="kpi-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{hint}</small>
      </div>
      <div className="kpi-edge" />
    </div>
  );
}

function Topology({ onOpen }: { onOpen: () => void }) {
  return (
    <button className="topology-map" aria-label="Open network topology simulation" onClick={onOpen}>
      <svg
        className="topology-connectors"
        viewBox="0 0 520 258"
        role="img"
        aria-label="Internet and WAN connect through the firewall to LAN, DMZ, and VPN"
      >
        <path d="M260 53V93M160 139H213M307 139H360M260 170V207" />
        <path className="connector-dash" d="M260 58V87M168 139H205M315 139H352M260 178V200" />
      </svg>
      <div className="topology-node wan">
        <Network size={18} />
        <b>INTERNET / WAN</b>
      </div>
      <div className="topology-node lan">
        <MonitorCog size={20} />
        <b>LAN</b>
        <small>Users & clients</small>
      </div>
      <div className="topology-node firewall">
        <ShieldCheck size={23} />
        <b>NGFW</b>
      </div>
      <div className="topology-node dmz">
        <RadioTower size={20} />
        <b>DMZ</b>
        <small>Public services</small>
      </div>
      <div className="topology-node vpn">
        <LockKeyhole size={16} />
        <b>VPN</b>
        <small>Remote / site-to-site</small>
      </div>
      <span className="map-hint">
        OPEN SIMULATION <ArrowRight size={12} />
      </span>
    </button>
  );
}

function RoadmapIcon({ index }: { index: number }) {
  const Icons = [ShieldCheck, Network, Activity, LockKeyhole, Wifi];
  const Icon = Icons[index % Icons.length] ?? ShieldCheck;
  return (
    <span className="roadmap-icon">
      <Icon size={21} />
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="empty-state">
      <CircleHelp size={18} />
      <span>{text}</span>
    </div>
  );
}

function ProgrammesView({
  programmes,
  activeId,
  archivedIds,
  onSelect,
  onCreate,
  onEdit,
  onDuplicate,
  onArchive,
  onExport,
  onImport,
}: {
  programmes: ProgrammeConfig[];
  activeId: string;
  archivedIds: string[];
  onSelect: (id: string) => void;
  onCreate: () => void;
  onEdit: (programme: ProgrammeConfig) => void;
  onDuplicate: (programme: ProgrammeConfig) => void;
  onArchive: (programme: ProgrammeConfig) => void;
  onExport: (programme: ProgrammeConfig) => void;
  onImport: () => void;
}) {
  const [showArchived, setShowArchived] = useState(false);
  const visible = programmes.filter((programme) =>
    showArchived
      ? programme.archived || archivedIds.includes(programme.id)
      : !programme.archived && !archivedIds.includes(programme.id),
  );
  return (
    <>
      <div className="view-intro">
        <div>
          <div className="eyebrow">CONFIGURATION ENGINE</div>
          <h2>Programme management</h2>
          <p>Build, configure and manage learning programmes from reusable data.</p>
        </div>
        <div className="intro-actions">
          <Button variant="outline" onClick={onImport}>
            <Upload size={15} />
            Import JSON
          </Button>
          <Button onClick={onCreate}>
            <Plus size={16} />
            New programme
          </Button>
        </div>
      </div>
      <div className="programme-toolbar">
        <span>
          {visible.length} {showArchived ? "archived" : "active"} programme
          {visible.length === 1 ? "" : "s"}
        </span>
        <Button variant="ghost" onClick={() => setShowArchived((value) => !value)}>
          <Archive size={15} />
          {showArchived ? "Show active" : "View archived"}
        </Button>
      </div>
      {visible.length === 0 ? (
        <Card>
          <EmptyState text="No programmes here yet. Create one or import a configuration." />
        </Card>
      ) : (
        <div className="programme-grid">
          {visible.map((item) => {
            const active = item.id === activeId;
            return (
              <Card
                key={item.id}
                className={`programme-card ${active ? "programme-selected" : ""}`}
              >
                <div className="programme-card-top">
                  <span
                    className={item.published ? "publication-state published" : "publication-state"}
                  >
                    <i />
                    {item.published ? "PUBLISHED" : "DRAFT"}
                  </span>
                  {active && <span className="active-chip">ACTIVE</span>}
                </div>
                <h3>{item.title || "Untitled programme"}</h3>
                <p>{item.description || "No description has been added."}</p>
                <div className="programme-facts">
                  <span>
                    <CalendarDays size={14} />
                    {item.durationLabel || "Duration unset"}
                  </span>
                  <span>
                    <BookOpen size={14} />
                    {countSessions(item)} sessions
                  </span>
                  <span>
                    <FlaskConical size={14} />
                    {item.labs.length} labs
                  </span>
                </div>
                <span className="programme-instructor">
                  {item.instructor || "Instructor not assigned"}
                </span>
                <div className="programme-actions">
                  {!active && (
                    <Button variant="outline" size="sm" onClick={() => onSelect(item.id)}>
                      Select
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Edit programme"
                    aria-label={`Edit ${item.title}`}
                    onClick={() => onEdit(structuredClone(item))}
                  >
                    <Settings2 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Duplicate programme"
                    aria-label={`Duplicate ${item.title}`}
                    onClick={() => onDuplicate(item)}
                  >
                    <Copy size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Export JSON"
                    aria-label={`Export ${item.title}`}
                    onClick={() => onExport(item)}
                  >
                    <Download size={16} />
                  </Button>
                  {!showArchived && (
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Archive programme"
                      aria-label={`Archive ${item.title}`}
                      onClick={() => onArchive(item)}
                    >
                      <Archive size={16} />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

function ScheduleView({
  programme,
  selectedDay,
  state,
  onDaySelect,
  onComplete,
  onEditSession,
  onToggleConceptComplete,
  onSelectConcept,
  onOpenLab,
  onOpenSessionAssessment,
}: {
  programme: ProgrammeConfig;
  selectedDay: ProgrammeConfig["days"][number] | undefined;
  state: TrainingState;
  onDaySelect: (id: string) => void;
  onComplete: (id: string) => void;
  onEditSession: (dayId: string, sessionId: string, change: Partial<TrainingSession>) => void;
  onToggleConceptComplete?: ((conceptId: string) => void) | undefined;
  onSelectConcept?: ((conceptId: string | null) => void) | undefined;
  onOpenLab?: ((labId: string) => void) | undefined;
  onOpenSessionAssessment?: ((sessionId: string) => void) | undefined;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  return (
    <>
      <div className="view-intro">
        <div>
          <div className="eyebrow">TIMETABLE ENGINE</div>
          <h2>Programme schedule</h2>
          <p>
            {programme.title} ·{" "}
            {programme.startDate && programme.endDate
              ? dateRangeLabel(programme.startDate, programme.endDate)
              : "Dates not set"}
          </p>
        </div>
      </div>
      <div className="day-tabs">
        {programme.days.map((day, index) => (
          <Button
            key={day.id}
            variant={selectedDay?.id === day.id ? "default" : "outline"}
            onClick={() => onDaySelect(day.id)}
          >
            <span>DAY {index + 1}</span>
            {day.title}
          </Button>
        ))}
      </div>
      {selectedDay ? (
        selectedDay.id === "day-1" ? (
          state.activeConceptId ? (
            <ConceptLearningPanel
              conceptId={state.activeConceptId}
              completedConceptIds={state.day1CompletedConceptIds ?? []}
              onToggleComplete={(cId) => onToggleConceptComplete?.(cId)}
              onSelectConcept={(cId) => onSelectConcept?.(cId)}
              onOpenLab={(lId) => onOpenLab?.(lId)}
              onBackToSchedule={() => onSelectConcept?.(null)}
            />
          ) : (
            <Card className="full-schedule p-4">
              <SectionHeading
                icon={CalendarDays}
                title={selectedDay.title}
                detail={dayDateLabel(programme.startDate, programme.days.indexOf(selectedDay))}
              />
              <Day1ScheduleAccordion
                completedSessionIds={state.completedSessionIds}
                completedConceptIds={state.day1CompletedConceptIds ?? []}
                sessionScores={state.day1SessionAssessmentScores ?? {}}
                labScores={state.day1LabScores ?? {}}
                onToggleSessionComplete={onComplete}
                onToggleConceptComplete={(cId) => onToggleConceptComplete?.(cId)}
                onSelectConcept={(cId) => onSelectConcept?.(cId)}
                onOpenLab={(lId) => onOpenLab?.(lId)}
                onOpenSessionAssessment={(sId) => onOpenSessionAssessment?.(sId)}
              />
            </Card>
          )
        ) : (
          <Card className="full-schedule">
            <SectionHeading
              icon={CalendarDays}
              title={selectedDay.title}
              detail={dayDateLabel(programme.startDate, programme.days.indexOf(selectedDay))}
            />
            <div className="schedule-list">
              {selectedDay.sessions.map((item, index) => {
                const done = state.completedSessionIds.includes(item.id);
                const isEditing = editing === item.id;
                return (
                  <div
                    className={`schedule-row ${done ? "schedule-row-done" : ""}`}
                    id={`session-${item.id}`}
                    key={item.id}
                  >
                    <div className="schedule-index">{String(index + 1).padStart(2, "0")}</div>
                    <div className="schedule-time">
                      <strong>{item.start}</strong>
                      <span>{item.end}</span>
                    </div>
                    <div className="schedule-detail">
                      {isEditing ? (
                        <>
                          <Input
                            aria-label="Session title"
                            value={item.title}
                            onChange={(event) =>
                              onEditSession(selectedDay.id, item.id, { title: event.target.value })
                            }
                          />
                          <div className="session-time-edit">
                            <Input
                              aria-label="Start time"
                              type="time"
                              value={item.start}
                              onChange={(event) =>
                                onEditSession(selectedDay.id, item.id, {
                                  start: event.target.value,
                                })
                              }
                            />
                            <Input
                              aria-label="End time"
                              type="time"
                              value={item.end}
                              onChange={(event) =>
                                onEditSession(selectedDay.id, item.id, { end: event.target.value })
                              }
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Finish editing session"
                              onClick={() => setEditing(null)}
                            >
                              <Check size={17} />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="session-title-row">
                            <h3>{item.title}</h3>
                            <span className={`session-type type-${item.kind}`}>{item.kind}</span>
                          </div>
                          <p>{item.description}</p>
                        </>
                      )}
                    </div>
                    <div className="schedule-controls">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={isEditing ? "Finish editing" : `Edit ${item.title}`}
                        onClick={() => setEditing(isEditing ? null : item.id)}
                      >
                        {isEditing ? <Check size={16} /> : <Settings2 size={16} />}
                      </Button>
                      <Button
                        variant={done ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => onComplete(item.id)}
                      >
                        {done ? <CheckCircle2 size={15} /> : <Check size={15} />}
                        {done ? "Completed" : "Mark complete"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )
      ) : (
        <Card>
          <EmptyState text="This programme has no schedule days yet." />
        </Card>
      )}
    </>
  );
}

function ModulesView({
  programme,
  selectedDayId,
  onSelectDay,
  onNavigate,
  onSelectConcept,
}: {
  programme: ProgrammeConfig;
  selectedDayId: string;
  onSelectDay: (id: string) => void;
  onNavigate: () => void;
  onSelectConcept?: ((conceptId: string) => void) | undefined;
}) {
  return (
    <>
      <div className="view-intro">
        <div>
          <div className="eyebrow">LEARNING MODULE ENGINE</div>
          <h2>Learning modules</h2>
          <p>Course topics are organized by configured programme days.</p>
        </div>
      </div>
      <div className="module-layout">
        <div className="module-day-list">
          {programme.days.map((day, index) => (
            <Button
              key={day.id}
              variant="ghost"
              className={`module-day-button ${selectedDayId === day.id ? "module-day-active" : ""}`}
              onClick={() => onSelectDay(day.id)}
            >
              <span className="module-day-number">{String(index + 1).padStart(2, "0")}</span>
              <span>{day.title}</span>
              <ArrowRight size={14} />
            </Button>
          ))}
        </div>
        <Card className="module-content">
          {(() => {
            const day =
              programme.days.find((item) => item.id === selectedDayId) ?? programme.days[0];
            if (!day) return <EmptyState text="Add programme days to see learning modules." />;
            return (
              <>
                <div className="eyebrow">
                  DAY {programme.days.indexOf(day) + 1} ·{" "}
                  {dayDateLabel(programme.startDate, programme.days.indexOf(day))}
                </div>
                <h3>{day.title}</h3>
                <p className="module-summary">
                  {day.id === "day-1"
                    ? "4 sessions · 48 Authoritative Curriculum Concepts · 4 Labs"
                    : `${day.sessions.length} sessions · ${day.topics.length} learning topics`}
                </p>
                <div className="topic-list">
                  {day.topics.map((topic, index) => (
                    <div
                      key={`${day.id}-topic-${index}`}
                      onClick={() => {
                        if (day.id === "day-1" && onSelectConcept) {
                          onSelectConcept(`day1-concept-${String(index + 1).padStart(2, "0")}`);
                        }
                      }}
                      className={day.id === "day-1" ? "cursor-pointer hover:text-cyan-300" : ""}
                    >
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <BookOpen size={15} />
                      <b>{topic}</b>
                      <CheckCircle2 size={15} />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button onClick={onNavigate}>
                    Open day schedule <ArrowRight size={15} />
                  </Button>
                  {day.id === "day-1" && onSelectConcept && (
                    <Button variant="outline" onClick={() => onSelectConcept("day1-concept-01")}>
                      Start Concept 01 Learning <BookOpen size={15} className="ml-1" />
                    </Button>
                  )}
                </div>
              </>
            );
          })()}
        </Card>
      </div>
    </>
  );
}

function LabView({
  programme,
  state,
  onChecklist,
  onSimulation,
  onSaveDay1LabScore,
  onNavigateToSchedule,
  currentStudentName = "Alex Chen",
  currentStudentEmail = "student01@shadowxlab.com",
  currentSeat = "Station 01",
  onSelectLabMode,
  onUpdateVerification,
  onSubmitEvidence,
  onSubmitAssistanceRequest,
}: {
  programme: ProgrammeConfig;
  state: TrainingState;
  onChecklist: (id: string, value: boolean) => void;
  onSimulation: (name: keyof TrainingState["simulation"], value: boolean) => void;
  onSaveDay1LabScore?: ((labId: string, score: number) => void) | undefined;
  onNavigateToSchedule?: (() => void) | undefined;
  currentStudentName?: string | undefined;
  currentStudentEmail?: string | undefined;
  currentSeat?: string | undefined;
  onSelectLabMode?: ((mode: LabMode) => void) | undefined;
  onUpdateVerification?: ((update: Partial<StandardLabVerificationState>) => void) | undefined;
  onSubmitEvidence?: ((evidence: string, notes: string) => void) | undefined;
  onSubmitAssistanceRequest?:
    ((req: Omit<AssistanceRequest, "id" | "timestamp" | "status">) => void) | undefined;
}) {
  const [labTab, setLabTab] = useState<
    "readiness" | "standard_pfsense" | "troubleshooting" | "day1" | "packet_simulator" | "range"
  >("readiness");
  const [activeLabId, setActiveLabId] = useState(programme.labs[0]?.id ?? "");
  const lab = programme.labs.find((item) => item.id === activeLabId) ?? programme.labs[0];
  const labSessions = programme.days.flatMap((day) =>
    day.sessions.filter((item) => item.kind === "lab").map((item) => ({ ...item, dayId: day.id })),
  );
  return (
    <>
      <div className="view-intro">
        <div>
          <div className="eyebrow">PRACTICAL LAB READINESS & CYBER RANGE</div>
          <h2>Enterprise Virtual Lab Engine</h2>
          <p>
            Hardware-aware practical exercises for pfSense, Kali Linux, and Ubuntu Server. Equipped
            with guided pre-flight readiness checks, deterministic simulations, and live
            troubleshooting wizards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="simulation-badge">
            <span className="status-indicator" />
            MODE: {(state.selectedLabMode ?? "local-full").toUpperCase()}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border/80 pb-3 mb-4">
        <Button
          variant={labTab === "readiness" ? "default" : "outline"}
          onClick={() => setLabTab("readiness")}
          className="gap-2 text-xs"
        >
          <Activity size={15} />
          Lab Readiness Center
        </Button>
        <Button
          variant={labTab === "standard_pfsense" ? "default" : "outline"}
          onClick={() => setLabTab("standard_pfsense")}
          className="gap-2 text-xs"
        >
          <Shield size={15} />
          Standard pfSense Lab (SXL-LAN)
        </Button>
        <Button
          variant={labTab === "troubleshooting" ? "default" : "outline"}
          onClick={() => setLabTab("troubleshooting")}
          className="gap-2 text-xs"
        >
          <Zap size={15} />
          Troubleshooting Wizard
        </Button>
        <Button
          variant={labTab === "day1" ? "default" : "outline"}
          onClick={() => setLabTab("day1")}
          className="gap-2 text-xs"
        >
          <FlaskConical size={15} />
          Day 1 Practical Simulations (4 Labs)
        </Button>
        <Button
          variant={labTab === "packet_simulator" ? "default" : "outline"}
          onClick={() => setLabTab("packet_simulator")}
          className="gap-2 text-xs border-cyan-500/40 text-cyan-400 hover:text-cyan-300"
        >
          <RadioTower size={15} />
          Packet Journey Simulator
        </Button>
        <Button
          variant={labTab === "range" ? "default" : "outline"}
          onClick={() => setLabTab("range")}
          className="gap-2 text-xs"
        >
          <Network size={15} />
          Cyber Range Controls & Topology
        </Button>
      </div>

      {labTab === "readiness" && (
        <LabReadinessCenter
          currentStudentName={currentStudentName}
          currentStudentEmail={currentStudentEmail}
          currentSeat={currentSeat}
          selectedMode={state.selectedLabMode ?? "local-full"}
          onSelectMode={onSelectLabMode ?? (() => {})}
          assistanceRequests={state.assistanceRequests ?? []}
          onSubmitAssistanceRequest={onSubmitAssistanceRequest ?? (() => {})}
          onOpenStandardLab={() => setLabTab("standard_pfsense")}
          onOpenTroubleshooting={() => setLabTab("troubleshooting")}
          onSwitchToSimulation={() => setLabTab("day1")}
        />
      )}

      {labTab === "standard_pfsense" && (
        <StandardPfSenseLab
          labMode={state.selectedLabMode ?? "local-full"}
          verificationState={
            state.standardLabVerification ?? {
              kaliIpVerified: false,
              pfsensePingVerified: false,
              ubuntuPingVerified: false,
              internetPingVerified: false,
              dnsLookupVerified: false,
              pfsenseWebGuiVerified: false,
            }
          }
          onUpdateVerification={onUpdateVerification ?? (() => {})}
          onSubmitEvidence={onSubmitEvidence ?? (() => {})}
          onOpenTroubleshooting={() => setLabTab("troubleshooting")}
          onSwitchToSimulation={() => setLabTab("day1")}
        />
      )}

      {labTab === "troubleshooting" && (
        <LabTroubleshootingWizard
          onOpenAssistanceModal={(category, defaultMsg) => {
            onSubmitAssistanceRequest?.({
              studentId: currentStudentEmail,
              studentName: currentStudentName,
              studentEmail: currentStudentEmail,
              seat: currentSeat,
              labMode: state.selectedLabMode ?? "local-full",
              blockerCategory: category,
              description: defaultMsg,
              systemSpecs: "Troubleshooting Wizard Auto-Escalation",
            });
            toast.success("Assistance ticket dispatched to Instructor Dashboard!");
          }}
          onOpenStandardLab={() => setLabTab("standard_pfsense")}
        />
      )}

      {labTab === "day1" && (
        <Day1Labs
          labScores={state.day1LabScores ?? {}}
          onSaveLabScore={onSaveDay1LabScore ?? (() => {})}
          onNavigateToSchedule={onNavigateToSchedule}
        />
      )}

      {labTab === "packet_simulator" && (
        <PacketJourneySimulator
          onLabScoreSave={(score) => onSaveDay1LabScore?.("day1-lab-03", score)}
        />
      )}

      {labTab === "range" && (
        <div className="lab-dashboard">
          <div className="lab-selector">
            <Card>
              <SectionHeading
                icon={FlaskConical}
                title="Configured labs"
                detail={`${programme.labs.length} practical labs`}
              />
              <div className="lab-list">
                {programme.labs.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={`lab-select-item ${lab?.id === item.id ? "lab-select-active" : ""}`}
                    onClick={() => setActiveLabId(item.id)}
                  >
                    <FlaskConical size={16} />
                    <span>{item.title}</span>
                    <ArrowRight size={14} />
                  </Button>
                ))}
              </div>
            </Card>
          </div>
          <div className="lab-main">
            {lab ? (
              <Card>
                <SectionHeading
                  icon={Network}
                  title="Network topology"
                  detail="INTERACTIVE CONFIGURATION SIMULATION"
                />
                <Topology
                  onOpen={() => toast("Topology nodes represent simulated training controls.")}
                />
                <div className="simulation-controls">
                  <div className="sim-control">
                    <span>
                      <Shield size={16} />
                      <b>Firewall policy</b>
                    </span>
                    <Button
                      variant={state.simulation.firewallEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        onSimulation("firewallEnabled", !state.simulation.firewallEnabled)
                      }
                    >
                      {state.simulation.firewallEnabled ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                  <div className="sim-control">
                    <span>
                      <SlidersHorizontal size={16} />
                      <b>NAT translation</b>
                    </span>
                    <Button
                      variant={state.simulation.natEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => onSimulation("natEnabled", !state.simulation.natEnabled)}
                    >
                      {state.simulation.natEnabled ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                  <div className="sim-control">
                    <span>
                      <LockKeyhole size={16} />
                      <b>VPN tunnel</b>
                    </span>
                    <Button
                      variant={state.simulation.vpnConnected ? "default" : "outline"}
                      size="sm"
                      onClick={() => onSimulation("vpnConnected", !state.simulation.vpnConnected)}
                    >
                      {state.simulation.vpnConnected ? "Connected" : "Disconnected"}
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card>
                <EmptyState text="Create a lab configuration in programme settings." />
              </Card>
            )}
            {lab && (
              <Card className="lab-instructions">
                <SectionHeading
                  icon={ClipboardCheck}
                  title={lab.title}
                  detail="LAB INSTRUCTIONS & VALIDATION"
                />
                <ol>
                  {lab.instructions.map((instruction, index) => (
                    <li key={instruction}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      {instruction}
                    </li>
                  ))}
                </ol>
                <div className="checklist-title">VALIDATION CHECKLIST</div>
                {lab.checklist.map((item, index) => {
                  const key = `${lab.id}-${index}`;
                  return (
                    <label className="checklist-row" key={key}>
                      <input
                        type="checkbox"
                        checked={Boolean(state.checklistState[key])}
                        onChange={(event) => onChecklist(key, event.target.checked)}
                      />
                      <span>{item}</span>
                      {state.checklistState[key] && <Check size={14} />}
                    </label>
                  );
                })}
                <p className="simulation-note">
                  <CircleHelp size={14} />
                  Checklist progress is saved in this browser. Simulation controls do not change
                  live network devices.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function AssessmentsView({
  programme,
  answers,
  score,
  submitted,
  passScore,
  onAnswer,
  onSubmit,
  sessionScores,
  finalScore,
  onSaveSessionScore,
  onSaveFinalScore,
  onNavigateToSchedule,
}: {
  programme: ProgrammeConfig;
  answers: Record<string, number>;
  score: number | null;
  submitted: boolean;
  passScore: number;
  onAnswer: (id: string, answer: number) => void;
  onSubmit: () => void;
  sessionScores?: Record<string, number> | undefined;
  finalScore?: number | null | undefined;
  onSaveSessionScore?: ((sessionId: string, score: number) => void) | undefined;
  onSaveFinalScore?: ((score: number) => void) | undefined;
  onNavigateToSchedule?: (() => void) | undefined;
}) {
  const [assessmentMode, setAssessmentMode] = useState<"day1" | "programme">("day1");
  return (
    <>
      <div className="view-intro">
        <div>
          <div className="eyebrow">ASSESSMENT ENGINE</div>
          <h2>Knowledge assessment</h2>
          <p>Review concepts from the configured course curriculum.</p>
        </div>
        {assessmentMode === "programme" && submitted && score !== null && (
          <span className={`score-badge ${score >= passScore ? "score-pass" : "score-retry"}`}>
            {score}% · {score >= passScore ? "PASS" : "REVIEW"}
          </span>
        )}
      </div>

      <div className="flex gap-2 border-b border-border/80 pb-3 mb-4">
        <Button
          variant={assessmentMode === "day1" ? "default" : "outline"}
          onClick={() => setAssessmentMode("day1")}
          className="gap-2 text-xs"
        >
          <ClipboardCheck size={15} />
          Day 1 Technical Assessments (4 Sessions & Final Exam)
        </Button>
        <Button
          variant={assessmentMode === "programme" ? "default" : "outline"}
          onClick={() => setAssessmentMode("programme")}
          className="gap-2 text-xs"
        >
          <BookOpen size={15} />
          General Course Capstone Quiz
        </Button>
      </div>

      {assessmentMode === "day1" ? (
        <Day1Assessments
          sessionScores={sessionScores ?? {}}
          finalScore={finalScore ?? null}
          onSaveSessionScore={onSaveSessionScore ?? (() => {})}
          onSaveFinalScore={onSaveFinalScore ?? (() => {})}
          onNavigateToSchedule={onNavigateToSchedule}
        />
      ) : programme.assessments.length ? (
        <Card className="assessment-card">
          <div className="assessment-top">
            <ClipboardCheck size={21} />
            <div>
              <b>Programme knowledge check</b>
              <span>
                {programme.assessments.length} questions · pass score {passScore}%
              </span>
            </div>
            {submitted && score !== null && (
              <div className="assessment-score">
                {score}
                <small>%</small>
              </div>
            )}
          </div>
          <div className="question-list">
            {programme.assessments.map((question, index) => (
              <div className="question-block" key={question.id}>
                <h3>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {question.prompt}
                </h3>
                <div className="answer-options">
                  {question.options.map((option, optionIndex) => {
                    const selected = answers[question.id] === optionIndex;
                    const correct = submitted && question.answer === optionIndex;
                    return (
                      <Button
                        key={option}
                        variant="outline"
                        className={`answer-option ${selected ? "answer-selected" : ""} ${correct ? "answer-correct" : ""}`}
                        onClick={() => !submitted && onAnswer(question.id, optionIndex)}
                        disabled={submitted}
                      >
                        <span>{String.fromCharCode(65 + optionIndex)}</span>
                        {option}
                        {correct && <CheckCircle2 size={15} />}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <Button
            onClick={onSubmit}
            disabled={submitted || Object.keys(answers).length !== programme.assessments.length}
          >
            <CheckCircle2 size={16} />
            Submit assessment
          </Button>
          {submitted && (
            <Button
              variant="outline"
              className="retake-button"
              onClick={() => window.location.reload()}
            >
              Start over
            </Button>
          )}
        </Card>
      ) : (
        <Card>
          <EmptyState text="No assessment questions are configured for this programme." />
        </Card>
      )}
    </>
  );
}

function ResourcesView({
  resources,
  draft,
  onDraft,
  onSubmit,
  onRemove,
}: {
  resources: TrainingState["resources"];
  draft: { title: string; url: string; kind: string };
  onDraft: (value: { title: string; url: string; kind: string }) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <>
      <div className="view-intro">
        <div>
          <div className="eyebrow">RESOURCE ENGINE</div>
          <h2>Programme resources</h2>
          <p>Manage reference links alongside your local programme data.</p>
        </div>
      </div>
      <div className="resource-layout">
        <Card>
          <SectionHeading icon={Plus} title="Add a resource" detail="STORED LOCALLY" />
          <form className="resource-form" onSubmit={onSubmit}>
            <Field label="Resource title">
              <Input
                required
                value={draft.title}
                onChange={(event) => onDraft({ ...draft, title: event.target.value })}
                placeholder="Firewall configuration notes"
              />
            </Field>
            <Field label="Resource link">
              <Input
                type="url"
                value={draft.url}
                onChange={(event) => onDraft({ ...draft, url: event.target.value })}
                placeholder="https://…"
              />
            </Field>
            <Field label="Type">
              <select
                value={draft.kind}
                onChange={(event) => onDraft({ ...draft, kind: event.target.value })}
              >
                <option>Reference</option>
                <option>Document</option>
                <option>Video</option>
                <option>Other</option>
              </select>
            </Field>
            <Button type="submit">
              <Plus size={15} />
              Add resource
            </Button>
          </form>
        </Card>
        <Card>
          <SectionHeading
            icon={FileJson2}
            title="Saved resources"
            detail={`${resources.length} items`}
          />
          {resources.length ? (
            <div className="resource-list">
              {resources.map((item) => (
                <div key={item.id} className="resource-row">
                  <FileJson2 size={18} />
                  <span>
                    <b>{item.title}</b>
                    <small>
                      {item.kind}
                      {item.url && ` · ${item.url}`}
                    </small>
                  </span>
                  {item.url && (
                    <a
                      className="resource-open"
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${item.title}`}
                    >
                      <ArrowRight size={15} />
                    </a>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${item.title}`}
                    onClick={() => onRemove(item.id)}
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="No extra resources have been added." />
          )}
        </Card>
      </div>
    </>
  );
}

function ProgressView({
  programme,
  state,
  progress,
  onComplete,
}: {
  programme: ProgrammeConfig;
  state: TrainingState;
  progress: number;
  onComplete: (id: string) => void;
}) {
  const day1 = calculateDay1Metrics(
    state.day1CompletedConceptIds ?? [],
    state.day1LabScores ?? {},
    state.day1SessionAssessmentScores ?? {},
    state.day1FinalAssessmentScore ?? null,
  );

  return (
    <>
      <div className="view-intro">
        <div>
          <div className="eyebrow">LEARNER PROGRESS ENGINE</div>
          <h2>Programme progress</h2>
          <p>Completion is calculated from the selected programme's session configuration.</p>
        </div>
      </div>
      <div className="progress-overview space-y-4">
        {/* Day 1 Authoritative Curriculum Mastery Card */}
        <Card className="progress-summary border-cyan-500/30 bg-card/60">
          <div
            className="progress-ring"
            style={{
              background: `conic-gradient(var(--cyber) ${day1.conceptPercentage * 3.6}deg, var(--surface-2) 0deg)`,
            }}
          >
            <div>
              <b>
                {day1.conceptPercentage}
                <small>%</small>
              </b>
              <span>DAY 1</span>
            </div>
          </div>
          <div className="summary-lines">
            <span className="font-bold text-foreground">Day 1 Security & Firewall Foundations</span>
            <span>
              <strong>{day1.conceptCount}</strong> / {day1.totalConcepts} Authoritative Concepts
              Completed ({day1.conceptPercentage}%)
            </span>
            <span>
              <strong>{day1.passedLabs}</strong> / {day1.totalLabs} Virtual Labs Passed (≥70%)
            </span>
            <span>
              <strong>{day1.passedSessions}</strong> / {day1.totalSessions} Session Assessments
              Passed
            </span>
            <span>
              Day 1 Final Exam:{" "}
              {day1.finalScore !== null
                ? `${day1.finalScore}% (${day1.finalPassed ? "PASS" : "RETRY"})`
                : "Not submitted"}
            </span>
          </div>
        </Card>

        <Card className="progress-summary">
          <div
            className="progress-ring"
            style={{
              background: `conic-gradient(var(--cyber) ${progress * 3.6}deg, var(--surface-2) 0deg)`,
            }}
          >
            <div>
              <b>
                {progress}
                <small>%</small>
              </b>
              <span>OVERALL</span>
            </div>
          </div>
          <div className="summary-lines">
            <span className="font-bold text-foreground">Programme Overview</span>
            <span>
              {
                state.completedSessionIds.filter((id) =>
                  programme.days.some((day) => day.sessions.some((item) => item.id === id)),
                ).length
              }{" "}
              / {countSessions(programme)} sessions completed
            </span>
            <span>
              {
                programme.labs.filter((lab) =>
                  state.completedSessionIds.some((id) =>
                    programme.days
                      .find((day) => day.id === lab.dayId)
                      ?.sessions.some((item) => item.id === id && item.kind === "lab"),
                  ),
                ).length
              }{" "}
              / {programme.labs.length} lab sessions completed
            </span>
            <span>
              Assessment {state.quizScore === null ? "not submitted" : `${state.quizScore}%`}
            </span>
          </div>
        </Card>
        <div className="progress-days">
          {programme.days.map((day, index) => {
            const done = day.sessions.filter((item) =>
              state.completedSessionIds.includes(item.id),
            ).length;
            const percent = day.sessions.length
              ? Math.round((done / day.sessions.length) * 100)
              : 0;
            return (
              <Card className="progress-day" key={day.id}>
                <div className="progress-day-head">
                  <span>DAY {index + 1}</span>
                  <b>{percent}%</b>
                </div>
                <h3>{day.title}</h3>
                <div className="progress-track">
                  <div style={{ width: `${percent}%` }} />
                </div>
                <small>
                  {done} of {day.sessions.length} sessions
                </small>
                <div className="progress-session-list">
                  {day.sessions.map((item) => (
                    <button key={item.id} onClick={() => onComplete(item.id)}>
                      <span
                        className={
                          state.completedSessionIds.includes(item.id)
                            ? "small-check checked"
                            : "small-check"
                        }
                      >
                        {state.completedSessionIds.includes(item.id) && <Check size={10} />}
                      </span>
                      {item.title}
                    </button>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}

function InstructorView({
  programme,
  state,
  onAttendance,
  onNavigate,
  onUpdateTicketStatus,
}: {
  programme: ProgrammeConfig;
  state: TrainingState;
  onAttendance: (id: string, value: boolean) => void;
  onNavigate: () => void;
  onUpdateTicketStatus?:
    ((ticketId: string, status: AssistanceRequest["status"], note?: string) => void) | undefined;
}) {
  const [instructorTab, setInstructorTab] = useState<"readiness" | "attendance">("readiness");
  const sessions = programme.days.flatMap((day, dayIndex) =>
    day.sessions.map((item) => ({ ...item, day, dayIndex })),
  );
  const attendanceCount = sessions.filter((item) => state.attendance[item.id]).length;
  const openTicketCount = (state.assistanceRequests ?? []).filter(
    (r) => r.status === "open",
  ).length;

  return (
    <>
      <div className="view-intro">
        <div>
          <div className="eyebrow">INSTRUCTOR CONSOLE</div>
          <h2>{programme.instructor || "Instructor"}</h2>
          <p>
            Student lab readiness tracking, real-time assistance queue, attendance, and curriculum
            controls.
          </p>
        </div>
        <Button onClick={onNavigate}>
          <Settings2 size={15} />
          Manage programme
        </Button>
      </div>

      <div className="flex gap-2 border-b border-border/80 pb-3 mb-4">
        <Button
          variant={instructorTab === "readiness" ? "default" : "outline"}
          onClick={() => setInstructorTab("readiness")}
          className="gap-2 text-xs"
        >
          <Activity size={15} />
          Student Lab Readiness & Assistance Queue
          {openTicketCount > 0 && (
            <span className="bg-amber-500 text-black px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {openTicketCount}
            </span>
          )}
        </Button>
        <Button
          variant={instructorTab === "attendance" ? "default" : "outline"}
          onClick={() => setInstructorTab("attendance")}
          className="gap-2 text-xs"
        >
          <Users size={15} />
          Session Attendance & Day 1 Curriculum Tracking
        </Button>
      </div>

      {instructorTab === "readiness" ? (
        <InstructorLabReadinessPanel
          assistanceRequests={state.assistanceRequests ?? []}
          onUpdateTicketStatus={onUpdateTicketStatus ?? (() => {})}
          onSwitchAllBlockedToSimulation={() => {
            toast.success(
              "Zero-Troubleshooting Policy Triggered: Transitioned all blocked stations to Mode C (Browser Simulation)!",
            );
          }}
        />
      ) : (
        <>
          <div className="instructor-stats">
            <Card>
              <Users size={18} />
              <span>ATTENDANCE RECORDS</span>
              <strong>{attendanceCount}</strong>
              <small>of {sessions.length} sessions</small>
            </Card>
            <Card>
              <BookOpen size={18} />
              <span>COURSE SESSIONS</span>
              <strong>{sessions.length}</strong>
              <small>{programme.days.length} configured days</small>
            </Card>
            <Card>
              <FlaskConical size={18} />
              <span>LAB CONFIGURATIONS</span>
              <strong>{programme.labs.length}</strong>
              <small>saved in this programme</small>
            </Card>
          </div>
          <Card>
            <SectionHeading
              icon={Users}
              title="Session attendance"
              detail="LOCAL TRAINING RECORD"
            />
            <div className="attendance-list">
              {sessions.map((item) => (
                <label key={item.id} className="attendance-row">
                  <span>
                    <small>
                      DAY {item.dayIndex + 1} · {item.start}
                    </small>
                    <b>{item.title}</b>
                  </span>
                  <input
                    type="checkbox"
                    checked={Boolean(state.attendance[item.id])}
                    onChange={(event) => onAttendance(item.id, event.target.checked)}
                  />
                  <span>{state.attendance[item.id] ? "Recorded" : "Mark attendance"}</span>
                </label>
              ))}
            </div>
          </Card>

          <Card className="mt-4">
            <SectionHeading
              icon={Layers}
              title="Day 1 Curriculum Tracking"
              detail="AUTHORITATIVE 48-CONCEPT RANGE STATUS"
            />
            <div className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="rounded border border-border/70 bg-surface-2/20 p-3">
                  <span className="text-muted-foreground block text-[10px] font-mono">
                    CONCEPTS COMPLETED
                  </span>
                  <strong className="text-lg font-bold text-foreground">
                    {state.day1CompletedConceptIds?.length ?? 0}
                  </strong>
                  <small className="text-muted-foreground block">
                    of 48 authoritative concepts
                  </small>
                </div>
                <div className="rounded border border-border/70 bg-surface-2/20 p-3">
                  <span className="text-muted-foreground block text-[10px] font-mono">
                    VIRTUAL LABS ATTEMPTED
                  </span>
                  <strong className="text-lg font-bold text-foreground">
                    {Object.keys(state.day1LabScores ?? {}).length}
                  </strong>
                  <small className="text-muted-foreground block">of 4 practical simulations</small>
                </div>
                <div className="rounded border border-border/70 bg-surface-2/20 p-3">
                  <span className="text-muted-foreground block text-[10px] font-mono">
                    SESSION ASSESSMENTS
                  </span>
                  <strong className="text-lg font-bold text-foreground">
                    {Object.keys(state.day1SessionAssessmentScores ?? {}).length}
                  </strong>
                  <small className="text-muted-foreground block">of 4 sessions graded</small>
                </div>
                <div className="rounded border border-border/70 bg-surface-2/20 p-3">
                  <span className="text-muted-foreground block text-[10px] font-mono">
                    FINAL EXAM STATUS
                  </span>
                  <strong className="text-lg font-bold text-foreground">
                    {state.day1FinalAssessmentScore !== null &&
                    state.day1FinalAssessmentScore !== undefined
                      ? `${state.day1FinalAssessmentScore}%`
                      : "Not Taken"}
                  </strong>
                  <small className="text-muted-foreground block">
                    {state.day1FinalAssessmentScore !== null &&
                    state.day1FinalAssessmentScore !== undefined &&
                    state.day1FinalAssessmentScore >= 70
                      ? "Passing Grade"
                      : "Pending completion"}
                  </small>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </>
  );
}

function AdministrationView({
  state,
  programme,
  onEdit,
  onExport,
  onImport,
  onReset,
}: {
  state: TrainingState;
  programme: ProgrammeConfig;
  onEdit: () => void;
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
}) {
  const configText = useMemo(() => JSON.stringify(programme, null, 2), [programme]);
  return (
    <>
      <div className="view-intro">
        <div>
          <div className="eyebrow">CONFIGURATION ENGINE</div>
          <h2>Administration</h2>
          <p>Programme identity, publishing and local data controls.</p>
        </div>
      </div>
      <div className="administration-grid">
        <Card>
          <SectionHeading
            icon={Settings2}
            title="Active programme"
            detail="CONFIGURATION SUMMARY"
          />
          <div className="admin-programme-title">
            <span className="publication-state published">
              <i />
              {programme.published ? "PUBLISHED" : "DRAFT"}
            </span>
            <h3>{programme.title}</h3>
            <p>{programme.description}</p>
          </div>
          <div className="admin-details">
            <span>
              Instructor <b>{programme.instructor || "Not assigned"}</b>
            </span>
            <span>
              Training range <b>{programme.location || "Not set"}</b>
            </span>
            <span>
              Duration <b>{programme.durationLabel || "Not set"}</b>
            </span>
            <span>
              Dates{" "}
              <b>
                {programme.startDate && programme.endDate
                  ? dateRangeLabel(programme.startDate, programme.endDate)
                  : "Not set"}
              </b>
            </span>
            <span>
              Completion rule{" "}
              <b>
                {programme.completionRules.completeAllSessions
                  ? "Complete configured sessions"
                  : "Custom completion"}
              </b>
            </span>
            <span>
              Pass score <b>{programme.completionRules.passScore}%</b>
            </span>
          </div>
          <div className="admin-actions">
            <Button onClick={onEdit}>
              <Settings2 size={15} />
              Edit programme
            </Button>
            <Button variant="outline" onClick={onExport}>
              <Download size={15} />
              Export JSON
            </Button>
            <Button variant="outline" onClick={onImport}>
              <Upload size={15} />
              Import JSON
            </Button>
          </div>
        </Card>
        <Card>
          <SectionHeading
            icon={SlidersHorizontal}
            title="Local platform data"
            detail="THIS BROWSER ONLY"
          />
          <div className="local-storage-indicator">
            <span className="status-indicator" />
            <div>
              <b>Persistent local storage active</b>
              <small>
                {state.programmes.length} programmes · {state.resources.length} resources · progress
                and attendance
              </small>
            </div>
          </div>
          <details className="configuration-inspector">
            <summary>
              <FileJson2 size={15} />
              View active programme JSON
            </summary>
            <pre>{configText}</pre>
          </details>
          <Button variant="outline" className="reset-button" onClick={onReset}>
            <Trash2 size={15} />
            Reset local data to initial course
          </Button>
          <p className="simulation-note">
            <CircleHelp size={14} />
            All records are stored in this browser. This version does not sync between devices or
            users.
          </p>
        </Card>
      </div>
    </>
  );
}

function ProgrammeEditor({
  programme,
  onChange,
  onClose,
  onSave,
}: {
  programme: ProgrammeConfig;
  onChange: (programme: ProgrammeConfig) => void;
  onClose: () => void;
  onSave: (programme: ProgrammeConfig) => void;
}) {
  const patch = (change: Partial<ProgrammeConfig>) => onChange({ ...programme, ...change });
  const patchDay = (dayId: string, change: Partial<ProgrammeConfig["days"][number]>) =>
    patch({ days: programme.days.map((day) => (day.id === dayId ? { ...day, ...change } : day)) });
  const addDay = () =>
    patch({
      days: [
        ...programme.days,
        {
          id: `day-${crypto.randomUUID()}`,
          title: `Day ${programme.days.length + 1}`,
          topics: [],
          sessions: [],
        },
      ],
    });
  const addSession = (dayId: string) =>
    patchDay(dayId, {
      sessions: [
        ...(programme.days.find((day) => day.id === dayId)?.sessions ?? []),
        {
          id: `session-${crypto.randomUUID()}`,
          start: "10:00",
          end: "11:00",
          title: "New session",
          kind: "lesson",
          description: "",
        },
      ],
    });
  const removeDay = (dayId: string) =>
    patch({
      days: programme.days.filter((day) => day.id !== dayId),
      labs: programme.labs.filter((lab) => lab.dayId !== dayId),
    });
  const addLab = () => {
    const dayId = programme.days[0]?.id;
    if (!dayId) {
      toast.error("Add a programme day before creating a lab.");
      return;
    }
    patch({
      labs: [
        ...programme.labs,
        {
          id: `lab-${crypto.randomUUID()}`,
          title: "New lab configuration",
          dayId,
          instructions: ["Add lab instructions."],
          checklist: ["Add a validation step."],
        },
      ],
    });
  };
  const addAssessment = () =>
    patch({
      assessments: [
        ...programme.assessments,
        {
          id: `question-${crypto.randomUUID()}`,
          prompt: "New assessment question",
          options: ["Option A", "Option B", "Option C"],
          answer: 0,
        },
      ],
    });
  return (
    <div
      className="editor-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="programme-editor"
        role="dialog"
        aria-modal="true"
        aria-label="Programme configuration"
      >
        <header className="editor-header">
          <div>
            <div className="eyebrow">CONFIGURATION ENGINE</div>
            <h2>Programme configuration</h2>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close programme editor" onClick={onClose}>
            <X size={18} />
          </Button>
        </header>
        <div className="editor-body">
          <div className="editor-section">
            <div className="editor-section-title">
              <h3>Programme identity</h3>
              <span>CONFIGURATION DATA</span>
            </div>
            <div className="editor-fields">
              <Field label="Programme title">
                <Input
                  value={programme.title}
                  onChange={(event) => patch({ title: event.target.value })}
                />
              </Field>
              <Field label="Instructor">
                <Input
                  value={programme.instructor}
                  onChange={(event) => patch({ instructor: event.target.value })}
                />
              </Field>
              <Field label="Description">
                <Textarea
                  value={programme.description}
                  onChange={(event) => patch({ description: event.target.value })}
                />
              </Field>
              <Field label="Training location">
                <Input
                  value={programme.location}
                  onChange={(event) => patch({ location: event.target.value })}
                />
              </Field>
              <Field label="Duration label">
                <Input
                  value={programme.durationLabel}
                  onChange={(event) => patch({ durationLabel: event.target.value })}
                />
              </Field>
              <Field label="Capstone label">
                <Input
                  value={programme.capstoneTitle}
                  onChange={(event) => patch({ capstoneTitle: event.target.value })}
                />
              </Field>
              <Field label="Start date">
                <Input
                  type="date"
                  value={programme.startDate}
                  onChange={(event) => patch({ startDate: event.target.value })}
                />
              </Field>
              <Field label="End date">
                <Input
                  type="date"
                  value={programme.endDate}
                  onChange={(event) => patch({ endDate: event.target.value })}
                />
              </Field>
              <Field label="Initial dashboard progress">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={programme.initialProgress}
                  onChange={(event) => patch({ initialProgress: Number(event.target.value) })}
                />
              </Field>
              <Field label="Assessment pass score">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={programme.completionRules.passScore}
                  onChange={(event) =>
                    patch({
                      completionRules: {
                        ...programme.completionRules,
                        passScore: Number(event.target.value),
                      },
                    })
                  }
                />
              </Field>
            </div>
            <label className="publish-toggle">
              <input
                type="checkbox"
                checked={programme.published}
                onChange={(event) => patch({ published: event.target.checked })}
              />
              <span>
                <b>Published programme</b>
                <small>Allow this programme to be selected as an active configuration.</small>
              </span>
            </label>
          </div>
          <div className="editor-section">
            <div className="editor-section-title">
              <h3>Training days</h3>
              <Button variant="outline" size="sm" onClick={addDay}>
                <Plus size={14} />
                Add day
              </Button>
            </div>
            {programme.days.map((day, dayIndex) => (
              <div className="editor-day" key={day.id}>
                <div className="editor-day-head">
                  <strong>DAY {dayIndex + 1}</strong>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove day ${dayIndex + 1}`}
                    onClick={() => removeDay(day.id)}
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
                <Field label="Day title">
                  <Input
                    value={day.title}
                    onChange={(event) => patchDay(day.id, { title: event.target.value })}
                  />
                </Field>
                <Field label="Topics (one per line)">
                  <Textarea
                    value={day.topics.join("\n")}
                    onChange={(event) =>
                      patchDay(day.id, { topics: event.target.value.split("\n").filter(Boolean) })
                    }
                  />
                </Field>
                {day.sessions.map((item) => (
                  <div className="editor-session" key={item.id}>
                    <Input
                      aria-label="Session title"
                      value={item.title}
                      onChange={(event) =>
                        patchDay(day.id, {
                          sessions: day.sessions.map((session) =>
                            session.id === item.id
                              ? { ...session, title: event.target.value }
                              : session,
                          ),
                        })
                      }
                    />
                    <Input
                      aria-label="Session start time"
                      type="time"
                      value={item.start}
                      onChange={(event) =>
                        patchDay(day.id, {
                          sessions: day.sessions.map((session) =>
                            session.id === item.id
                              ? { ...session, start: event.target.value }
                              : session,
                          ),
                        })
                      }
                    />
                    <Input
                      aria-label="Session end time"
                      type="time"
                      value={item.end}
                      onChange={(event) =>
                        patchDay(day.id, {
                          sessions: day.sessions.map((session) =>
                            session.id === item.id
                              ? { ...session, end: event.target.value }
                              : session,
                          ),
                        })
                      }
                    />
                    <select
                      aria-label="Session type"
                      value={item.kind}
                      onChange={(event) =>
                        patchDay(day.id, {
                          sessions: day.sessions.map((session) =>
                            session.id === item.id
                              ? { ...session, kind: event.target.value as TrainingSession["kind"] }
                              : session,
                          ),
                        })
                      }
                    >
                      <option value="lesson">Lesson</option>
                      <option value="lab">Lab</option>
                      <option value="capstone">Capstone</option>
                      <option value="assessment">Assessment</option>
                    </select>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remove session"
                      onClick={() =>
                        patchDay(day.id, {
                          sessions: day.sessions.filter((session) => session.id !== item.id),
                        })
                      }
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
                <Button variant="ghost" size="sm" onClick={() => addSession(day.id)}>
                  <Plus size={14} />
                  Add session
                </Button>
              </div>
            ))}
            {programme.days.length === 0 && <EmptyState text="Add the first training day." />}
          </div>
          <div className="editor-section">
            <div className="editor-section-title">
              <h3>Labs</h3>
              <Button variant="outline" size="sm" onClick={addLab}>
                <Plus size={14} />
                Add lab
              </Button>
            </div>
            {programme.labs.map((lab) => (
              <div className="editor-compact-row" key={lab.id}>
                <Input
                  aria-label="Lab title"
                  value={lab.title}
                  onChange={(event) =>
                    patch({
                      labs: programme.labs.map((item) =>
                        item.id === lab.id ? { ...item, title: event.target.value } : item,
                      ),
                    })
                  }
                />
                <select
                  aria-label="Lab training day"
                  value={lab.dayId}
                  onChange={(event) =>
                    patch({
                      labs: programme.labs.map((item) =>
                        item.id === lab.id ? { ...item, dayId: event.target.value } : item,
                      ),
                    })
                  }
                >
                  {programme.days.map((day, index) => (
                    <option key={day.id} value={day.id}>
                      Day {index + 1} · {day.title}
                    </option>
                  ))}
                </select>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove lab"
                  onClick={() =>
                    patch({ labs: programme.labs.filter((item) => item.id !== lab.id) })
                  }
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
          <div className="editor-section">
            <div className="editor-section-title">
              <h3>Assessment questions</h3>
              <Button variant="outline" size="sm" onClick={addAssessment}>
                <Plus size={14} />
                Add question
              </Button>
            </div>
            {programme.assessments.map((question) => (
              <div className="editor-question" key={question.id}>
                <Input
                  aria-label="Question prompt"
                  value={question.prompt}
                  onChange={(event) =>
                    patch({
                      assessments: programme.assessments.map((item) =>
                        item.id === question.id ? { ...item, prompt: event.target.value } : item,
                      ),
                    })
                  }
                />
                <div className="editor-question-options">
                  {question.options.map((option, index) => (
                    <Input
                      key={`${question.id}-${index}`}
                      aria-label={`Answer option ${index + 1}`}
                      value={option}
                      onChange={(event) =>
                        patch({
                          assessments: programme.assessments.map((item) =>
                            item.id === question.id
                              ? {
                                  ...item,
                                  options: item.options.map((entry, optionIndex) =>
                                    optionIndex === index ? event.target.value : entry,
                                  ),
                                }
                              : item,
                          ),
                        })
                      }
                    />
                  ))}
                </div>
                <label className="correct-answer">
                  Correct answer
                  <select
                    value={question.answer}
                    onChange={(event) =>
                      patch({
                        assessments: programme.assessments.map((item) =>
                          item.id === question.id
                            ? { ...item, answer: Number(event.target.value) }
                            : item,
                        ),
                      })
                    }
                  >
                    {question.options.map((option, index) => (
                      <option key={option} value={index}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove assessment question"
                    onClick={() =>
                      patch({
                        assessments: programme.assessments.filter(
                          (item) => item.id !== question.id,
                        ),
                      })
                    }
                  >
                    <Trash2 size={14} />
                  </Button>
                </label>
              </div>
            ))}
          </div>
        </div>
        <footer className="editor-footer">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(programme)}>
            <Save size={15} />
            Save configuration
          </Button>
        </footer>
      </section>
    </div>
  );
}

export default ShadowXLabApp;
