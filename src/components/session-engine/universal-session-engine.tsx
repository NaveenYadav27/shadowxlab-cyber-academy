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
import {
  getDay2ConceptsForSession,
  getDay2SessionAssessment,
  type Day2Concept,
} from "@/lib/day2-curriculum";
import PacketJourneySimulator from "@/components/day1/packet-journey-simulator";
import { Day2TopologyCanvas } from "@/components/day2/day2-topology-canvas";
import { Day2Labs } from "@/components/day2/day2-labs";

export type SessionStageNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface UniversalSessionEngineProps {
  session: TrainingSession;
  dayIndex: number;
  programme: ProgrammeConfig;
  state: TrainingState;
  onSessionComplete: (sessionId: string) => void;
  onNavigateToSchedule: () => void;
  onOpenCyberRange?: () => void;
  onSaveLabScore?: (labId: string, score: number) => void;
  onSaveSessionAssessmentScore?: (sessionId: string, score: number) => void;
}

export function UniversalSessionEngine({
  session,
  dayIndex,
  programme,
  state,
  onSessionComplete,
  onNavigateToSchedule,
  onOpenCyberRange,
  onSaveLabScore,
  onSaveSessionAssessmentScore,
}: UniversalSessionEngineProps) {
  const [currentStage, setCurrentStage] = useState<SessionStageNumber>(1);
  const [completedStages, setCompletedStages] = useState<Record<number, boolean>>({});

  const isDay2 = session.id.startsWith("d2-");

  // Stage 2 Concept selection
  const sessionConcepts: (Day1Concept | Day2Concept)[] = isDay2
    ? getDay2ConceptsForSession(session.id)
    : getConceptsForSession(session.id);
  const [selectedConceptIndex, setSelectedConceptIndex] = useState<number>(0);
  const activeConcept: Day1Concept | Day2Concept | undefined = sessionConcepts[selectedConceptIndex];
  const [conceptQuizSelections, setConceptQuizSelections] = useState<Record<string, number>>({});
  const [activeConfigTab, setActiveConfigTab] = useState<"fortios" | "linux">("fortios");

  // Stage 5 Guided Practical completion checklist
  const [practicalChecklist, setPracticalChecklist] = useState<Record<string, boolean>>({});

  // Stage 6 Independent Mission evidence & notes
  const [missionEvidence, setMissionEvidence] = useState<string>("");
  const [missionSubmitted, setMissionSubmitted] = useState<boolean>(false);

  // Stage 7 Assessment answers
  const assessmentQuestions: AssessmentQuestion[] = isDay2
    ? getDay2SessionAssessment(session.id)
    : getSessionAssessment(session.id);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, number>>({});
  const [assessmentSubmitted, setAssessmentSubmitted] = useState<boolean>(false);
  const [assessmentScore, setAssessmentScore] = useState<number | null>(
    (isDay2
      ? state.day2SessionAssessmentScores?.[session.id]
      : state.day1SessionAssessmentScores?.[session.id]) ?? null,
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
    if (onSaveSessionAssessmentScore) {
      onSaveSessionAssessmentScore(session.id, calculated);
    }
  };

  const handleFinishSession = () => {
    markStageDone(8);
    onSessionComplete(session.id);
  };

  const isSessionAlreadyCompleted = state.completedSessionIds.includes(session.id);

  return (
    <div className="universal-session-engine space-y-6 max-w-6xl mx-auto pb-12">
      {/* Session Breadcrumb & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToSchedule}
            className="h-8 gap-1.5 text-xs text-gray-500 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Schedule</span>
          </Button>
          <span className="text-gray-300">•</span>
          <Badge variant="outline" className="font-mono text-xs text-red-600 border-red-200 bg-red-50">
            DAY {dayIndex + 1} • SESSION {session.id.toUpperCase()}
          </Badge>
          <span className="text-xs font-semibold text-gray-900 line-clamp-1 max-w-[360px]">
            {session.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isSessionAlreadyCompleted && (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
          <span className="font-mono text-xs text-gray-500">
            {session.start} – {session.end} ({session.kind.toUpperCase()})
          </span>
        </div>
      </div>

      {/* 8-Stage Interactive Pedagogical Stepper */}
      <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between overflow-x-auto gap-2 pb-1">
          {stages.map((stage) => {
            const isCurrent = currentStage === stage.number;
            const isDone = completedStages[stage.number];

            return (
              <button
                key={stage.number}
                type="button"
                onClick={() => setCurrentStage(stage.number)}
                className={`flex flex-1 min-w-[105px] items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-all ${
                  isCurrent
                    ? "border-red-600 bg-red-50 text-red-700 shadow-sm"
                    : isDone
                      ? "border-emerald-200 bg-emerald-50/60 text-emerald-800"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-900"
                }`}
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-bold ${
                    isCurrent
                      ? "bg-red-600 text-white shadow-sm"
                      : isDone
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                  }`}
                >
                  {isDone ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : stage.number}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
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
          <Card className="p-6 border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 text-red-600 font-mono text-xs uppercase tracking-wider mb-2">
              <Shield className="h-4 w-4" />
              <span>Operational Briefing & Threat Context</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{session.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              {session.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-6">
              <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-4">
                <span className="font-mono text-[10px] font-bold uppercase text-red-600">
                  ENTERPRISE SCENARIO
                </span>
                <p className="mt-1 text-xs text-gray-900 font-medium">
                  {isDay2
                    ? "Engineering Staff College of India (ESCI) Campus Security"
                    : "National Public Land Records Agency (NPLRA) Government Network"}
                </p>
                <p className="mt-1 text-[11px] text-gray-500">
                  {isDay2
                    ? "Multi-zone perimeter: WAN (10.231.10.0/24), LAN (10.231.20.0/24), and DMZ (10.231.30.0/24)."
                    : "Securing government records, database servers, and multi-zone citizen services."}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-4">
                <span className="font-mono text-[10px] font-bold uppercase text-red-600">
                  LEARNING GOALS
                </span>
                <ul className="mt-1.5 space-y-1 text-xs text-gray-600">
                  {isDay2 ? (
                    <>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-red-600 shrink-0" />
                        <span>Configure multi-homed NICs (eth0, eth1, eth2)</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-red-600 shrink-0" />
                        <span>Inject static routes & verify kernel forwarding</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-red-600 shrink-0" />
                        <span>Enforce nftables stateful ACLs & DMZ isolation</span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-red-600 shrink-0" />
                        <span>Understand security perimeter enforcement</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-red-600 shrink-0" />
                        <span>Analyze stateful protocol inspections</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-red-600 shrink-0" />
                        <span>Validate rule changes without packet loss</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-4">
                <span className="font-mono text-[10px] font-bold uppercase text-red-600">
                  EXECUTION MODE
                </span>
                <p className="mt-1 text-xs text-gray-900 font-medium">
                  {isDay2 ? "Deterministic Simulation Engine" : "Zero Infrastructure Troubleshooting"}
                </p>
                <p className="mt-1 text-[11px] text-gray-500">
                  {isDay2
                    ? "High-fidelity browser-based Netfilter/nftables simulation. Real-time packet tracing & telemetry."
                    : "Browser-based high-fidelity simulation. No hypervisor configuration required."}
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                onClick={handleNextStage}
                className="gap-2 bg-red-600 text-white hover:bg-red-700 font-semibold shadow-sm"
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
                <div className="font-mono text-xs font-bold uppercase text-red-600 mb-2">
                  Session Concepts ({sessionConcepts.length})
                </div>
                <div className="space-y-1">
                  {sessionConcepts.map((concept, idx) => (
                    <button
                      key={concept.id}
                      onClick={() => setSelectedConceptIndex(idx)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                        selectedConceptIndex === idx
                          ? "border-red-600 bg-red-50 text-red-900 font-semibold shadow-sm"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <div className="font-mono text-[10px] text-red-600 font-bold">
                        CONCEPT {String(concept.number).padStart(2, "0")}
                      </div>
                      <div className="line-clamp-2 mt-0.5">{concept.title}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Concept In-Depth Detail */}
              <div className="lg:col-span-3 space-y-5">
                {isDay2 && (activeConcept as Day2Concept).howItWorks ? (
                  // Comprehensive 10-Point Pedagogical Model for Day 2
                  (() => {
                    const c = activeConcept as Day2Concept;
                    return (
                      <Card className="p-6 border-gray-200 bg-white shadow-sm space-y-6">
                        {/* 1. Header & Concept Introduction */}
                        <div className="border-b border-gray-100 pb-4">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-mono text-xs text-red-600 font-bold uppercase">
                              CONCEPT {c.number} • {c.durationMinutes} MINUTES
                            </span>
                            <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200 font-mono text-[10px]">
                              10-POINT PEDAGOGICAL DEEP DIVE
                            </Badge>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mt-1.5">
                            {c.title}
                          </h3>
                          <div className="mt-3 rounded-lg border border-red-100 bg-red-50/40 p-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-red-700 font-mono uppercase mb-1">
                              <Info className="h-4 w-4" />
                              <span>1. Concept Introduction</span>
                            </div>
                            <p className="text-sm text-gray-800 leading-relaxed">
                              {c.conceptIntroduction || c.technicalExplanation}
                            </p>
                          </div>
                        </div>

                        {/* 2. Purpose */}
                        <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-4 space-y-1">
                          <div className="font-mono text-xs font-bold uppercase text-red-600 flex items-center gap-1.5">
                            <Shield className="h-4 w-4" />
                            <span>2. Purpose & Need in Enterprise Defense</span>
                          </div>
                          <p className="text-xs text-gray-700 leading-relaxed">
                            {c.purpose || c.securityEngineeringRelevance}
                          </p>
                        </div>

                        {/* 3. How It Works (Step-by-step) */}
                        {c.howItWorks && c.howItWorks.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-xs font-mono font-bold uppercase text-gray-700 flex items-center gap-1.5">
                              <Activity className="h-4 w-4 text-red-600" />
                              <span>3. How It Works (Step-by-Step Mechanism)</span>
                            </h4>
                            <div className="grid grid-cols-1 gap-2">
                              {c.howItWorks.map((step, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-white shadow-sm"
                                >
                                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-white font-mono text-[11px] font-bold">
                                    {sIdx + 1}
                                  </span>
                                  <p className="text-xs text-gray-700 leading-relaxed pt-0.5">
                                    {step}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 4. Architecture / Visual Representation */}
                        {c.architectureOrWorkflow && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-mono font-bold uppercase text-gray-700 flex items-center gap-1.5">
                              <Layers className="h-4 w-4 text-red-600" />
                              <span>4. Visual Architecture & Packet Workflow</span>
                            </h4>
                            <pre className="bg-gray-50 border border-gray-200 text-gray-900 p-4 rounded-lg font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed">
                              {c.architectureOrWorkflow}
                            </pre>
                          </div>
                        )}

                        {/* 5. Enterprise Example */}
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-1.5">
                          <span className="font-mono text-[10px] font-bold uppercase text-red-600">
                            5. Enterprise Production Scenario
                          </span>
                          <p className="text-xs text-gray-700 leading-relaxed">
                            {c.enterpriseExample}
                          </p>
                        </div>

                        {/* 6. Configuration Relevance */}
                        {c.configurationRelevance && (
                          <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-4 space-y-3">
                            <span className="font-mono text-xs font-bold uppercase text-gray-900 flex items-center gap-1.5">
                              <Terminal className="h-4 w-4 text-red-600" />
                              <span>6. Configuration Syntax & Commands</span>
                            </span>
                            <pre className="bg-white border border-gray-200 text-gray-900 p-3 rounded font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed">
                              {typeof c.configurationRelevance === "string"
                                ? c.configurationRelevance
                                : ((c.configurationRelevance as any).fortiosCli ?? "")}
                            </pre>
                          </div>
                        )}

                        {/* 7. Practical Relevance (Lab Mapping) */}
                        {c.practicalRelevance && (
                          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 space-y-1">
                            <span className="font-mono text-[10px] font-bold uppercase text-emerald-800">
                              7. Practical Lab Mapping
                            </span>
                            <p className="text-xs text-emerald-950 font-medium">
                              {typeof c.practicalRelevance === "string"
                                ? c.practicalRelevance
                                : (c.practicalRelevance as any).appliedSkill}
                            </p>
                          </div>
                        )}

                        {/* 8. Common Mistakes to Avoid */}
                        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 space-y-2">
                          <span className="font-mono text-[10px] font-bold uppercase text-amber-800 flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                            <span>8. Common Mistakes to Avoid</span>
                          </span>
                          <ul className="space-y-1 text-xs text-amber-950">
                            {(c.commonMistakes ?? []).map((mistake, mIdx) => (
                              <li key={mIdx} className="flex items-start gap-1.5">
                                <span className="text-amber-600 font-bold">•</span>
                                <span>{mistake}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 9. Key Takeaways */}
                        {c.keyTakeaways && c.keyTakeaways.length > 0 && (
                          <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-4 space-y-2">
                            <span className="font-mono text-[10px] font-bold uppercase text-gray-700">
                              9. Key Engineering Takeaways
                            </span>
                            <ul className="space-y-1 text-xs text-gray-800">
                              {c.keyTakeaways.map((takeaway, tIdx) => (
                                <li key={tIdx} className="flex items-start gap-1.5">
                                  <Check className="h-3.5 w-3.5 text-red-600 shrink-0 mt-0.5" />
                                  <span>{takeaway}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* 10. Knowledge Check */}
                        {c.knowledgeCheck && c.knowledgeCheck.length > 0 && (
                          <div className="rounded-xl border border-red-200 bg-red-50/30 p-5 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold uppercase text-red-700 flex items-center gap-1.5">
                                <ClipboardCheck className="h-4 w-4" />
                                <span>10. Interactive Concept Knowledge Check</span>
                              </span>
                              <Badge className="bg-red-600 text-white font-mono text-[10px]">
                                {c.knowledgeCheck.length} QUESTION{c.knowledgeCheck.length > 1 ? "S" : ""}
                              </Badge>
                            </div>

                            <div className="space-y-4">
                              {c.knowledgeCheck.map((kc, kIdx) => {
                                const quizKey = `${c.id}-q-${kIdx}`;
                                const selectedIdx = conceptQuizSelections[quizKey];
                                const hasAnswered = selectedIdx !== undefined;

                                return (
                                  <div
                                    key={kIdx}
                                    className="p-4 rounded-lg border border-gray-200 bg-white space-y-3 shadow-sm"
                                  >
                                    <div className="flex items-start gap-2">
                                      <span className="font-mono text-xs font-bold text-red-600">
                                        Q{kIdx + 1}.
                                      </span>
                                      <p className="text-xs font-medium text-gray-900">
                                        {kc.question || (kc as any).prompt}
                                      </p>
                                    </div>

                                    <div className="space-y-1.5 pl-5">
                                      {kc.options.map((option, optIdx) => {
                                        const isSelected = selectedIdx === optIdx;
                                        const isCorrect = optIdx === kc.correctAnswer;

                                        let btnStyle = "border-gray-200 bg-white text-gray-700 hover:bg-gray-50";
                                        if (hasAnswered) {
                                          if (isSelected && isCorrect) {
                                            btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold";
                                          } else if (isSelected && !isCorrect) {
                                            btnStyle = "border-red-500 bg-red-50 text-red-900";
                                          } else if (isCorrect) {
                                            btnStyle = "border-emerald-500/60 bg-emerald-50/50 text-emerald-800 font-semibold";
                                          } else {
                                            btnStyle = "border-gray-200 bg-gray-50/40 text-gray-400";
                                          }
                                        }

                                        return (
                                          <button
                                            key={optIdx}
                                            type="button"
                                            onClick={() =>
                                              setConceptQuizSelections((prev) => ({
                                                ...prev,
                                                [quizKey]: optIdx,
                                              }))
                                            }
                                            className={`w-full text-left p-2.5 rounded-md border text-xs flex items-center justify-between transition-all ${btnStyle}`}
                                          >
                                            <span>{option}</span>
                                            {hasAnswered && isCorrect && (
                                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>

                                    {hasAnswered && (
                                      <div className="pl-5 pt-2 text-[11px] text-gray-600 border-t border-gray-100">
                                        <span className="font-mono font-bold text-red-600">Explanation: </span>
                                        {kc.explanation}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })()
                ) : (
                  // Day 1 / Standard Concept Rendering with Red & White Theme
                  <Card className="p-6 border-gray-200 bg-white shadow-sm space-y-5">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div>
                        <span className="font-mono text-xs text-red-600 font-bold uppercase">
                          CONCEPT {activeConcept.number} • {activeConcept.durationMinutes} MINUTES
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 mt-1">
                          {activeConcept.title}
                        </h3>
                      </div>
                    </div>

                    {/* Why It Matters Callout */}
                    <div className="rounded-lg border border-red-200 bg-red-50/40 p-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-red-700 font-mono uppercase">
                        <Info className="h-4 w-4" />
                        <span>Why This Matters in Cybersecurity</span>
                      </div>
                      <p className="mt-1 text-xs text-gray-700 leading-relaxed">
                        {activeConcept.securityEngineeringRelevance}
                      </p>
                    </div>

                    {/* Technical Explanation */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-mono font-bold uppercase text-gray-700">
                        Technical Explanation & Mechanism
                      </h4>
                      <p className="text-sm text-gray-800 leading-relaxed bg-gray-50/60 p-4 rounded-lg border border-gray-200">
                        {activeConcept.technicalExplanation}
                      </p>
                    </div>

                    {/* Enterprise Scenario & Common Mistakes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <span className="font-mono text-[10px] font-bold uppercase text-emerald-700">
                          ENTERPRISE SCENARIO
                        </span>
                        <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                          {activeConcept.enterpriseExample}
                        </p>
                      </div>

                      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <span className="font-mono text-[10px] font-bold uppercase text-amber-700">
                          COMMON MISTAKES TO AVOID
                        </span>
                        <ul className="mt-1.5 space-y-1 text-xs text-gray-600">
                          {(activeConcept.commonMistakes ?? []).map((mistake, mIdx) => (
                            <li key={mIdx} className="flex items-start gap-1.5">
                              <span className="text-amber-600 font-bold">•</span>
                              <span>{mistake}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                )}

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevStage}
                    className="gap-2 text-xs text-gray-600 border-gray-200 hover:text-gray-900"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Mission Briefing</span>
                  </Button>
                  <Button
                    onClick={handleNextStage}
                    className="gap-2 bg-red-600 text-white hover:bg-red-700 font-semibold text-xs shadow-sm"
                  >
                    <span>Proceed to Visual Architecture</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Card className="p-8 text-center space-y-4 border-gray-200 bg-white shadow-sm">
              <BookOpen className="h-10 w-10 text-red-600 mx-auto" />
              <h3 className="text-lg font-bold text-gray-900">Theoretical Foundation & Objectives</h3>
              <p className="text-sm text-gray-600 max-w-xl mx-auto">
                Review the core security principles, protocols, and architectural models for{" "}
                <span className="text-gray-900 font-semibold">{session.title}</span> before entering the practical simulation.
              </p>
              <div className="pt-4 flex justify-center">
                <Button onClick={handleNextStage} className="bg-red-600 text-white hover:bg-red-700 font-semibold shadow-sm">
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
          {isDay2 ? (
            <div className="space-y-6">
              <Day2TopologyCanvas />
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <Button variant="outline" onClick={handlePrevStage} className="text-xs text-gray-600 border-gray-200 hover:text-gray-900">
                  ← Concept Learning
                </Button>
                <Button
                  onClick={handleNextStage}
                  className="bg-red-600 text-white hover:bg-red-700 text-xs font-semibold shadow-sm"
                >
                  Instructor Demonstration →
                </Button>
              </div>
            </div>
          ) : (
            <Card className="p-6 border-gray-200 bg-white shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <span className="font-mono text-xs text-red-600 font-bold uppercase">
                    NETWORK ARCHITECTURE & SECURITY BOUNDARIES
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">
                    Reference Enterprise Topology: 10.50.0.0/16 Subnet Segmentation
                  </h3>
                </div>
                <Badge variant="outline" className="font-mono text-xs text-emerald-700 bg-emerald-50 border-emerald-200">
                  ACTIVE LAB TOPOLOGY
                </Badge>
              </div>

              {/* Interactive Network Diagram */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-6 relative overflow-hidden shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
                    <div className="font-mono text-[10px] text-red-600 font-bold">CLIENT WORKSTATION</div>
                    <div className="text-sm font-bold text-gray-900 mt-1">10.50.10.25</div>
                    <div className="text-[10px] text-gray-500 mt-1">VLAN 10 • Windows 11</div>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
                    <div className="font-mono text-[10px] text-gray-600 font-bold">DEFAULT GATEWAY</div>
                    <div className="text-sm font-bold text-gray-900 mt-1">10.50.10.1</div>
                    <div className="text-[10px] text-gray-500 mt-1">L3 Transit Router</div>
                  </div>

                  <div className="rounded-lg border border-red-200 bg-red-50/50 shadow-sm p-4">
                    <div className="font-mono text-[10px] text-red-700 font-bold">pfSense GATEWAY</div>
                    <div className="text-sm font-bold text-gray-900 mt-1">10.50.0.2</div>
                    <div className="text-[10px] text-red-700 mt-1">vtnet1 LAN • vtnet2 DMZ</div>
                  </div>

                  <div className="rounded-lg border border-purple-200 bg-purple-50/50 shadow-sm p-4">
                    <div className="font-mono text-[10px] text-purple-700 font-bold">UBUNTU APP SERVER</div>
                    <div className="text-sm font-bold text-gray-900 mt-1">10.50.40.10</div>
                    <div className="text-[10px] text-gray-500 mt-1">DMZ (HTTPS:443 / SSH:22)</div>
                  </div>
                </div>

                {/* Data Flow Legend */}
                <div className="mt-6 flex flex-wrap items-center justify-around gap-4 border-t border-gray-200 pt-4 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-600" />
                    <span className="text-gray-600">LAN Interface: 10.50.0.2/30 (vtnet1)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-purple-600" />
                    <span className="text-gray-600">DMZ Interface: 10.50.40.1/24 (vtnet2)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                    <span className="text-gray-600">Stateful Filter: pf (FreeBSD 14)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={handlePrevStage} className="text-xs text-gray-600 border-gray-200 hover:text-gray-900">
                  ← Concept Learning
                </Button>
                <Button onClick={handleNextStage} className="bg-red-600 text-white hover:bg-red-700 text-xs font-semibold shadow-sm">
                  Instructor Demonstration →
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* STAGE 4: INSTRUCTOR DEMONSTRATION */}
      {currentStage === 4 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card className="p-6 border-gray-200 bg-white shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="font-mono text-xs text-red-600 font-bold uppercase">
                  INSTRUCTOR GUIDED DEMONSTRATION
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">
                  Live Technical Walkthrough & Expected Observations
                </h3>
              </div>
              <Badge variant="outline" className="font-mono text-xs text-red-700 bg-red-50 border-red-200">
                OBSERVATION STAGE
              </Badge>
            </div>

            <div className="space-y-4">
              {isDay2 ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-xs space-y-2.5">
                  <div className="text-red-700 font-bold"># 1. Interface IP & Link State Verification:</div>
                  <div className="text-gray-600">$ ip -br addr show</div>
                  <div className="text-emerald-700 font-semibold text-[11px] bg-white p-2 rounded border border-gray-200">
                    eth0 UP 10.231.30.254/24 (DMZ) | eth1 UP 10.231.20.254/24 (LAN) | eth2 UP 10.231.10.254/24 (WAN)
                  </div>

                  <div className="text-red-700 font-bold mt-2"># 2. Kernel Routing Table Check:</div>
                  <div className="text-gray-600">$ ip route show</div>
                  <div className="text-emerald-700 font-semibold text-[11px] bg-white p-2 rounded border border-gray-200">
                    default via 10.231.10.1 dev eth2<br />
                    10.231.10.0/24 dev eth2 proto kernel scope link src 10.231.10.254<br />
                    10.231.20.0/24 dev eth1 proto kernel scope link src 10.231.20.254<br />
                    10.231.30.0/24 dev eth0 proto kernel scope link src 10.231.30.254
                  </div>

                  <div className="text-red-700 font-bold mt-2"># 3. Active nftables Ruleset with Hit Counters:</div>
                  <div className="text-gray-600">$ nft list ruleset</div>
                  <div className="text-gray-900 text-[11px] whitespace-pre-wrap bg-white p-2.5 rounded border border-gray-200 font-mono">
{`table inet filter {
  chain forward {
    type filter hook forward priority 0; policy drop;
    ct state established,related counter packets 542 bytes 62140 accept
    iif eth1 oif eth0 ip daddr 10.231.30.10 tcp dport { 80, 443 } counter packets 118 bytes 15200 accept
    iif eth2 oif eth0 ip daddr 10.231.30.10 tcp dport { 80, 443 } counter packets 84 bytes 10920 accept
    iif eth0 oif eth1 counter packets 31 bytes 1860 drop
  }
}`}
                  </div>

                  <div className="text-red-700 font-bold mt-2"># 4. End-to-End Inter-Zone Connectivity Test:</div>
                  <div className="text-emerald-700 font-semibold text-[11px] bg-white p-2 rounded border border-gray-200">
                    $ curl -Iv http://10.231.30.10/ (from sxl-lan01)<br />
                    Connected to 10.231.30.10 port 80 • HTTP/1.1 200 OK (Nginx DMZ Web Server) ✓
                  </div>
                  <div className="text-red-700 font-semibold text-[11px] bg-white p-2 rounded border border-gray-200">
                    $ ssh -o ConnectTimeout=2 10.231.20.10 (from sxl-dmz01)<br />
                    ssh: connect to host 10.231.20.10 port 22: Connection timed out (Rule: iif eth0 oif eth1 drop) ✗
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-xs space-y-2">
                  <div className="text-gray-500"># Instructor Demonstration Commands:</div>
                  <div className="text-emerald-700 font-bold">$ ping -c 3 10.50.40.10</div>
                  <div className="text-gray-600 text-[11px]">
                    64 bytes from 10.50.40.10: icmp_seq=1 ttl=63 time=0.84 ms (Firewall Rule 103 PASS)
                  </div>
                  <div className="text-emerald-700 font-bold mt-2">$ curl -Iv https://10.50.40.10/</div>
                  <div className="text-gray-600 text-[11px]">
                    Connected to 10.50.40.10 port 443 (#0) • TLSv1.3 Handshake OK • HTTP/1.1 200 OK
                  </div>
                  <div className="text-red-700 font-bold mt-2">$ ssh -o ConnectTimeout=3 admin@10.50.40.10</div>
                  <div className="text-red-600 text-[11px]">
                    ssh: connect to host 10.50.40.10 port 22: Connection timed out (Rule 102 BLOCK / pfSense drop)
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-red-100 bg-red-50/40 p-4 text-xs space-y-2">
                <span className="font-mono font-bold uppercase text-red-700">KEY OBSERVATIONS:</span>
                <p className="text-gray-700 leading-relaxed">
                  {isDay2
                    ? "Notice how the Linux Netfilter forward hook evaluates traffic strictly based on the 5-tuple and interface bindings. The DMZ-to-LAN isolation rule halts any unsolicited packet initiated from eth0 to eth1, preventing lateral movement even if the DMZ web server is compromised. However, stateful return packets for connections initiated by LAN users are accepted by the connection tracking rule at the top of the chain."
                    : "Notice that the pfSense firewall inspects the SYN packet at Layer 4. Because Rule 101 permits TCP port 443, a state table entry is established dynamically. The return SYN-ACK packet matches this dynamic state and bypasses inbound evaluation. In contrast, SSH traffic to port 22 is explicitly blocked and dropped."}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={handlePrevStage} className="text-xs text-gray-600 border-gray-200 hover:text-gray-900">
                ← Visual Architecture
              </Button>
              <Button onClick={handleNextStage} className="bg-red-600 text-white hover:bg-red-700 text-xs font-semibold shadow-sm">
                Start Guided Practical →
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* STAGE 5: GUIDED PRACTICAL */}
      {currentStage === 5 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {isDay2 ? (
            <div className="space-y-6">
              <Day2Labs
                activeLabId={
                  session.id === "d2-s1" || session.id === "d2-s2"
                    ? "day2-lab-01"
                    : session.id === "d2-s3"
                      ? "day2-lab-02"
                      : "day2-lab-03"
                }
                labScores={state.day2LabScores ?? {}}
                onSaveLabScore={(labId, score) => {
                  markStageDone(5);
                  onSaveLabScore?.(labId, score);
                }}
              />
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <Button variant="outline" onClick={handlePrevStage} className="text-xs text-gray-600 border-gray-200 hover:text-gray-900">
                  ← Demonstration
                </Button>
                <Button
                  onClick={handleNextStage}
                  className="bg-red-600 text-white hover:bg-red-700 text-xs font-semibold shadow-sm"
                >
                  Proceed to Independent Mission →
                </Button>
              </div>
            </div>
          ) : (
            <Card className="p-6 border-gray-200 bg-white shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <span className="font-mono text-xs text-red-600 font-bold uppercase">
                    HANDS-ON GUIDED PRACTICAL
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">
                    Stateful Packet Journey & Rule Execution
                  </h3>
                </div>
                <Badge variant="outline" className="font-mono text-xs text-emerald-700 bg-emerald-50 border-emerald-200">
                  INTERACTIVE SIMULATOR
                </Badge>
              </div>

              {/* Embedded Simulator */}
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <PacketJourneySimulator onLabScoreSave={() => markStageDone(5)} />
              </div>

              {/* Guided Verification Tasks */}
              <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-4 space-y-3">
                <span className="font-mono text-xs font-bold uppercase text-red-600">
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
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-white cursor-pointer text-xs transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={!!practicalChecklist[task.key]}
                        readOnly
                        className="rounded border-gray-300 text-red-600 focus:ring-red-600"
                      />
                      <span className={practicalChecklist[task.key] ? "line-through text-gray-400" : "text-gray-800"}>
                        {task.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={handlePrevStage} className="text-xs text-gray-600 border-gray-200 hover:text-gray-900">
                  ← Demonstration
                </Button>
                <Button onClick={handleNextStage} className="bg-red-600 text-white hover:bg-red-700 text-xs font-semibold shadow-sm">
                  Proceed to Independent Mission →
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* STAGE 6: INDEPENDENT MISSION */}
      {currentStage === 6 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card className="p-6 border-gray-200 bg-white shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="font-mono text-xs text-amber-700 font-bold uppercase">
                  INDEPENDENT MISSION CHALLENGE
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">
                  {isDay2
                    ? session.id === "d2-s1"
                      ? "Scenario: Justify Layer 3 Routed Mode vs Layer 2 Transparent Mode"
                      : session.id === "d2-s2"
                        ? "Scenario: Firewall Interface Binding & Management Hardening"
                        : session.id === "d2-s3"
                          ? "Scenario: Formulate Diagnostic Sequence for Inter-Zone Reachability"
                          : "Scenario: Prevent Lateral Movement via DMZ Isolation Policy"
                    : "Scenario: Restrict Administrative Access to DMZ"}
                </h3>
              </div>
              <Badge variant="outline" className="font-mono text-xs text-amber-800 bg-amber-50 border-amber-200">
                UNASSISTED MISSION
              </Badge>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                {isDay2
                  ? session.id === "d2-s1"
                    ? "Security architects require you to justify deploying sxl-fw01 in Routed Mode (Layer 3) across subnets 10.231.10.0/24 (WAN), 10.231.20.0/24 (LAN), and 10.231.30.0/24 (DMZ) rather than Transparent Mode (Layer 2 bridge). Record your technical justification detailing routing boundaries, TTL decrement, and broadcast domain isolation."
                    : session.id === "d2-s2"
                      ? "Security policy mandates that all firewall management access must be restricted to in-band LAN interface eth1 (10.231.20.254:22). Explain why allowing management access on WAN eth2 or DMZ eth0 introduces severe risk, and document the configuration controls that enforce this isolation."
                      : session.id === "d2-s3"
                        ? "An administrator reports that while IP addresses are assigned to eth0, eth1, and eth2, workstations in LAN cannot reach the DMZ web server. Formulate your systematic Layer 3 diagnostic sequence (link state, IP CIDR, default gateway, and net.ipv4.ip_forward)."
                        : "Security auditors identified a requirement to strictly prevent compromised DMZ web servers from probing internal LAN databases. Document your nftables rule formulation for 'iif eth0 oif eth1 counter drop' and explain why legitimate return traffic from DMZ to LAN is still permitted."
                  : "Security auditors flagged that SSH access to the application server (10.50.40.10:22) was previously open from all client subnets. Your objective is to explain how a stateful firewall handles rule ordering, and record your technical justification for why stateful return traffic should be allowed while unsolicited inbound connections from the DMZ to the LAN are blocked."}
              </p>

              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase text-gray-700">
                  Your Technical Justification & Verification Notes:
                </label>
                <textarea
                  value={missionEvidence}
                  onChange={(e) => setMissionEvidence(e.target.value)}
                  placeholder="Explain the difference between stateful connection tracking vs stateless packet filtering in this scenario..."
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 text-xs text-gray-900 font-mono focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none"
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
                  className="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-xs shadow-sm"
                >
                  <Check className="h-4 w-4 mr-1.5" />
                  {missionSubmitted ? "Evidence Submitted" : "Submit Mission Evidence"}
                </Button>
                {missionSubmitted && (
                  <span className="text-xs text-emerald-700 font-mono font-semibold">✓ Evidence Recorded</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <Button variant="outline" onClick={handlePrevStage} className="text-xs text-gray-600 border-gray-200 hover:text-gray-900">
                ← Guided Practical
              </Button>
              <Button onClick={handleNextStage} className="bg-red-600 text-white hover:bg-red-700 text-xs font-semibold shadow-sm">
                Proceed to Assessment →
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* STAGE 7: COMPETENCY ASSESSMENT */}
      {currentStage === 7 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card className="p-6 border-gray-200 bg-white shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="font-mono text-xs text-red-600 font-bold uppercase">
                  STAGE 7 • FORMAL COMPETENCY ASSESSMENT
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">
                  Knowledge Evaluation & Technical Reasoning
                </h3>
              </div>
              {assessmentScore !== null && (
                <Badge
                  className={`text-xs font-mono font-bold px-2.5 py-1 ${
                    assessmentScore >= 70
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-red-50 text-red-800 border-red-200"
                  }`}
                >
                  SCORE: {assessmentScore}% {assessmentScore >= 70 ? "PASS" : "REVISION REQUIRED"}
                </Badge>
              )}
            </div>

            {assessmentQuestions.length > 0 ? (
              <div className="space-y-6">
                {assessmentQuestions.map((q, qIdx) => (
                  <div key={q.id} className="rounded-lg border border-gray-200 bg-gray-50/60 p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-xs font-bold text-red-600">
                        Q{qIdx + 1}.
                      </span>
                      <p className="text-xs font-medium text-gray-900">{q.prompt}</p>
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
                                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold"
                                    : "border-red-600 bg-red-50 text-red-900"
                                  : "border-red-600 bg-red-50 text-red-900 font-semibold shadow-sm"
                                : assessmentSubmitted && isCorrect
                                  ? "border-emerald-500 bg-emerald-50/60 text-emerald-800 font-semibold"
                                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          >
                            <span>{opt}</span>
                            {assessmentSubmitted && isCorrect && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {assessmentSubmitted && (
                      <div className="pl-6 pt-2 text-[11px] text-gray-600 border-t border-gray-200">
                        <span className="font-mono font-bold text-red-600">Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}

                {!assessmentSubmitted && (
                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={handleGradeAssessment}
                      className="bg-red-600 text-white hover:bg-red-700 font-semibold text-xs shadow-sm"
                    >
                      Submit Assessment for Evaluation
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center space-y-3">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                <p className="text-xs text-gray-600">
                  Practical competency validated via simulator telemetry.
                </p>
                <Button onClick={() => markStageDone(7)} size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700">
                  Record Practical Competency
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <Button variant="outline" onClick={handlePrevStage} className="text-xs text-gray-600 border-gray-200 hover:text-gray-900">
                ← Mission Challenge
              </Button>
              <Button onClick={handleNextStage} className="bg-red-600 text-white hover:bg-red-700 text-xs font-semibold shadow-sm">
                Proceed to Session Summary →
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* STAGE 8: SESSION SUMMARY */}
      {currentStage === 8 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card className="p-8 border-gray-200 bg-white shadow-sm text-center space-y-6">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border border-red-200 text-red-600 shadow-sm mx-auto">
              <Award className="h-8 w-8" />
            </div>

            <div>
              <Badge variant="outline" className="font-mono text-xs text-red-600 border-red-200 bg-red-50 mb-2">
                SESSION CONCLUDED
              </Badge>
              <h2 className="text-2xl font-bold text-gray-900">{session.title}</h2>
              <p className="text-xs text-gray-600 mt-1 max-w-lg mx-auto">
                You have systematically navigated the 8 instructional stages of this session, observed live traffic filtering, and demonstrated competency.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
              <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-4">
                <span className="font-mono text-[10px] text-gray-500 uppercase font-bold">STATUS</span>
                <div className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>COMPLETED</span>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-4">
                <span className="font-mono text-[10px] text-gray-500 uppercase font-bold">ASSESSMENT</span>
                <div className="text-sm font-bold text-red-700 mt-1 font-mono">
                  {assessmentScore !== null ? `${assessmentScore}%` : "100% Practical"}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-4">
                <span className="font-mono text-[10px] text-gray-500 uppercase font-bold">CONTACT HOURS</span>
                <div className="text-sm font-bold text-gray-900 mt-1">1.5 Hours</div>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={onNavigateToSchedule}
                className="text-xs border-gray-200 text-gray-700 hover:text-gray-900"
              >
                Return to Course Schedule
              </Button>
              <Button
                onClick={handleFinishSession}
                className="gap-2 bg-red-600 text-white hover:bg-red-700 font-semibold text-xs px-6 shadow-sm"
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
