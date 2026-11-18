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
  Play,
  Check,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DAY2_SESSIONS,
  getDay2ConceptsForSession,
  getDay2LabById,
  type Day2Session,
  type Day2Concept,
} from "@/lib/day2-curriculum";

interface Day2ScheduleAccordionProps {
  completedSessionIds: string[];
  completedConceptIds: string[];
  sessionScores: Record<string, number>;
  labScores: Record<string, number>;
  onToggleSessionComplete: (sessionId: string) => void;
  onToggleConceptComplete?: (conceptId: string) => void;
  onSelectConcept?: (conceptId: string) => void;
  onOpenLab?: (labId: string) => void;
  onOpenSessionAssessment?: (sessionId: string) => void;
  onStartSession?: (sessionId: string) => void;
}

export function Day2ScheduleAccordion({
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
}: Day2ScheduleAccordionProps) {
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({
    "d2-s1": true,
  });

  const toggleSession = (sessionId: string) => {
    setExpandedSessions((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
  };

  return (
    <div className="day2-schedule-accordion space-y-4">
      {DAY2_SESSIONS.map((session, sessionIdx) => {
        const isExpanded = !!expandedSessions[session.id];
        const isSessionDone = completedSessionIds.includes(session.id);
        const concepts = getDay2ConceptsForSession(session.id);
        const completedCount = concepts.filter((c) => completedConceptIds.includes(c.id)).length;
        const conceptPercent =
          concepts.length > 0 ? Math.round((completedCount / concepts.length) * 100) : 0;
        const assessmentScore = sessionScores[session.id];
        const isAssessmentPassed = (assessmentScore ?? 0) >= 70;

        return (
          <div
            key={session.id}
            className={`rounded-xl border transition-all ${
              isExpanded
                ? "border-red-500/40 bg-white shadow-sm ring-1 ring-red-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            {/* Header / Trigger */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:flex-nowrap">
              <button
                type="button"
                onClick={() => toggleSession(session.id)}
                aria-expanded={isExpanded}
                className="flex flex-1 items-center gap-3 text-left focus:outline-none"
              >
                <span className="text-red-600">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </span>
                <span className="font-mono text-xs font-bold text-gray-500">
                  DAY 2 • S{sessionIdx + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                    {session.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 font-mono mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-red-600" />
                      {session.start} – {session.end} ({session.durationMinutes}m)
                    </span>
                    <span>•</span>
                    <span className="capitalize">{session.kind}</span>
                  </div>
                </div>
              </button>

              <div className="flex items-center gap-2">
                {isSessionDone && (
                  <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-mono">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                )}
                {assessmentScore !== undefined && (
                  <Badge
                    variant="outline"
                    className={`font-mono text-xs ${
                      isAssessmentPassed
                        ? "border-emerald-200 text-emerald-800 bg-emerald-50"
                        : "border-amber-200 text-amber-800 bg-amber-50"
                    }`}
                  >
                    Quiz: {assessmentScore}%
                  </Badge>
                )}
                {onStartSession && (
                  <Button
                    size="sm"
                    onClick={() => onStartSession(session.id)}
                    className="gap-1.5 bg-red-600 text-white hover:bg-red-700 font-bold text-xs h-8 shadow-sm"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Open Session</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Accordion Content */}
            {isExpanded && (
              <div className="border-t border-gray-100 bg-gray-50/50 p-4 space-y-4">
                <p className="text-xs text-gray-600 leading-relaxed">
                  {session.description}
                </p>

                {/* Concepts List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold uppercase text-red-600">
                      SESSION CONCEPTS ({concepts.length})
                    </span>
                    <span className="text-gray-500">{conceptPercent}% mastered</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {concepts.map((concept) => {
                      const isConceptDone = completedConceptIds.includes(concept.id);

                      return (
                        <div
                          key={concept.id}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 bg-white text-xs shadow-sm"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button
                              type="button"
                              onClick={() => onToggleConceptComplete?.(concept.id)}
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                                isConceptDone
                                  ? "bg-emerald-600 text-white border-emerald-600"
                                  : "border-gray-200 bg-white hover:border-red-400"
                              }`}
                            >
                              {isConceptDone && <Check className="h-3 w-3 stroke-[3]" />}
                            </button>
                            <span className="truncate text-gray-900 font-medium">
                              {concept.title}
                            </span>
                          </div>

                          {onSelectConcept && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onSelectConcept(concept.id)}
                              className="h-6 px-2 text-[10px] text-red-600 hover:text-red-700 font-semibold"
                            >
                              Study
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Lab & Assessment Quick Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 text-xs">
                  <div className="flex items-center gap-2">
                    {session.labReferences.map((labId) => {
                      const lab = getDay2LabById(labId);
                      const lScore = labScores[labId];

                      return (
                        <button
                          key={labId}
                          type="button"
                          onClick={() => onOpenLab?.(labId)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-gray-200 hover:border-red-300 text-[11px] font-mono text-gray-800 transition-colors shadow-sm"
                        >
                          <FlaskConical className="h-3 w-3 text-red-600" />
                          <span>{lab?.title ?? labId}</span>
                          {lScore !== undefined && (
                            <span className="text-emerald-700 font-bold ml-1">({lScore}%)</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    {onStartSession && (
                      <Button
                        size="sm"
                        onClick={() => onStartSession(session.id)}
                        className="h-7 text-xs gap-1.5 bg-red-600 text-white hover:bg-red-700 font-bold shadow-sm"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Launch Session Engine (8 Stages)</span>
                      </Button>
                    )}
                    {onOpenSessionAssessment && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenSessionAssessment(session.id)}
                        className="h-7 text-xs gap-1 border-gray-200 text-gray-700 hover:text-gray-900"
                      >
                        <HelpCircle className="h-3 w-3 text-red-600" />
                        <span>Take Assessment</span>
                      </Button>
                    )}
                    <Button
                      variant={isSessionDone ? "outline" : "secondary"}
                      size="sm"
                      onClick={() => onToggleSessionComplete(session.id)}
                      className="h-7 text-xs"
                    >
                      {isSessionDone ? "Mark Incomplete" : "Mark Complete"}
                    </Button>
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
