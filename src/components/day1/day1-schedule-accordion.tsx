import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  FlaskConical,
  HelpCircle,
  Clock,
  ArrowRight,
  AlertCircle,
  Play,
  Layers,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DAY1_SESSIONS,
  getConceptsForSession,
  getLabById,
  checkPrerequisites,
  type Day1Session,
  type Day1Concept,
} from "@/lib/day1-curriculum";

interface Day1ScheduleAccordionProps {
  completedSessionIds: string[];
  completedConceptIds: string[];
  sessionScores: Record<string, number>;
  labScores: Record<string, number>;
  onToggleSessionComplete: (sessionId: string) => void;
  onToggleConceptComplete?: (conceptId: string) => void;
  onSelectConcept: (conceptId: string) => void;
  onOpenLab: (labId: string) => void;
  onOpenSessionAssessment: (sessionId: string) => void;
  onStartSession?: (sessionId: string) => void;
}

export function Day1ScheduleAccordion({
  completedSessionIds,
  completedConceptIds,
  sessionScores,
  labScores,
  onToggleSessionComplete,
  onToggleConceptComplete,
  onSelectConcept,
  onOpenLab,
  onOpenSessionAssessment,
  onStartSession,
}: Day1ScheduleAccordionProps) {
  // Default first session open
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({
    "d1-s1": true,
  });

  const toggleSession = (sessionId: string) => {
    setExpandedSessions((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
  };

  return (
    <div className="day1-schedule-accordion space-y-4">
      {DAY1_SESSIONS.map((session, sessionIdx) => {
        const isExpanded = !!expandedSessions[session.id];
        const isSessionDone = completedSessionIds.includes(session.id);
        const concepts = getConceptsForSession(session.id);
        const completedCount = concepts.filter((c) => completedConceptIds.includes(c.id)).length;
        const conceptPercent = Math.round((completedCount / concepts.length) * 100);
        const assessmentScore = sessionScores[session.id];
        const isAssessmentPassed = (assessmentScore ?? 0) >= 70;

        return (
          <div
            key={session.id}
            className={`rounded-lg border transition-all ${
              isExpanded
                ? "border-cyan-500/50 bg-card/60 shadow-lg shadow-cyan-950/20"
                : "border-border/70 bg-card/30 hover:border-border"
            }`}
          >
            {/* Session Header Accordion Trigger */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:flex-nowrap">
              <button
                type="button"
                onClick={() => toggleSession(session.id)}
                aria-expanded={isExpanded}
                className="flex flex-1 items-center gap-3 text-left focus:outline-none"
              >
                <span className="text-cyan-400">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </span>
                <span className="font-mono text-sm font-bold text-muted-foreground">
                  {String(sessionIdx + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-cyan-400">
                      {session.start} – {session.end}
                    </span>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                      {session.kind}
                    </Badge>
                    {assessmentScore !== undefined && (
                      <Badge
                        variant={isAssessmentPassed ? "default" : "destructive"}
                        className="text-[10px]"
                      >
                        Quiz {assessmentScore}% {isAssessmentPassed ? "PASS" : "RETRY"}
                      </Badge>
                    )}
                  </div>
                  <h3 className="mt-1 text-sm font-bold text-foreground line-clamp-1">
                    {session.title}
                  </h3>
                </div>
              </button>

              {/* Progress & Quick Complete Button */}
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <span className="font-mono text-xs font-semibold text-foreground">
                    {completedCount} / {concepts.length} Concepts
                  </span>
                  <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full bg-cyan-400 transition-all"
                      style={{ width: `${conceptPercent}%` }}
                    />
                  </div>
                </div>

                {onStartSession && (
                  <Button
                    size="sm"
                    onClick={() => onStartSession(session.id)}
                    className="h-8 gap-1.5 bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold text-xs shadow-[0_0_10px_rgba(0,229,255,0.25)]"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Open Lesson</span>
                  </Button>
                )}

                <Button
                  variant={isSessionDone ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => onToggleSessionComplete(session.id)}
                  className="h-8 gap-1.5 text-xs"
                >
                  <CheckCircle2
                    className={`h-4 w-4 ${isSessionDone ? "text-cyan-400" : "text-muted-foreground"}`}
                  />
                  <span>{isSessionDone ? "Completed" : "Mark Done"}</span>
                </Button>
              </div>
            </div>

            {/* Accordion Expanded Body */}
            {isExpanded && (
              <div className="border-t border-border/60 p-4 space-y-4">
                {/* Session Description & Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-surface-2/30 p-3 text-xs">
                  <p className="max-w-2xl text-muted-foreground">{session.description}</p>
                  <div className="flex items-center gap-2">
                    {onStartSession && (
                      <Button
                        size="sm"
                        onClick={() => onStartSession(session.id)}
                        className="h-7 gap-1.5 text-xs bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold shadow-[0_0_8px_rgba(0,229,255,0.2)]"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Launch Session Engine (8 Stages)</span>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenSessionAssessment(session.id)}
                      className="h-7 gap-1.5 text-xs text-amber-300 hover:text-amber-200 border-amber-500/30 bg-amber-500/5"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      Session Assessment (20 Qs)
                    </Button>
                    {session.labReferences.length > 0 && session.labReferences[0] && (
                      <Button
                        size="sm"
                        onClick={() => {
                          const ref = session.labReferences[0];
                          if (ref) onOpenLab(ref);
                        }}
                        className="h-7 gap-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white"
                      >
                        <FlaskConical className="h-3.5 w-3.5" />
                        Open Lab 0{session.labReferences[0]?.replace("day1-lab-0", "") ?? "1"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* 12 Concepts List */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-1 text-[11px] font-mono text-muted-foreground">
                    <span>12 AUTHORITATIVE CURRICULUM CONCEPTS</span>
                    <span>Click any concept to open in-depth instructional view</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {concepts.map((concept, cIdx) => {
                      const isConceptDone = completedConceptIds.includes(concept.id);
                      const prereq = checkPrerequisites(concept.id, completedConceptIds);

                      return (
                        <div
                          key={concept.id}
                          className={`flex items-center justify-between gap-3 rounded-md border p-2.5 transition-all ${
                            isConceptDone
                              ? "border-emerald-500/30 bg-emerald-500/5"
                              : "border-border/60 bg-surface-2/20 hover:border-cyan-500/40 hover:bg-surface-2/40"
                          }`}
                        >
                          <div
                            onClick={() => onSelectConcept(concept.id)}
                            className="flex flex-1 items-center gap-3 cursor-pointer min-w-0"
                          >
                            <span className="font-mono text-xs font-semibold text-muted-foreground w-6">
                              {String(cIdx + 1).padStart(2, "0")}
                            </span>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-foreground hover:text-cyan-300 line-clamp-1">
                                  {concept.title}
                                </span>
                                {!prereq.satisfied && (
                                  <span
                                    title="Prerequisites not yet marked complete"
                                    className="flex items-center text-amber-400"
                                  >
                                    <AlertCircle className="h-3.5 w-3.5" />
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="hidden items-center gap-3 text-xs text-muted-foreground md:flex">
                              <span className="flex items-center gap-1 font-mono text-[11px]">
                                <Clock className="h-3 w-3" />
                                {concept.durationMinutes}m
                              </span>
                              <span className="font-mono text-[10px] text-cyan-400">
                                {concept.id}
                              </span>
                            </div>
                          </div>

                          {/* Quick Toggle / Open Buttons */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onSelectConcept(concept.id)}
                              className="h-7 text-xs text-cyan-400 hover:text-cyan-300"
                            >
                              Study
                              <ArrowRight className="ml-1 h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant={isConceptDone ? "secondary" : "ghost"}
                              size="icon"
                              onClick={() => onToggleConceptComplete?.(concept.id)}
                              className="h-7 w-7 text-xs"
                              title={isConceptDone ? "Mark Incomplete" : "Mark Complete"}
                            >
                              <CheckCircle2
                                className={`h-4 w-4 ${isConceptDone ? "text-cyan-400" : "text-muted-foreground"}`}
                              />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
