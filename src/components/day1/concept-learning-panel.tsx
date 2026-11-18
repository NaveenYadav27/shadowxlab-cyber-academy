import React, { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Building2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  XCircle,
  HelpCircle,
  Clock,
  Layers,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  type Day1Concept,
  getConceptById,
  getConceptsForSession,
  getPreviousConcept,
  getNextConcept,
  checkPrerequisites,
  getConceptChecksForConcept,
  type AssessmentQuestion,
} from "@/lib/day1-curriculum";
import {
  type Day2Concept,
  getDay2ConceptById,
  getDay2ConceptsForSession,
  getDay2ConceptChecksForConcept,
  checkDay2Prerequisites,
} from "@/lib/day2-curriculum";

interface ConceptLearningPanelProps {
  conceptId: string;
  completedConceptIds: string[];
  onToggleComplete: (conceptId: string) => void;
  onSelectConcept: (conceptId: string) => void;
  onOpenLab?: (labId: string) => void;
  onBackToSchedule: () => void;
}

export function ConceptLearningPanel({
  conceptId,
  completedConceptIds,
  onToggleComplete,
  onSelectConcept,
  onOpenLab,
  onBackToSchedule,
}: ConceptLearningPanelProps) {
  const isDay2 = conceptId.startsWith("d2-");
  const concept: (Day1Concept | Day2Concept) | undefined = isDay2
    ? getDay2ConceptById(conceptId)
    : getConceptById(conceptId);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState<boolean>(false);

  if (!concept) {
    return (
      <Card className="p-8 text-center">
        <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-amber-400" />
        <h3 className="text-lg font-semibold text-foreground">Concept Not Found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          The requested concept could not be loaded.
        </p>
        <Button className="mt-4" onClick={onBackToSchedule}>
          Return to Schedule
        </Button>
      </Card>
    );
  }

  const isCompleted = completedConceptIds.includes(concept.id);
  const prereqStatus = isDay2
    ? checkDay2Prerequisites(concept.id, completedConceptIds)
    : checkPrerequisites(concept.id, completedConceptIds);
  const sessionConcepts: (Day1Concept | Day2Concept)[] = isDay2
    ? getDay2ConceptsForSession(concept.sessionId)
    : getConceptsForSession(concept.sessionId);
  const conceptIndexInSession = sessionConcepts.findIndex((c) => c.id === concept.id);
  const prevConcept = conceptIndexInSession > 0 ? sessionConcepts[conceptIndexInSession - 1] : undefined;
  const nextConcept =
    conceptIndexInSession >= 0 && conceptIndexInSession < sessionConcepts.length - 1
      ? sessionConcepts[conceptIndexInSession + 1]
      : undefined;
  const questions: AssessmentQuestion[] = isDay2
    ? getDay2ConceptChecksForConcept(concept.id)
    : getConceptChecksForConcept(concept.id);

  const handleSelectAnswer = (questionId: string, optionIdx: number) => {
    if (submittedQuiz) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleGradeQuiz = () => {
    setSubmittedQuiz(true);
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setSubmittedQuiz(false);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correct += 1;
      }
    });
    return {
      correct,
      total: questions.length,
      percentage: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
    };
  };

  const quizScore = calculateScore();

  return (
    <div className="concept-learning-container space-y-6">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToSchedule}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Day 1 Schedule
          </Button>
          <span className="text-border">|</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Session: {concept.sessionId.toUpperCase()}
          </span>
          <span className="text-border">•</span>
          <span className="inline-flex items-center gap-1.5 rounded bg-muted/60 px-2 py-0.5 text-xs font-medium text-foreground">
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            Concept {conceptIndexInSession + 1} of {sessionConcepts.length} (Global #
            {concept.number})
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {concept.durationMinutes} min
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={isCompleted ? "default" : "outline"}
            size="sm"
            onClick={() => onToggleComplete(concept.id)}
            className="gap-2"
          >
            <CheckCircle2
              className={`h-4 w-4 ${isCompleted ? "text-background" : "text-cyan-400"}`}
            />
            {isCompleted ? "Completed" : "Mark as Complete"}
          </Button>
        </div>
      </div>

      {/* Prerequisite Alert if not satisfied */}
      {!prereqStatus.satisfied && (
        <div className="flex items-start gap-3 rounded-md border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-200">Recommended Prerequisites Incomplete</p>
            <p className="text-xs text-amber-300/90">
              For optimal comprehension, we recommend reviewing prior concepts:{" "}
              {prereqStatus.missing.map((reqId) => {
                const reqConcept = getConceptById(reqId);
                return (
                  <button
                    key={reqId}
                    onClick={() => onSelectConcept(reqId)}
                    className="mx-1 underline underline-offset-2 hover:text-white"
                  >
                    {reqConcept ? reqConcept.title : reqId}
                  </button>
                );
              })}
            </p>
          </div>
        </div>
      )}

      {/* Concept Header Card */}
      <Card className="border border-border/80 bg-card/60 p-6 shadow-lg backdrop-blur">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-cyan-500/10 px-2.5 py-1 text-xs font-mono font-semibold text-cyan-400 border border-cyan-500/20">
              {concept.id}
            </span>
            <span className="text-xs text-muted-foreground">
              Est. {concept.durationMinutes} Minutes
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {concept.title}
          </h1>

          {/* Learning Objectives */}
          <div className="mt-4 rounded-md border border-border/60 bg-surface-2/40 p-4">
            <h4 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
              <BookOpen className="h-4 w-4" />
              Core Learning Objectives
            </h4>
            <ul className="grid grid-cols-1 gap-2 text-sm text-foreground/90 sm:grid-cols-2">
              {concept.learningObjectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-400" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Architecture & Workflow Diagram Specification Card */}
      <Card className="border border-border/80 bg-card/40 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-cyan-400">
          <Layers className="h-4 w-4" />
          Architecture & Operational Workflow
        </h3>

        {/* Visual Workflow Spec Diagram Box */}
        <div className="mb-4 rounded-md border border-cyan-500/20 bg-background/80 p-5 shadow-inner">
          <div className="mb-3 flex items-center justify-between border-b border-border/60 pb-2 text-xs text-muted-foreground">
            <span className="font-mono text-cyan-400">TOPOLOGY & FLOW SPECIFICATION</span>
            <span className="rounded bg-muted px-2 py-0.5 text-[10px]">
              Deterministic Engineering View
            </span>
          </div>
          <div className="space-y-2 font-mono text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {concept.architectureOrWorkflow}
          </div>
          {concept.diagramSpecification && (
            <div className="mt-4 rounded border border-border/40 bg-muted/20 p-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Diagram Details: </span>
              {concept.diagramSpecification}
            </div>
          )}
        </div>
      </Card>

      {/* In-Depth Technical Explanation */}
      <Card className="border border-border/80 bg-card/40 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-cyan-400">
          <ShieldCheck className="h-4 w-4" />
          Technical Deep-Dive
        </h3>
        <div className="prose prose-invert max-w-none text-sm leading-relaxed text-foreground/90 whitespace-pre-line space-y-4">
          {concept.technicalExplanation}
        </div>
      </Card>

      {/* Enterprise Scenario & Engineering Relevance Dual Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Enterprise Scenario */}
        <Card className="border border-border/80 bg-card/40 p-5">
          <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
            <Building2 className="h-4 w-4" />
            Enterprise Deployment Scenario
          </h4>
          <p className="text-xs leading-relaxed text-foreground/80 whitespace-pre-line">
            {concept.enterpriseExample}
          </p>
        </Card>

        {/* Security Engineering Relevance */}
        <Card className="border border-border/80 bg-card/40 p-5">
          <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            Security Engineering Relevance
          </h4>
          <p className="text-xs leading-relaxed text-foreground/80 whitespace-pre-line">
            {concept.securityEngineeringRelevance}
          </p>
        </Card>
      </div>

      {/* Instructor Notes & Common Mistakes */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Instructor Explanations */}
        <Card className="border border-amber-500/20 bg-amber-500/5 p-5">
          <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Lightbulb className="h-4 w-4" />
            Instructor Insights & Field Notes
          </h4>
          <p className="text-xs leading-relaxed text-foreground/80 whitespace-pre-line">
            {concept.instructorExplanation}
          </p>
        </Card>

        {/* Common Mistakes */}
        <Card className="border border-red-500/20 bg-red-500/5 p-5">
          <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
            <AlertTriangle className="h-4 w-4" />
            Common Operational Mistakes
          </h4>
          <ul className="space-y-2 text-xs text-foreground/80">
            {(concept.commonMistakes ?? []).map((mistake, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Interactive Concept Knowledge Check (5 Questions) */}
      <Card className="border border-border/80 bg-card/60 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-cyan-400">
              <HelpCircle className="h-4 w-4" />
              Concept Knowledge Verification Check
            </h3>
            <p className="text-xs text-muted-foreground">
              Verify your operational understanding with 5 targeted scenario questions.
            </p>
          </div>
          {submittedQuiz && (
            <div className="flex items-center gap-2">
              <span
                className={`rounded px-2.5 py-1 text-xs font-bold ${
                  quizScore.percentage >= 70
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                Score: {quizScore.correct} / {quizScore.total} ({quizScore.percentage}%)
                {quizScore.percentage >= 70 ? " • PASSED" : " • REVIEW REQUIRED"}
              </span>
            </div>
          )}
        </div>

        {questions.length > 0 ? (
          <div className="space-y-6">
            {questions.map((q, qIndex) => {
              const selectedOpt = selectedAnswers[q.id];
              const isGraded = submittedQuiz;
              const isCorrect = isGraded && selectedOpt === q.correctAnswer;
              const isWrong =
                isGraded && selectedOpt !== undefined && selectedOpt !== q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className={`rounded-lg border p-4 transition-colors ${
                    isGraded
                      ? isCorrect
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-red-500/40 bg-red-500/5"
                      : "border-border/60 bg-surface-2/20"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">
                      <span className="mr-2 font-mono text-xs text-cyan-400">Q{qIndex + 1}.</span>
                      {q.prompt}
                    </p>
                    {isGraded && (
                      <span className="flex-shrink-0">
                        {isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {q.options.map((opt, optIndex) => {
                      const isOptionSelected = selectedOpt === optIndex;
                      const isOptionCorrect = isGraded && optIndex === q.correctAnswer;

                      let btnStyle =
                        "border-border/70 hover:border-cyan-500/50 hover:bg-surface-2/60";
                      if (isGraded) {
                        if (isOptionCorrect) {
                          btnStyle =
                            "border-emerald-500 bg-emerald-500/20 text-emerald-200 font-semibold";
                        } else if (isOptionSelected && !isOptionCorrect) {
                          btnStyle = "border-red-500 bg-red-500/20 text-red-200";
                        } else {
                          btnStyle = "border-border/40 opacity-60";
                        }
                      } else if (isOptionSelected) {
                        btnStyle = "border-cyan-500 bg-cyan-500/20 text-cyan-200 font-medium";
                      }

                      return (
                        <button
                          key={optIndex}
                          type="button"
                          onClick={() => handleSelectAnswer(q.id, optIndex)}
                          disabled={submittedQuiz}
                          className={`flex items-start gap-2.5 rounded-md border p-3 text-left text-xs transition-all ${btnStyle}`}
                        >
                          <span className="font-mono font-bold text-muted-foreground">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <span className="flex-1">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Technical Explanation after submission */}
                  {isGraded && (
                    <div className="mt-3 rounded border border-border/40 bg-background/60 p-3 text-xs">
                      <p className="font-semibold text-foreground">
                        {isCorrect ? "Correct!" : "Explanation:"}
                      </p>
                      <p className="mt-1 text-muted-foreground leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Quiz Submit / Reset Buttons */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                {Object.keys(selectedAnswers).length} of {questions.length} answered
              </span>
              <div className="flex gap-2">
                {submittedQuiz ? (
                  <Button variant="outline" size="sm" onClick={handleResetQuiz}>
                    Retry Knowledge Check
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleGradeQuiz}
                    disabled={Object.keys(selectedAnswers).length === 0}
                  >
                    Submit Answers
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No questions configured for this concept.</p>
        )}
      </Card>

      {/* Linked Lab Callout if applicable */}
      {concept.recommendedLab &&
        concept.recommendedLab.length > 0 &&
        onOpenLab &&
        concept.recommendedLab[0] && (
          <Card className="border border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 via-background to-background p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-cyan-500/10 p-2 text-cyan-400 border border-cyan-500/20">
                  <FlaskConical className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Linked Practical Simulation Lab
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Reinforce this concept with hands-on deterministic simulation:{" "}
                    {concept.recommendedLab.join(", ")}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  const targetLab = concept.recommendedLab?.[0];
                  if (targetLab) onOpenLab(targetLab);
                }}
                className="gap-2 bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                Launch Virtual Lab
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}

      {/* Bottom Session Concept Navigator */}
      <div className="flex items-center justify-between border-t border-border/80 pt-4">
        {prevConcept ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectConcept(prevConcept.id)}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous:{" "}
            {prevConcept.title.length > 30
              ? `${prevConcept.title.substring(0, 30)}...`
              : prevConcept.title}
          </Button>
        ) : (
          <span />
        )}

        <Button
          variant={isCompleted ? "secondary" : "default"}
          onClick={() => onToggleComplete(concept.id)}
          className="gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          {isCompleted ? "Mark Incomplete" : "Complete & Continue"}
        </Button>

        {nextConcept ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectConcept(nextConcept.id)}
            className="gap-2"
          >
            Next:{" "}
            {nextConcept.title.length > 30
              ? `${nextConcept.title.substring(0, 30)}...`
              : nextConcept.title}
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={onBackToSchedule} className="gap-2">
            Finish Session
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
