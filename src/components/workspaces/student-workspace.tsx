import React, { useState } from "react";
import {
  Play,
  CheckCircle2,
  Clock,
  Award,
  BookOpen,
  CalendarDays,
  Activity,
  Shield,
  Layers,
  ArrowRight,
  FlaskConical,
  Radio,
  ClipboardCheck,
  FileJson2,
  MonitorCheck,
  ExternalLink,
  ChevronRight,
  Check,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type {
  ProgrammeConfig,
  TrainingDay,
  TrainingSession,
  TrainingState,
} from "@/lib/training-platform";
import { calculateProgress, countSessions, dateRangeLabel } from "@/lib/training-platform";
import { UniversalSessionEngine } from "@/components/session-engine/universal-session-engine";
import { UnifiedCyberRange } from "@/components/cyber-range/unified-cyber-range";
import { Day1ScheduleAccordion } from "@/components/day1/day1-schedule-accordion";
import { ConceptLearningPanel } from "@/components/day1/concept-learning-panel";
import { Day1Labs } from "@/components/day1/day1-labs";
import { Day1Assessments } from "@/components/day1/day1-assessments";
import { DAY1_CONCEPTS, type Day1Concept } from "@/lib/day1-curriculum";
import { Day2ScheduleAccordion } from "@/components/day2/day2-schedule-accordion";
import { Day2Labs } from "@/components/day2/day2-labs";
import { Day2Assessments } from "@/components/day2/day2-assessments";
import { Day2TopologyCanvas } from "@/components/day2/day2-topology-canvas";
import { DAY2_CONCEPTS, type Day2Concept } from "@/lib/day2-curriculum";
import type { LabMode, StandardLabVerificationState } from "@/lib/lab-readiness-types";
import heroBannerImg from "@/assets/shadowxlab-cyber-range.jpg";

interface StudentWorkspaceProps {
  state: TrainingState;
  programme: ProgrammeConfig;
  activeNavId: string;
  onSelectNav: (navId: string) => void;
  onToggleSessionComplete: (sessionId: string) => void;
  onToggleConceptComplete: (conceptId: string) => void;
  onSaveLabScore: (labId: string, score: number) => void;
  onSaveSessionAssessmentScore: (sessionId: string, score: number) => void;
  onSaveFinalScore: (score: number) => void;
  onSelectLabMode: (mode: LabMode) => void;
  onUpdateVerification?: (update: Partial<StandardLabVerificationState>) => void;
  onOpenReadiness: () => void;
}

export function StudentWorkspace({
  state,
  programme,
  activeNavId,
  onSelectNav,
  onToggleSessionComplete,
  onToggleConceptComplete,
  onSaveLabScore,
  onSaveSessionAssessmentScore,
  onSaveFinalScore,
  onSelectLabMode,
  onUpdateVerification,
  onOpenReadiness,
}: StudentWorkspaceProps) {
  // Active session in Universal Engine (if open)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Active Day tab for multi-day views (defaults to Day 2 for Tuesday 17 Nov 2026)
  const [selectedDayTab, setSelectedDayTab] = useState<"day-1" | "day-2">("day-2");

  // Active Concept in Concept Explorer
  const [activeConceptId, setActiveConceptId] = useState<string>("concept-01");

  // Determine current active / next session
  const allSessions: (TrainingSession & { dayIndex: number; dayId: string; dayTitle: string })[] =
    programme.days.flatMap((day, dayIndex) =>
      day.sessions.map((s) => ({
        ...s,
        dayIndex,
        dayId: day.id,
        dayTitle: day.title,
      })),
    );

  const nextSession =
    allSessions.find((s) => !state.completedSessionIds.includes(s.id)) ?? allSessions[0]!;

  const completedCount = state.completedSessionIds.length;
  const totalSessions = countSessions(programme);
  const progressPercent = calculateProgress(state.completedSessionIds, programme);
  const loggedContactHours = (completedCount * 1.5).toFixed(1);

  // Currently viewing session in Universal Engine
  const currentEngineSession = activeSessionId
    ? allSessions.find((s) => s.id === activeSessionId)
    : null;

  // Render Universal Session Engine if active session is selected
  if (currentEngineSession) {
    return (
      <UniversalSessionEngine
        session={currentEngineSession}
        dayIndex={currentEngineSession.dayIndex}
        programme={programme}
        state={state}
        onSessionComplete={(id) => {
          onToggleSessionComplete(id);
          setActiveSessionId(null);
        }}
        onNavigateToSchedule={() => setActiveSessionId(null)}
        onOpenCyberRange={() => {
          setActiveSessionId(null);
          onSelectNav("cyber-range");
        }}
        onSaveLabScore={onSaveLabScore}
        onSaveSessionAssessmentScore={onSaveSessionAssessmentScore}
      />
    );
  }

  return (
    <div className="student-workspace space-y-6 max-w-7xl mx-auto pb-12">
      {/* VIEW: MY LEARNING (STUDENT LANDING PAGE) */}
      {activeNavId === "my-learning" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Hero Banner: Enrolled Programme & Prominent Continue Learning Action */}
          <div className="relative overflow-hidden rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-card via-card to-cyan-950/40 p-6 md:p-8 shadow-2xl">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="border-cyan-500/50 bg-cyan-950/40 text-cyan-300 font-mono text-xs font-bold">
                    ENGINEERING STAFF COLLEGE OF INDIA (ESCI)
                  </Badge>
                  <Badge variant="outline" className="border-emerald-500/50 bg-emerald-950/40 text-emerald-300 font-mono text-xs">
                    Tuesday, 17 November 2026 • Day 2
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    5 Days • 30 Contact Hours • {programme.location}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {programme.title}
                </h1>
                <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  {programme.description} Faculty: <strong className="text-cyan-300">Mr. Naveen Kumar</strong>
                </p>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-muted-foreground">
                  <span className="text-cyan-400 font-semibold">Pilot Subnets:</span>
                  <span>WAN: 10.231.10.0/24</span>
                  <span>•</span>
                  <span>LAN: 10.231.20.0/24</span>
                  <span>•</span>
                  <span>DMZ: 10.231.30.0/24</span>
                </div>

                {/* Progress Bar & KPI Chips */}
                <div className="pt-2 space-y-2 max-w-xl">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-muted-foreground">Course Completion:</span>
                    <span className="text-cyan-400 font-bold">{progressPercent}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-900 border border-border/80 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_12px_#00e5ff] transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span>{completedCount} of {totalSessions} Sessions Completed</span>
                    <span>{loggedContactHours} / 30.0 Contact Hours</span>
                  </div>
                </div>
              </div>

              {/* Prominent Continue Learning Card */}
              <div className="lg:col-span-1 rounded-xl border border-cyan-500/50 bg-cyan-950/30 p-5 shadow-[0_0_20px_rgba(0,229,255,0.12)] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                    NEXT UP ON YOUR SCHEDULE
                  </span>
                  <Badge className="bg-cyan-500 text-slate-950 font-mono text-[10px] font-bold">
                    DAY {nextSession.dayIndex + 1}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground line-clamp-2">
                    {nextSession.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-xs font-mono text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-cyan-400" />
                    <span>{nextSession.start} – {nextSession.end} ({nextSession.kind})</span>
                  </div>
                </div>

                <Button
                  onClick={() => setActiveSessionId(nextSession.id)}
                  className="w-full gap-2 bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold text-sm h-11 shadow-[0_0_20px_rgba(0,229,255,0.35)]"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>CONTINUE LEARNING</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 border-border/80 bg-card/60">
              <span className="font-mono text-[10px] text-muted-foreground uppercase font-bold">ACTIVE DAY</span>
              <div className="text-lg font-bold text-foreground mt-1">Day {nextSession.dayIndex + 1}</div>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">{nextSession.dayTitle}</p>
            </Card>

            <Card className="p-4 border-border/80 bg-card/60">
              <span className="font-mono text-[10px] text-muted-foreground uppercase font-bold">NEXT ASSESSMENT</span>
              <div className="text-lg font-bold text-cyan-400 mt-1">Session {nextSession.id.toUpperCase()}</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Knowledge check pending</p>
            </Card>

            <Card className="p-4 border-border/80 bg-card/60">
              <span className="font-mono text-[10px] text-muted-foreground uppercase font-bold">CYBER RANGE</span>
              <div className="text-lg font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ONLINE</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">pfSense 2.7.2 Ready</p>
            </Card>

            <Card className="p-4 border-border/80 bg-card/60">
              <span className="font-mono text-[10px] text-muted-foreground uppercase font-bold">LAB TROUBLESHOOTING</span>
              <div className="text-lg font-bold text-foreground mt-1">Zero Blocker</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Browser simulation active</p>
            </Card>
          </div>

          {/* Today's Agenda & Quick Access */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Session Roadmap */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-cyan-400" />
                  <span>Curriculum Journey (5 Days / 20 Sessions)</span>
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectNav("sessions")}
                  className="text-xs text-cyan-400 hover:text-cyan-300 gap-1"
                >
                  <span>View Full Schedule</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="space-y-2">
                {allSessions.slice(0, 6).map((session, sIdx) => {
                  const isDone = state.completedSessionIds.includes(session.id);
                  const isNext = session.id === nextSession.id;

                  return (
                    <div
                      key={session.id}
                      className={`flex items-center justify-between p-3.5 rounded-lg border transition-all ${
                        isNext
                          ? "border-cyan-500 bg-cyan-500/10 shadow-[0_0_12px_rgba(0,229,255,0.08)]"
                          : isDone
                            ? "border-emerald-500/30 bg-card/40"
                            : "border-border/60 bg-card/30"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold ${
                            isDone
                              ? "bg-emerald-500 text-slate-950"
                              : isNext
                                ? "bg-cyan-400 text-slate-950 shadow-[0_0_8px_#00e5ff]"
                                : "bg-card text-muted-foreground border border-border"
                          }`}
                        >
                          {isDone ? <Check className="h-4 w-4 stroke-[3]" /> : sIdx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-foreground truncate">
                            {session.title}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            Day {session.dayIndex + 1} • {session.start} – {session.end} • {session.kind}
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant={isNext ? "default" : "outline"}
                        onClick={() => setActiveSessionId(session.id)}
                        className={`text-xs h-7 px-3 shrink-0 ${
                          isNext ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-semibold" : ""
                        }`}
                      >
                        {isDone ? "Review" : isNext ? "Start" : "Open"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Cyber Range Link & Competency Radar */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="p-5 border-cyan-500/30 bg-gradient-to-br from-card to-cyan-950/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
                    <Radio className="h-4 w-4 animate-pulse" />
                    <span>CYBER RANGE SHORTCUT</span>
                  </div>
                  <Badge variant="outline" className="border-cyan-500/40 text-cyan-300 text-[10px]">
                    7 Nodes Live
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Open the live packet journey simulator and inspect state table entries, firewall rules, and syslog telemetry.
                </p>
                <Button
                  onClick={() => onSelectNav("cyber-range")}
                  className="w-full gap-2 bg-card border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 text-xs h-9 font-semibold"
                >
                  <span>Launch Cyber Range</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Card>

              <Card className="p-5 border-border/80 bg-card/60 space-y-3">
                <div className="font-mono text-xs font-bold uppercase text-muted-foreground">
                  Competency Mastery Status
                </div>
                <div className="space-y-2 text-xs">
                  {[
                    { domain: "Threat & Attack Surface Analysis", mastery: 90 },
                    { domain: "Stateful Packet Inspection", mastery: 85 },
                    { domain: "pfSense Firewall Rules & NAT", mastery: 65 },
                    { domain: "Site-to-Site & Remote VPN", mastery: 40 },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-foreground">{item.domain}</span>
                        <span className="text-cyan-400 font-mono">{item.mastery}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${item.mastery}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: MY PROGRAMMES */}
      {activeNavId === "programmes" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-border/80 pb-4">
            <h1 className="text-2xl font-bold text-foreground">My Enrolled Programmes</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Authoritative curriculum catalog and active training enrollments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border-cyan-500/40 bg-card/70 space-y-4">
              <div className="flex items-center justify-between">
                <Badge className="bg-cyan-500 text-slate-950 font-mono text-xs font-bold">
                  ACTIVE ENROLLMENT
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {programme.durationLabel}
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground">{programme.title}</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {programme.description}
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs border-t border-border/80 pt-4 font-mono">
                <div>
                  <span className="text-muted-foreground">INSTRUCTOR:</span>
                  <div className="font-semibold text-foreground mt-0.5">{programme.instructor}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">LOCATION:</span>
                  <div className="font-semibold text-foreground mt-0.5">{programme.location}</div>
                </div>
              </div>
              <div className="pt-2">
                <Button
                  onClick={() => onSelectNav("sessions")}
                  className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-semibold text-xs"
                >
                  View Course Schedule
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* VIEW: LEARNING SESSIONS (SCHEDULE) */}
      {activeNavId === "sessions" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-border/80 pb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Learning Sessions Schedule</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Preserved 5-Day / 20-Session Table of Contents (30 Contact Hours) • ESCI Hyderabad
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-border/70 bg-card/60 p-0.5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setSelectedDayTab("day-2")}
                  className={`px-3 py-1 rounded-md transition-all ${
                    selectedDayTab === "day-2"
                      ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(0,229,255,0.3)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Day 2 (Today)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDayTab("day-1")}
                  className={`px-3 py-1 rounded-md transition-all ${
                    selectedDayTab === "day-1"
                      ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(0,229,255,0.3)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Day 1
                </button>
              </div>
              <Badge variant="outline" className="border-cyan-500/40 text-cyan-300 font-mono text-xs">
                {progressPercent}% COMPLETE
              </Badge>
            </div>
          </div>

          {selectedDayTab === "day-2" ? (
            <Day2ScheduleAccordion
              completedSessionIds={state.completedSessionIds}
              completedConceptIds={state.day2CompletedConceptIds ?? []}
              sessionScores={state.day2SessionAssessmentScores ?? {}}
              labScores={state.day2LabScores ?? {}}
              onToggleSessionComplete={onToggleSessionComplete}
              onToggleConceptComplete={onToggleConceptComplete}
              onSelectConcept={(cId) => {
                setActiveConceptId(cId);
                onSelectNav("concepts");
              }}
              onOpenLab={() => onSelectNav("labs")}
              onOpenSessionAssessment={(sId) => setActiveSessionId(sId)}
              onStartSession={(sId) => setActiveSessionId(sId)}
            />
          ) : (
            <Day1ScheduleAccordion
              completedSessionIds={state.completedSessionIds}
              completedConceptIds={state.day1CompletedConceptIds ?? []}
              sessionScores={state.day1SessionAssessmentScores ?? {}}
              labScores={state.day1LabScores ?? {}}
              onToggleSessionComplete={onToggleSessionComplete}
              onToggleConceptComplete={onToggleConceptComplete}
              onSelectConcept={(cId) => {
                setActiveConceptId(cId);
                onSelectNav("concepts");
              }}
              onOpenLab={() => onSelectNav("labs")}
              onOpenSessionAssessment={(sId) => setActiveSessionId(sId)}
            />
          )}
        </div>
      )}

      {/* VIEW: CONCEPTS EXPLORER */}
      {activeNavId === "concepts" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-border/80 pb-4">
            <h1 className="text-2xl font-bold text-foreground">Concepts Explorer</h1>
            <p className="text-xs text-muted-foreground mt-1">
              In-depth technical explanations, architecture diagrams, and knowledge checks.
            </p>
          </div>

          <ConceptLearningPanel
            conceptId={activeConceptId}
            completedConceptIds={state.day1CompletedConceptIds ?? []}
            onToggleComplete={onToggleConceptComplete}
            onSelectConcept={setActiveConceptId}
            onOpenLab={() => onSelectNav("labs")}
            onBackToSchedule={() => onSelectNav("sessions")}
          />
        </div>
      )}

      {/* VIEW: PRACTICAL LABS */}
      {activeNavId === "labs" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-border/80 pb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Practical Labs Engine</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Guided network experiments, packet filters, and configuration testing.
              </p>
            </div>
            <div className="flex rounded-lg border border-border/70 bg-card/60 p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setSelectedDayTab("day-2")}
                className={`px-3 py-1 rounded-md transition-all ${
                  selectedDayTab === "day-2"
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(0,229,255,0.3)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Day 2 Labs (Active)
              </button>
              <button
                type="button"
                onClick={() => setSelectedDayTab("day-1")}
                className={`px-3 py-1 rounded-md transition-all ${
                  selectedDayTab === "day-1"
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(0,229,255,0.3)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Day 1 Labs
              </button>
            </div>
          </div>

          {selectedDayTab === "day-2" ? (
            <Day2Labs
              labScores={state.day2LabScores ?? {}}
              onSaveLabScore={onSaveLabScore}
              onNavigateToSchedule={() => onSelectNav("sessions")}
            />
          ) : (
            <Day1Labs
              labScores={state.day1LabScores ?? {}}
              onSaveLabScore={onSaveLabScore}
              onNavigateToSchedule={() => onSelectNav("sessions")}
            />
          )}
        </div>
      )}

      {/* VIEW: CYBER RANGE */}
      {activeNavId === "cyber-range" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex rounded-lg border border-border/70 bg-card/60 p-1 text-xs font-mono max-w-md">
            <button
              type="button"
              onClick={() => setSelectedDayTab("day-2")}
              className={`flex-1 py-1.5 px-3 rounded-md transition-all text-center ${
                selectedDayTab === "day-2"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(0,229,255,0.25)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Day 2 Pilot Topology (10.231.x.x)
            </button>
            <button
              type="button"
              onClick={() => setSelectedDayTab("day-1")}
              className={`flex-1 py-1.5 px-3 rounded-md transition-all text-center ${
                selectedDayTab === "day-1"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(0,229,255,0.25)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Full Multi-Node Cyber Range
            </button>
          </div>

          {selectedDayTab === "day-2" ? (
            <Day2TopologyCanvas />
          ) : (
            <UnifiedCyberRange
              selectedLabMode={state.selectedLabMode ?? "simulation"}
              onSelectLabMode={onSelectLabMode}
              standardLabVerification={state.standardLabVerification}
              onUpdateVerification={onUpdateVerification}
            />
          )}
        </div>
      )}

      {/* VIEW: ASSESSMENTS */}
      {activeNavId === "assessments" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-border/80 pb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Competency Assessments</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Transparent knowledge checks, log interpretations, and final examinations.
              </p>
            </div>
            <div className="flex rounded-lg border border-border/70 bg-card/60 p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setSelectedDayTab("day-2")}
                className={`px-3 py-1 rounded-md transition-all ${
                  selectedDayTab === "day-2"
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(0,229,255,0.3)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Day 2 Assessments (Active)
              </button>
              <button
                type="button"
                onClick={() => setSelectedDayTab("day-1")}
                className={`px-3 py-1 rounded-md transition-all ${
                  selectedDayTab === "day-1"
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(0,229,255,0.3)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Day 1 Assessments
              </button>
            </div>
          </div>

          {selectedDayTab === "day-2" ? (
            <Day2Assessments
              sessionScores={state.day2SessionAssessmentScores ?? {}}
              finalScore={state.day2FinalAssessmentScore ?? null}
              onSaveSessionScore={onSaveSessionAssessmentScore}
              onSaveFinalScore={onSaveFinalScore}
              onNavigateToSchedule={() => onSelectNav("sessions")}
            />
          ) : (
            <Day1Assessments
              sessionScores={state.day1SessionAssessmentScores ?? {}}
              finalScore={state.day1FinalAssessmentScore ?? null}
              onSaveSessionScore={onSaveSessionAssessmentScore}
              onSaveFinalScore={onSaveFinalScore}
              onNavigateToSchedule={() => onSelectNav("sessions")}
            />
          )}
        </div>
      )}

      {/* VIEW: MY PROGRESS */}
      {activeNavId === "progress" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-border/80 pb-4">
            <h1 className="text-2xl font-bold text-foreground">My Learning Progress & Competency</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Detailed tracking of completed sessions, contact hours, and learning gaps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-cyan-500/40 bg-card/70 text-center space-y-3">
              <span className="font-mono text-xs text-muted-foreground uppercase font-bold">
                COMPLETION SCORE
              </span>
              <div className="text-4xl font-extrabold text-cyan-400 font-mono">
                {progressPercent}%
              </div>
              <p className="text-xs text-muted-foreground">
                {completedCount} of {totalSessions} sessions logged
              </p>
            </Card>

            <Card className="p-6 border-emerald-500/40 bg-card/70 text-center space-y-3">
              <span className="font-mono text-xs text-muted-foreground uppercase font-bold">
                CONTACT HOURS LOGGED
              </span>
              <div className="text-4xl font-extrabold text-emerald-400 font-mono">
                {loggedContactHours}
              </div>
              <p className="text-xs text-muted-foreground">out of 30.0 total contact hours</p>
            </Card>

            <Card className="p-6 border-border/80 bg-card/70 text-center space-y-3">
              <span className="font-mono text-xs text-muted-foreground uppercase font-bold">
                LAB VERIFICATION
              </span>
              <div className="text-4xl font-extrabold text-foreground font-mono">
                {Object.keys(state.day1LabScores ?? {}).length}
              </div>
              <p className="text-xs text-muted-foreground">labs successfully evaluated</p>
            </Card>
          </div>
        </div>
      )}

      {/* VIEW: RESOURCES */}
      {activeNavId === "resources" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-border/80 pb-4">
            <h1 className="text-2xl font-bold text-foreground">Learning Resources & Reference Guides</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Command cheat sheets, network diagrams, and enterprise standard references.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                id: "res-1",
                title: "NPLRA Network Architecture Specification",
                kind: "Topology & Zone Architecture Reference",
                size: "2.4 MB Reference",
                url: "https://sxl-net.shadowxlab.com",
                badge: "LOCAL REF",
              },
              {
                id: "res-2",
                title: "pfSense 2.7.2 Administration Cheat Sheet",
                kind: "Firewall & NAT Quick Reference",
                size: "840 KB Guide",
                url: "https://docs.netgate.com/pfsense/en/latest/",
                badge: "MANUAL",
              },
              {
                id: "res-3",
                title: "Stateful TCP Connection Inspection Guide",
                kind: "Technical Whitepaper & RFC 9293 Mechanics",
                size: "1.1 MB Whitepaper",
                url: "https://datatracker.ietf.org/doc/html/rfc9293",
                badge: "WHITEPAPER",
              },
              {
                id: "res-4",
                title: "Zero-Troubleshooting Range Diagnostics Runbook",
                kind: "Hardware Diagnostics & Recovery Manual",
                size: "650 KB Operations",
                url: "https://sxl-net.shadowxlab.com",
                badge: "RUNBOOK",
              },
              {
                id: "res-5",
                title: "NIST SP 800-41 Rev. 1: Guidelines on Firewalls",
                kind: "Firewall Policy & Defense-in-Depth Standard",
                size: "NIST Federal Standard",
                url: "https://csrc.nist.gov/pubs/sp/800/41/r1/final",
                badge: "NIST STANDARD",
              },
              {
                id: "res-6",
                title: "NIST SP 800-77 Rev. 1: Guide to IPsec VPNs",
                kind: "Cryptographic Tunnel Architecture Standard",
                size: "NIST Federal Standard",
                url: "https://csrc.nist.gov/pubs/sp/800/77/r1/final",
                badge: "NIST STANDARD",
              },
              {
                id: "res-7",
                title: "NIST SP 800-207: Zero Trust Architecture",
                kind: "Perimeter Isolation & Microsegmentation Model",
                size: "NIST Federal Standard",
                url: "https://csrc.nist.gov/pubs/sp/800/207/final",
                badge: "NIST STANDARD",
              },
              {
                id: "res-8",
                title: "RFC 7296: Internet Key Exchange Protocol (IKEv2)",
                kind: "IETF Core Protocol Specification",
                size: "IETF Protocol RFC",
                url: "https://datatracker.ietf.org/doc/html/rfc7296",
                badge: "IETF RFC",
              },
              {
                id: "res-9",
                title: "RFC 4301 / RFC 8446: IPsec Architecture & TLS 1.3",
                kind: "IP Security & Transport Layer Security Standards",
                size: "IETF Protocol RFCs",
                url: "https://datatracker.ietf.org/doc/html/rfc4301",
                badge: "IETF RFC",
              },
            ].map((res) => (
              <Card key={res.id} className="p-4 border-border/80 bg-card/60 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] font-bold text-cyan-400 uppercase tracking-wider">
                      {res.badge}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">{res.size}</span>
                  </div>
                  <h3 className="text-xs font-semibold text-foreground line-clamp-2">{res.title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{res.kind}</p>
                </div>
                <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-muted-foreground/80 truncate max-w-[150px]">
                    {res.url.replace("https://", "")}
                  </span>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    <span>Open Standard</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: LAB READINESS & PROFILE */}
      {activeNavId === "readiness" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-border/80 pb-4">
            <h1 className="text-2xl font-bold text-foreground">Profile & Lab Execution Diagnostics</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Validate hardware capabilities, hypervisor bindings, or select zero-troubleshooting browser mode.
            </p>
          </div>

          <UnifiedCyberRange
            selectedLabMode={state.selectedLabMode ?? "simulation"}
            onSelectLabMode={onSelectLabMode}
            standardLabVerification={state.standardLabVerification}
            onUpdateVerification={onUpdateVerification}
          />
        </div>
      )}
    </div>
  );
}
