import React, { useState } from "react";
import {
  Shield,
  BookOpen,
  Layers,
  Presentation,
  FlaskConical,
  Crosshair,
  ClipboardCheck,
  Award,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Terminal,
  Activity,
  Check,
  RotateCcw,
  ExternalLink,
  Info,
  Server,
  Lock,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TrainingSession, ProgrammeConfig, TrainingState } from "@/lib/training-platform";
import {
  getConceptsForSession,
  getSessionAssessment,
  type Day1Concept,
  type AssessmentQuestion,
} from "@/lib/day1-curriculum";
import PacketJourneySimulator from "@/components/day1/packet-journey-simulator";

export type SessionStageNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface UniversalSessionEngineProps {
  session: TrainingSession;
  dayIndex: number;
  programme: ProgrammeConfig;
  state: TrainingState;
  onSessionComplete: (sessionId: string) => void;
  onNavigateToSchedule: () => void;
  onOpenCyberRange?: () => void;
}

export function UniversalSessionEngine({
  session,
  dayIndex,
  programme,
  state,
  onSessionComplete,
  onNavigateToSchedule,
  onOpenCyberRange,
}: UniversalSessionEngineProps) {
  const [currentStage, setCurrentStage] = useState<SessionStageNumber>(1);
  const [completedStages, setCompletedStages] = useState<Record<number, boolean>>({});

  // Stage 2 Concept selection
  const sessionConcepts: Day1Concept[] = getConceptsForSession(session.id);
  const [selectedConceptIndex, setSelectedConceptIndex] = useState<number>(0);
  const activeConcept: Day1Concept | undefined = sessionConcepts[selectedConceptIndex];

  // Stage 5 Guided Practical completion checklist
  const [practicalChecklist, setPracticalChecklist] = useState<Record<string, boolean>>({});

  // Stage 6 Independent Mission evidence & notes
  const [missionEvidence, setMissionEvidence] = useState<string>("");
  const [missionSubmitted, setMissionSubmitted] = useState<boolean>(false);

  // Stage 7 Assessment answers
  const assessmentQuestions: AssessmentQuestion[] = getSessionAssessment(session.id);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, number>>({});
  const [assessmentSubmitted, setAssessmentSubmitted] = useState<boolean>(false);
  const [assessmentScore, setAssessmentScore] = useState<number | null>(
    state.day1SessionAssessmentScores?.[session.id] ?? null,
  );

  const stages: { number: SessionStageNumber; name: string; icon: React.ElementType }[] = [
    { number: 1, name: "Briefing", icon: Shield },
    { number: 2, name: "Concepts", icon: BookOpen },
    { number: 3, name: "Architecture", icon: Layers },
    { number: 4, name: "Instructor Demo", icon: Presentation },
    { number: 5, name: "Guided Practical", icon: FlaskConical },
    { number: 6, name: "Mission", icon: Crosshair },
    { number: 7, name: "Assessment", icon: ClipboardCheck },
    { number: 8, name: "Summary", icon: Award },
  ];

  const markStageDone = (stageNum: number) => {
    setCompletedStages((prev) => ({ ...prev, [stageNum]: true }));
  };

  const handleNextStage = () => {
    markStageDone(currentStage);
    if (currentStage < 8) {
      setCurrentStage((prev) => (prev + 1) as SessionStageNumber);
    }
  };

  const handlePrevStage = () => {
    if (currentStage > 1) {
      setCurrentStage((prev) => (prev - 1) as SessionStageNumber);
    }
  };

  const handleTogglePracticalCheck = (key: string) => {
    setPracticalChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGradeAssessment = () => {
    let correct = 0;
    assessmentQuestions.forEach((q) => {
      if (assessmentAnswers[q.id] === q.correctAnswer) {
        correct += 1;
      }
    });
    const calculated =
      assessmentQuestions.length > 0
        ? Math.round((correct / assessmentQuestions.length) * 100)
        : 85;
    setAssessmentScore(calculated);
    setAssessmentSubmitted(true);
    markStageDone(7);
  };

  const handleFinishSession = () => {
    markStageDone(8);
    onSessionComplete(session.id);
  };

  const isSessionAlreadyCompleted = state.completedSessionIds.includes(session.id);

  return (
    <div className="universal-session-engine space-y-6 max-w-6xl mx-auto pb-12">
      {/* Session Breadcrumb & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToSchedule}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Schedule</span>
          </Button>
          <span className="text-muted-foreground/60">•</span>
          <Badge variant="outline" className="font-mono text-xs text-cyan-400 border-cyan-500/40">
            DAY {dayIndex + 1} • SESSION {session.id.toUpperCase()}
          </Badge>
          <span className="text-xs font-semibold text-foreground line-clamp-1 max-w-[360px]">
            {session.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isSessionAlreadyCompleted && (
            <Badge className="bg-emerald-950/60 text-emerald-300 border-emerald-500/40 text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
          <span className="font-mono text-xs text-muted-foreground">
            {session.start} – {session.end} ({session.kind.toUpperCase()})
          </span>
        </div>
      </div>

      {/* 8-Stage Interactive Pedagogical Stepper */}
      <div className="rounded-xl border border-border/80 bg-card/60 p-3 shadow-lg">
        <div className="flex items-center justify-between overflow-x-auto gap-2 pb-1">
          {stages.map((stage) => {
            const Icon = stage.icon;
            const isCurrent = currentStage === stage.number;
            const isDone = completedStages[stage.number];

            return (
              <button
                key={stage.number}
                type="button"
                onClick={() => setCurrentStage(stage.number)}
                className={`flex flex-1 min-w-[105px] items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-all ${
                  isCurrent
                    ? "border-cyan-500 bg-cyan-500/15 text-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.15)]"
                    : isDone
                      ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-400"
                      : "border-border/60 bg-card/30 text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-bold ${
                    isCurrent
                      ? "bg-cyan-400 text-slate-950 shadow-[0_0_8px_#00e5ff]"
                      : isDone
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-card text-muted-foreground border border-border"
                  }`}
                >
                  {isDone ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : stage.number}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    Stage {stage.number}
                  </div>
                  <div className="text-xs font-semibold truncate">{stage.name}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STAGE 1: MISSION BRIEFING */}
      {currentStage === 1 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card className="p-6 border-cyan-500/30 bg-gradient-to-br from-card via-card to-cyan-950/20">
            <div className="flex items-center gap-3 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-2">
              <Shield className="h-4 w-4" />
              <span>Operational Briefing & Threat Context</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">{session.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {session.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border/80 pt-6">
              <div className="rounded-lg border border-border/60 bg-card/40 p-4">
                <span className="font-mono text-[10px] font-bold uppercase text-cyan-400">
                  ENTERPRISE SCENARIO
                </span>
                <p className="mt-1 text-xs text-foreground font-medium">
                  National Public Land Records Agency (NPLRA) Government Network
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Securing government records, database servers, and multi-zone citizen services.
                </p>
              </div>

              <div className="rounded-lg border border-border/60 bg-card/40 p-4">
                <span className="font-mono text-[10px] font-bold uppercase text-cyan-400">
                  LEARNING GOALS
                </span>
                <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-cyan-400 shrink-0" />
                    <span>Understand security perimeter enforcement</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-cyan-400 shrink-0" />
                    <span>Analyze stateful protocol inspections</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-cyan-400 shrink-0" />
                    <span>Validate rule changes without packet loss</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-border/60 bg-card/40 p-4">
                <span className="font-mono text-[10px] font-bold uppercase text-cyan-400">
                  EXECUTION MODE
                </span>
                <p className="mt-1 text-xs text-foreground font-medium">
                  Zero Infrastructure Troubleshooting
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Browser-based high-fidelity simulation. No hypervisor configuration required.
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                onClick={handleNextStage}
                className="gap-2 bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-semibold shadow-[0_0_15px_rgba(0,229,255,0.25)]"
              >
                <span>Proceed to Concepts</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* STAGE 2: CONCEPT LEARNING */}
      {currentStage === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {sessionConcepts.length > 0 && activeConcept ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Concept Picker */}
              <div className="lg:col-span-1 space-y-2">
                <div className="font-mono text-xs font-bold uppercase text-cyan-400 mb-2">
                  Session Concepts ({sessionConcepts.length})
                </div>
                <div className="space-y-1">
                  {sessionConcepts.map((concept, idx) => (
                    <button
                      key={concept.id}
                      onClick={() => setSelectedConceptIndex(idx)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                        selectedConceptIndex === idx
                          ? "border-cyan-500 bg-cyan-500/10 text-cyan-300 font-semibold shadow-[0_0_10px_rgba(0,229,255,0.1)]"
                          : "border-border/60 bg-card/40 text-muted-foreground hover:bg-card/70 hover:text-foreground"
                      }`}
                    >
                      <div className="font-mono text-[10px] text-cyan-400">
                        CONCEPT {String(concept.number).padStart(2, "0")}
                      </div>
                      <div className="line-clamp-2 mt-0.5">{concept.title}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Concept In-Depth Detail */}
              <div className="lg:col-span-3 space-y-5">
                <Card className="p-6 border-border/80 bg-card/70 space-y-5">
                  <div className="flex items-center justify-between border-b border-border/80 pb-3">
                    <div>
                      <span className="font-mono text-xs text-cyan-400 font-bold uppercase">
                        CONCEPT {activeConcept.number} • {activeConcept.durationMinutes} MINUTES
                      </span>
                      <h3 className="text-xl font-bold text-foreground mt-1">
                        {activeConcept.title}
                      </h3>
                    </div>
                  </div>

                  {/* Why It Matters Callout */}
                  <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 font-mono uppercase">
                      <Info className="h-4 w-4" />
                      <span>Why This Matters in Cybersecurity</span>
                    </div>
                    <p className="mt-1 text-xs text-cyan-200/90 leading-relaxed">
                      {activeConcept.securityEngineeringRelevance}
                    </p>
                  </div>

                  {/* Technical Explanation */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono font-bold uppercase text-muted-foreground">
                      Technical Explanation & Mechanism
                    </h4>
                    <p className="text-sm text-foreground/90 leading-relaxed bg-card/40 p-4 rounded-lg border border-border/60">
                      {activeConcept.technicalExplanation}
                    </p>
                  </div>

                  {/* Enterprise Scenario & Architecture */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-lg border border-border/60 bg-card/40 p-4">
                      <span className="font-mono text-[10px] font-bold uppercase text-emerald-400">
                        ENTERPRISE SCENARIO
                      </span>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {activeConcept.enterpriseExample}
                      </p>
                    </div>

                    <div className="rounded-lg border border-border/60 bg-card/40 p-4">
                      <span className="font-mono text-[10px] font-bold uppercase text-amber-400">
                        COMMON MISTAKES TO AVOID
                      </span>
                      <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                        {activeConcept.commonMistakes.map((mistake, mIdx) => (
                          <li key={mIdx} className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{mistake}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevStage}
                    className="gap-2 text-xs text-muted-foreground"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Mission Briefing</span>
                  </Button>
                  <Button
                    onClick={handleNextStage}
                    className="gap-2 bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-semibold text-xs"
                  >
                    <span>Proceed to Visual Architecture</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Card className="p-8 text-center space-y-4">
              <BookOpen className="h-10 w-10 text-cyan-400 mx-auto" />
              <h3 className="text-lg font-bold text-foreground">Theoretical Foundation & Objectives</h3>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                Review the core security principles, protocols, and architectural models for{" "}
                <span className="text-foreground font-semibold">{session.title}</span> before entering the practical simulation.
              </p>
              <div className="pt-4 flex justify-center">
                <Button onClick={handleNextStage} className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                  Proceed to Visual Architecture
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* STAGE 3: VISUAL ARCHITECTURE */}
      {currentStage === 3 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card className="p-6 border-border/80 bg-card/70 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
              <div>
                <span className="font-mono text-xs text-cyan-400 font-bold uppercase">
                  NETWORK ARCHITECTURE & SECURITY BOUNDARIES
                </span>
                <h3 className="text-lg font-bold text-foreground mt-1">
                  Reference Enterprise Topology: 10.50.0.0/16 Subnet Segmentation
                </h3>
              </div>
              <Badge variant="outline" className="font-mono text-xs text-emerald-400 border-emerald-500/40">
                ACTIVE LAB TOPOLOGY
              </Badge>
            </div>

            {/* Interactive Network Diagram */}
            <div className="rounded-xl border border-cyan-500/30 bg-slate-950/80 p-6 relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="rounded-lg border border-border/80 bg-card/60 p-4">
                  <div className="font-mono text-[10px] text-cyan-400 font-bold">CLIENT WORKSTATION</div>
                  <div className="text-sm font-bold text-foreground mt-1">10.50.10.25</div>
                  <div className="text-[10px] text-muted-foreground mt-1">VLAN 10 • Windows 11</div>
                </div>

                <div className="rounded-lg border border-border/80 bg-card/60 p-4">
                  <div className="font-mono text-[10px] text-cyan-400 font-bold">DEFAULT GATEWAY</div>
                  <div className="text-sm font-bold text-foreground mt-1">10.50.10.1</div>
                  <div className="text-[10px] text-muted-foreground mt-1">L3 Transit Router</div>
                </div>

                <div className="rounded-lg border border-cyan-500/60 bg-cyan-950/30 p-4 shadow-[0_0_15px_rgba(0,229,255,0.15)]">
                  <div className="font-mono text-[10px] text-cyan-400 font-bold">pfSense GATEWAY</div>
                  <div className="text-sm font-bold text-foreground mt-1">10.50.0.2</div>
                  <div className="text-[10px] text-cyan-300 mt-1">vtnet1 LAN • vtnet2 DMZ</div>
                </div>

                <div className="rounded-lg border border-purple-500/50 bg-purple-950/20 p-4">
                  <div className="font-mono text-[10px] text-purple-400 font-bold">UBUNTU APP SERVER</div>
                  <div className="text-sm font-bold text-foreground mt-1">10.50.40.10</div>
                  <div className="text-[10px] text-muted-foreground mt-1">DMZ (HTTPS:443 / SSH:22)</div>
                </div>
              </div>

              {/* Data Flow Legend */}
              <div className="mt-6 flex flex-wrap items-center justify-around gap-4 border-t border-border/80 pt-4 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  <span className="text-muted-foreground">LAN Interface: 10.50.0.2/30 (vtnet1)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-400" />
                  <span className="text-muted-foreground">DMZ Interface: 10.50.40.1/24 (vtnet2)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-muted-foreground">Stateful Filter: pf (FreeBSD 14)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={handlePrevStage} className="text-xs">
                ← Concept Learning
              </Button>
              <Button onClick={handleNextStage} className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 text-xs font-semibold">
                Instructor Demonstration →
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* STAGE 4: INSTRUCTOR DEMONSTRATION */}
      {currentStage === 4 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card className="p-6 border-border/80 bg-card/70 space-y-6">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div>
                <span className="font-mono text-xs text-cyan-400 font-bold uppercase">
                  INSTRUCTOR GUIDED DEMONSTRATION
                </span>
                <h3 className="text-lg font-bold text-foreground mt-1">
                  Live Technical Walkthrough & Expected Observations
                </h3>
              </div>
              <Badge variant="outline" className="font-mono text-xs text-cyan-400 border-cyan-500/40">
                OBSERVATION STAGE
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border border-border/60 bg-slate-950 p-4 font-mono text-xs space-y-2">
                <div className="text-muted-foreground"># Instructor Demonstration Commands:</div>
                <div className="text-emerald-400">$ ping -c 3 10.50.40.10</div>
                <div className="text-muted-foreground text-[11px]">
                  64 bytes from 10.50.40.10: icmp_seq=1 ttl=63 time=0.84 ms (Firewall Rule 103 PASS)
                </div>
                <div className="text-emerald-400 mt-2">$ curl -Iv https://10.50.40.10/</div>
                <div className="text-muted-foreground text-[11px]">
                  Connected to 10.50.40.10 port 443 (#0) • TLSv1.3 Handshake OK • HTTP/1.1 200 OK
                </div>
                <div className="text-rose-400 mt-2">$ ssh -o ConnectTimeout=3 admin@10.50.40.10</div>
                <div className="text-rose-300 text-[11px]">
                  ssh: connect to host 10.50.40.10 port 22: Connection timed out (Rule 102 BLOCK / pfSense drop)
                </div>
              </div>

              <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-4 text-xs space-y-2">
                <span className="font-mono font-bold uppercase text-cyan-400">KEY OBSERVATIONS:</span>
                <p className="text-muted-foreground leading-relaxed">
                  Notice that the pfSense firewall inspects the SYN packet at Layer 4. Because Rule 101 permits TCP port 443, a state table entry is established dynamically. The return SYN-ACK packet matches this dynamic state and bypasses inbound evaluation. In contrast, SSH traffic to port 22 is explicitly blocked and dropped.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={handlePrevStage} className="text-xs">
                ← Visual Architecture
              </Button>
              <Button onClick={handleNextStage} className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 text-xs font-semibold">
                Start Guided Practical →
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* STAGE 5: GUIDED PRACTICAL */}
      {currentStage === 5 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card className="p-6 border-border/80 bg-card/70 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
              <div>
                <span className="font-mono text-xs text-cyan-400 font-bold uppercase">
                  HANDS-ON GUIDED PRACTICAL
                </span>
                <h3 className="text-lg font-bold text-foreground mt-1">
                  Stateful Packet Journey & Rule Execution
                </h3>
              </div>
              <Badge variant="outline" className="font-mono text-xs text-emerald-400 border-emerald-500/40">
                INTERACTIVE SIMULATOR
              </Badge>
            </div>

            {/* Embedded Simulator */}
            <div className="rounded-xl border border-border/70 overflow-hidden">
              <PacketJourneySimulator onLabScoreSave={() => markStageDone(5)} />
            </div>

            {/* Guided Verification Tasks */}
            <div className="rounded-lg border border-border/60 bg-card/40 p-4 space-y-3">
              <span className="font-mono text-xs font-bold uppercase text-cyan-400">
                PRACTICAL VERIFICATION TASKS:
              </span>
              <div className="space-y-2">
                {[
                  { key: "task1", label: "Transmit HTTPS traffic and confirm dynamic state table entry created" },
                  { key: "task2", label: "Toggle Rule 101 to BLOCK and observe Stage 4 packet drop at pfSense" },
                  { key: "task3", label: "Toggle Rule 102 to PASS and verify SSH handshake succeeds to 10.50.40.10:22" },
                ].map((task) => (
                  <label
                    key={task.key}
                    onClick={() => handleTogglePracticalCheck(task.key)}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-card/60 cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={!!practicalChecklist[task.key]}
                      readOnly
                      className="rounded border-border text-cyan-400 focus:ring-cyan-400"
                    />
                    <span className={practicalChecklist[task.key] ? "line-through text-muted-foreground" : "text-foreground"}>
                      {task.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={handlePrevStage} className="text-xs">
                ← Demonstration
              </Button>
              <Button onClick={handleNextStage} className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 text-xs font-semibold">
                Proceed to Independent Mission →
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* STAGE 6: INDEPENDENT MISSION */}
      {currentStage === 6 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card className="p-6 border-border/80 bg-card/70 space-y-6">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div>
                <span className="font-mono text-xs text-amber-400 font-bold uppercase">
                  INDEPENDENT MISSION CHALLENGE
                </span>
                <h3 className="text-lg font-bold text-foreground mt-1">
                  Scenario: Restrict Administrative Access to DMZ
                </h3>
              </div>
              <Badge variant="outline" className="font-mono text-xs text-amber-400 border-amber-500/40">
                UNASSISTED MISSION
              </Badge>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Security auditors flagged that SSH access to the application server (<code className="text-cyan-300 font-mono">10.50.40.10:22</code>) was previously open from all client subnets. Your objective is to explain how a stateful firewall handles rule ordering, and record your technical justification for why stateful return traffic should be allowed while unsolicited inbound connections from the DMZ to the LAN are blocked.
              </p>

              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase text-muted-foreground">
                  Your Technical Justification & Verification Notes:
                </label>
                <textarea
                  value={missionEvidence}
                  onChange={(e) => setMissionEvidence(e.target.value)}
                  placeholder="Explain the difference between stateful connection tracking vs stateless packet filtering in this scenario..."
                  rows={4}
                  className="w-full rounded-lg border border-border/80 bg-slate-950 p-3 text-xs text-foreground font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setMissionSubmitted(true);
                    markStageDone(6);
                  }}
                  disabled={missionEvidence.trim().length < 15}
                  className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-semibold text-xs"
                >
                  <Check className="h-4 w-4 mr-1.5" />
                  {missionSubmitted ? "Evidence Submitted" : "Submit Mission Evidence"}
                </Button>
                {missionSubmitted && (
                  <span className="text-xs text-emerald-400 font-mono">✓ Evidence Recorded</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/80 pt-4">
              <Button variant="outline" onClick={handlePrevStage} className="text-xs">
                ← Guided Practical
              </Button>
              <Button onClick={handleNextStage} className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 text-xs font-semibold">
                Proceed to Assessment →
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* STAGE 7: COMPETENCY ASSESSMENT */}
      {currentStage === 7 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card className="p-6 border-border/80 bg-card/70 space-y-6">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div>
                <span className="font-mono text-xs text-cyan-400 font-bold uppercase">
                  STAGE 7 • FORMAL COMPETENCY ASSESSMENT
                </span>
                <h3 className="text-lg font-bold text-foreground mt-1">
                  Knowledge Evaluation & Technical Reasoning
                </h3>
              </div>
              {assessmentScore !== null && (
                <Badge
                  className={`text-xs font-mono font-bold px-2.5 py-1 ${
                    assessmentScore >= 70
                      ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
                      : "bg-rose-950/60 text-rose-300 border-rose-500/40"
                  }`}
                >
                  SCORE: {assessmentScore}% {assessmentScore >= 70 ? "PASS" : "REVISION REQUIRED"}
                </Badge>
              )}
            </div>

            {assessmentQuestions.length > 0 ? (
              <div className="space-y-6">
                {assessmentQuestions.map((q, qIdx) => (
                  <div key={q.id} className="rounded-lg border border-border/60 bg-card/40 p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400">
                        Q{qIdx + 1}.
                      </span>
                      <p className="text-xs font-medium text-foreground">{q.prompt}</p>
                    </div>

                    <div className="space-y-1.5 pl-6">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = assessmentAnswers[q.id] === optIdx;
                        const isCorrect = optIdx === q.correctAnswer;

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={assessmentSubmitted}
                            onClick={() =>
                              setAssessmentAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                            }
                            className={`w-full text-left p-2.5 rounded-md border text-xs flex items-center justify-between transition-all ${
                              isSelected
                                ? assessmentSubmitted
                                  ? isCorrect
                                    ? "border-emerald-500 bg-emerald-950/30 text-emerald-300"
                                    : "border-rose-500 bg-rose-950/30 text-rose-300"
                                  : "border-cyan-500 bg-cyan-500/10 text-cyan-300"
                                : assessmentSubmitted && isCorrect
                                  ? "border-emerald-500/50 bg-emerald-950/20 text-emerald-400 font-semibold"
                                  : "border-border/50 bg-card/30 text-muted-foreground hover:bg-card/60 hover:text-foreground"
                            }`}
                          >
                            <span>{opt}</span>
                            {assessmentSubmitted && isCorrect && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {assessmentSubmitted && (
                      <div className="pl-6 pt-2 text-[11px] text-muted-foreground border-t border-border/40">
                        <span className="font-mono font-bold text-cyan-400">Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}

                {!assessmentSubmitted && (
                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={handleGradeAssessment}
                      className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-semibold text-xs"
                    >
                      Submit Assessment for Evaluation
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center space-y-3">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                <p className="text-xs text-muted-foreground">
                  Practical competency validated via simulator telemetry.
                </p>
                <Button onClick={() => markStageDone(7)} size="sm" className="bg-emerald-500 text-slate-950">
                  Record Practical Competency
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border/80 pt-4">
              <Button variant="outline" onClick={handlePrevStage} className="text-xs">
                ← Mission Challenge
              </Button>
              <Button onClick={handleNextStage} className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 text-xs font-semibold">
                Proceed to Session Summary →
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* STAGE 8: SESSION SUMMARY */}
      {currentStage === 8 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card className="p-8 border-cyan-500/40 bg-gradient-to-br from-card via-card to-cyan-950/30 text-center space-y-6">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/20 border border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.3)] mx-auto">
              <Award className="h-8 w-8" />
            </div>

            <div>
              <Badge variant="outline" className="font-mono text-xs text-cyan-400 border-cyan-500/40 mb-2">
                SESSION CONCLUDED
              </Badge>
              <h2 className="text-2xl font-bold text-foreground">{session.title}</h2>
              <p className="text-xs text-muted-foreground mt-1 max-w-lg mx-auto">
                You have systematically navigated the 8 instructional stages of this session, observed live traffic filtering, and demonstrated competency.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
              <div className="rounded-lg border border-border/70 bg-card/60 p-4">
                <span className="font-mono text-[10px] text-muted-foreground uppercase font-bold">STATUS</span>
                <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>COMPLETED</span>
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-card/60 p-4">
                <span className="font-mono text-[10px] text-muted-foreground uppercase font-bold">ASSESSMENT</span>
                <div className="text-sm font-bold text-cyan-400 mt-1">
                  {assessmentScore !== null ? `${assessmentScore}%` : "100% Practical"}
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-card/60 p-4">
                <span className="font-mono text-[10px] text-muted-foreground uppercase font-bold">CONTACT HOURS</span>
                <div className="text-sm font-bold text-foreground mt-1">1.5 Hours</div>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={onNavigateToSchedule}
                className="text-xs border-border/80"
              >
                Return to Course Schedule
              </Button>
              <Button
                onClick={handleFinishSession}
                className="gap-2 bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-semibold text-xs px-6 shadow-[0_0_15px_rgba(0,229,255,0.3)]"
              >
                <Check className="h-4 w-4" />
                <span>Mark Session Complete & Continue</span>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
