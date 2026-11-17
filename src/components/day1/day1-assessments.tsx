import React, { useState } from "react";
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DAY1_SESSIONS,
  DAY1_FINAL_ASSESSMENT,
  getSessionAssessment,
  getConceptById,
  type AssessmentQuestion,
} from "@/lib/day1-curriculum";

interface Day1AssessmentsProps {
  initialAssessmentType?: "session" | "final" | undefined;
  initialSessionId?: string | undefined;
  sessionScores: Record<string, number>;
  finalScore: number | null;
  onSaveSessionScore: (sessionId: string, score: number) => void;
  onSaveFinalScore: (score: number) => void;
  onNavigateToSchedule?: (() => void) | undefined;
}

export function Day1Assessments({
  initialAssessmentType = "session",
  initialSessionId = "d1-s1",
  sessionScores,
  finalScore,
  onSaveSessionScore,
  onSaveFinalScore,
  onNavigateToSchedule,
}: Day1AssessmentsProps) {
  const [assessmentType, setAssessmentType] = useState<"session" | "final">(initialAssessmentType);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(initialSessionId);

  // Active Questions
  const activeQuestions: AssessmentQuestion[] =
    assessmentType === "final" ? DAY1_FINAL_ASSESSMENT : getSessionAssessment(selectedSessionId);

  const activeTitle =
    assessmentType === "final"
      ? "Day 1 Comprehensive Final Examination"
      : `${DAY1_SESSIONS.find((s) => s.id === selectedSessionId)?.title ?? "Session"} Knowledge Assessment`;

  const currentScore =
    assessmentType === "final" ? finalScore : (sessionScores[selectedSessionId] ?? null);

  // Local answer tracking
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  const handleSelectAnswer = (qId: string, optIdx: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setCurrentQuestionIndex(0);
  };

  const handleSubmit = () => {
    let correct = 0;
    activeQuestions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct += 1;
      }
    });

    const score =
      activeQuestions.length > 0 ? Math.round((correct / activeQuestions.length) * 100) : 0;
    setSubmitted(true);

    if (assessmentType === "final") {
      onSaveFinalScore(score);
    } else {
      onSaveSessionScore(selectedSessionId, score);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const isPass = (currentScore ?? 0) >= 70;

  return (
    <div className="day1-assessments-wrapper space-y-6">
      {/* Assessment Mode Selector Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="font-mono text-xs font-bold text-cyan-400">ASSESSMENT ENGINE</div>
          <h2 className="text-xl font-bold text-foreground">Day 1 Technical Assessments</h2>
          <p className="text-xs text-muted-foreground">
            Rigorous knowledge verification across all 4 sessions (20 questions each) and the
            comprehensive Day 1 Final Exam (40 questions).
          </p>
        </div>
        {onNavigateToSchedule && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToSchedule}
            className="gap-2 text-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Schedule
          </Button>
        )}
      </div>

      {/* Tabs / Switcher */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {DAY1_SESSIONS.map((session, idx) => {
          const score = sessionScores[session.id];
          const hasScore = score !== undefined;
          const passed = (score ?? 0) >= 70;
          const isActive = assessmentType === "session" && selectedSessionId === session.id;

          return (
            <button
              key={session.id}
              onClick={() => {
                setAssessmentType("session");
                setSelectedSessionId(session.id);
                handleReset();
              }}
              className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all ${
                isActive
                  ? "border-cyan-500 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,229,255,0.1)]"
                  : "border-border/70 bg-card/40 hover:border-cyan-500/40"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-cyan-400">
                  SESSION {idx + 1}
                </span>
                {hasScore && (
                  <Badge
                    variant={passed ? "default" : "destructive"}
                    className="h-4 px-1.5 text-[9px] font-bold"
                  >
                    {score}%
                  </Badge>
                )}
              </div>
              <span className="text-xs font-semibold text-foreground line-clamp-1">
                {session.title}
              </span>
              <span className="text-[10px] text-muted-foreground">20 Questions</span>
            </button>
          );
        })}

        {/* Final Exam Tab */}
        <button
          onClick={() => {
            setAssessmentType("final");
            handleReset();
          }}
          className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all ${
            assessmentType === "final"
              ? "border-cyan-500 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,229,255,0.1)]"
              : "border-border/70 bg-card/40 hover:border-cyan-500/40"
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <span className="font-mono text-[10px] font-bold text-amber-400">FINAL EXAM</span>
            {finalScore !== null && (
              <Badge
                variant={finalScore >= 70 ? "default" : "destructive"}
                className="h-4 px-1.5 text-[9px] font-bold"
              >
                {finalScore}%
              </Badge>
            )}
          </div>
          <span className="text-xs font-semibold text-foreground line-clamp-1">
            Day 1 Final Exam
          </span>
          <span className="text-[10px] text-muted-foreground">40 Comprehensive Qs</span>
        </button>
      </div>

      {/* Assessment Body Card */}
      <Card className="border border-border/80 bg-card/60 p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">{activeTitle}</h3>
            <p className="text-xs text-muted-foreground">
              Pass threshold: 70% • Questions: {activeQuestions.length} • Answered: {answeredCount}{" "}
              / {activeQuestions.length}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {submitted && currentScore !== null && (
              <Badge
                variant={isPass ? "default" : "destructive"}
                className="px-3 py-1 text-xs font-bold"
              >
                Score: {currentScore}% — {isPass ? "PASSED" : "RETRY REQUIRED"}
              </Badge>
            )}

            {submitted ? (
              <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
                <RotateCcw className="h-3.5 w-3.5" />
                Retake Assessment
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={answeredCount === 0}
                className="gap-1.5 text-xs"
              >
                <ClipboardCheck className="h-3.5 w-3.5" />
                Submit Assessment ({answeredCount}/{activeQuestions.length})
              </Button>
            )}
          </div>
        </div>

        {/* Questions Stepper & List */}
        <div className="space-y-6">
          {activeQuestions.map((question, index) => {
            const selectedOpt = answers[question.id];
            const isGraded = submitted;
            const isCorrect = isGraded && selectedOpt === question.correctAnswer;
            const linkedConcept = getConceptById(question.conceptId);

            return (
              <div
                key={question.id}
                className={`rounded-lg border p-4 transition-all text-xs space-y-3 ${
                  isGraded
                    ? isCorrect
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : "border-red-500/40 bg-red-500/5"
                    : "border-border/60 bg-surface-2/20"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-cyan-400 font-bold">
                      {String(index + 1).padStart(2, "0")}.
                    </span>
                    <span className="font-medium text-foreground">{question.prompt}</span>
                  </div>
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
                  {question.options.map((opt, optIdx) => {
                    const isSelected = selectedOpt === optIdx;
                    const isRightOption = isGraded && optIdx === question.correctAnswer;

                    let btnClass =
                      "border-border/70 hover:border-cyan-500/50 hover:bg-surface-2/60";
                    if (isGraded) {
                      if (isRightOption) {
                        btnClass =
                          "border-emerald-500 bg-emerald-500/20 text-emerald-200 font-semibold";
                      } else if (isSelected && !isRightOption) {
                        btnClass = "border-red-500 bg-red-500/20 text-red-200";
                      } else {
                        btnClass = "border-border/40 opacity-60";
                      }
                    } else if (isSelected) {
                      btnClass = "border-cyan-500 bg-cyan-500/20 text-cyan-200 font-medium";
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectAnswer(question.id, optIdx)}
                        disabled={submitted}
                        className={`flex items-start gap-2 rounded-md border p-2.5 text-left text-xs transition-all ${btnClass}`}
                      >
                        <span className="font-mono font-bold text-muted-foreground">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span className="flex-1">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation and linked concept reference */}
                {isGraded && (
                  <div className="mt-2 rounded border border-border/40 bg-background/60 p-3 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {isCorrect ? "Correct!" : "Detailed Technical Explanation:"}
                      </span>
                      {linkedConcept && (
                        <span className="font-mono text-cyan-400 text-[10px]">
                          Ref: {linkedConcept.title}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{question.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Submit Footer */}
        {!submitted && (
          <div className="flex items-center justify-between border-t border-border/60 pt-4">
            <span className="text-xs text-muted-foreground">
              {answeredCount} of {activeQuestions.length} questions completed
            </span>
            <Button onClick={handleSubmit} disabled={answeredCount === 0} className="gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Submit All Answers
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
