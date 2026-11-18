import React, { useState } from "react";
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Award,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Check,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DAY2_SESSIONS,
  DAY2_SESSION_ASSESSMENTS,
  DAY2_FINAL_ASSESSMENT,
  type AssessmentQuestion,
} from "@/lib/day2-curriculum";

interface Day2AssessmentsProps {
  sessionScores: Record<string, number>;
  finalScore: number | null;
  onSaveSessionScore: (sessionId: string, score: number) => void;
  onSaveFinalScore: (score: number) => void;
  onNavigateToSchedule?: () => void;
  initialSessionId?: string;
}

export function Day2Assessments({
  sessionScores,
  finalScore,
  onSaveSessionScore,
  onSaveFinalScore,
  onNavigateToSchedule,
  initialSessionId = "d2-s1",
}: Day2AssessmentsProps) {
  const [selectedAssessment, setSelectedAssessment] = useState<string>(initialSessionId);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [calculatedScore, setCalculatedScore] = useState<number | null>(null);

  // Get current question pool
  const questions: AssessmentQuestion[] =
    selectedAssessment === "final"
      ? DAY2_FINAL_ASSESSMENT
      : DAY2_SESSION_ASSESSMENTS[selectedAssessment] || [];

  const currentQ: AssessmentQuestion | undefined = questions[currentQuestionIndex];

  const handleSelectAssessment = (id: string) => {
    setSelectedAssessment(id);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsSubmitted(false);
    setCalculatedScore(null);
  };

  const handleAnswer = (questionId: string, optionIdx: number) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct += 1;
      }
    });

    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    setCalculatedScore(score);
    setIsSubmitted(true);

    if (selectedAssessment === "final") {
      onSaveFinalScore(score);
    } else {
      onSaveSessionScore(selectedAssessment, score);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setIsSubmitted(false);
    setCalculatedScore(null);
    setCurrentQuestionIndex(0);
  };

  return (
    <div className="day2-assessments space-y-6">
      {/* Assessment Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {DAY2_SESSIONS.map((session, idx) => {
          const isSelected = selectedAssessment === session.id;
          const score = sessionScores[session.id];
          const isPassed = (score ?? 0) >= 70;

          return (
            <button
              key={session.id}
              type="button"
              onClick={() => handleSelectAssessment(session.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? "border-cyan-500 bg-cyan-500/15 shadow-[0_0_15px_rgba(0,229,255,0.15)] text-foreground"
                  : isPassed
                    ? "border-emerald-500/40 bg-card/50 text-muted-foreground"
                    : "border-border/60 bg-card/30 text-muted-foreground hover:bg-card/60 hover:text-foreground"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-cyan-400 font-bold uppercase">
                  SESSION {idx + 1}
                </span>
                {score !== undefined ? (
                  <Badge className="bg-emerald-950/60 text-emerald-300 border-emerald-500/40 text-[9px] font-mono">
                    {score}%
                  </Badge>
                ) : (
                  <span className="text-[9px] font-mono text-muted-foreground">Pending</span>
                )}
              </div>
              <div className="text-xs font-bold text-foreground mt-1 line-clamp-1">
                {session.title}
              </div>
            </button>
          );
        })}

        {/* Final Exam Option */}
        <button
          type="button"
          onClick={() => handleSelectAssessment("final")}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedAssessment === "final"
              ? "border-amber-500 bg-amber-500/15 shadow-[0_0_15px_rgba(245,158,11,0.15)] text-foreground"
              : finalScore !== null
                ? "border-emerald-500/40 bg-card/50 text-muted-foreground"
                : "border-border/60 bg-card/30 text-muted-foreground hover:bg-card/60 hover:text-foreground"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-amber-400 font-bold uppercase">DAY 2 EXAM</span>
            {finalScore !== null ? (
              <Badge className="bg-emerald-950/60 text-emerald-300 border-emerald-500/40 text-[9px] font-mono">
                {finalScore}%
              </Badge>
            ) : (
              <span className="text-[9px] font-mono text-muted-foreground">Pending</span>
            )}
          </div>
          <div className="text-xs font-bold text-foreground mt-1">Day 2 Comprehensive</div>
        </button>
      </div>

      {/* Main Assessment Card */}
      <Card className="p-6 border-cyan-500/30 bg-card/60 space-y-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-cyan-400" />
              <span className="font-mono text-xs font-bold uppercase text-cyan-400">
                {selectedAssessment === "final"
                  ? "DAY 2 COMPREHENSIVE EXAMINATION"
                  : `SESSION ${selectedAssessment.toUpperCase()} KNOWLEDGE CHECK`}
              </span>
            </div>
            <h3 className="text-lg font-bold text-foreground mt-1">
              {selectedAssessment === "final"
                ? "Day 2 Firewall Architecture & Administration Capstone Assessment"
                : DAY2_SESSIONS.find((s) => s.id === selectedAssessment)?.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
              {questions.length} QUESTIONS • PASS SCORE: 70%
            </Badge>
            {calculatedScore !== null && (
              <Badge
                className={
                  calculatedScore >= 70
                    ? "bg-emerald-950 text-emerald-300 border-emerald-500/50 text-xs font-mono font-bold"
                    : "bg-rose-950 text-rose-300 border-rose-500/50 text-xs font-mono font-bold"
                }
              >
                SCORE: {calculatedScore}%
              </Badge>
            )}
          </div>
        </div>

        {/* Question Stepper / Item Display */}
        {currentQ ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
              <span>
                QUESTION {currentQuestionIndex + 1} OF {questions.length}
              </span>
              <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% COMPLETE</span>
            </div>

            <div className="rounded-xl border border-border/80 bg-slate-950 p-5 space-y-4">
              <h4 className="text-sm font-semibold text-foreground leading-relaxed">
                {currentQ.prompt}
              </h4>

              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((opt, optIdx) => {
                  const isChosen = answers[currentQ.id] === optIdx;
                  const isCorrectAnswer = currentQ.correctAnswer === optIdx;

                  let optionStyle =
                    "border-border/60 bg-card/40 text-muted-foreground hover:bg-card/70 hover:text-foreground";
                  if (isSubmitted) {
                    if (isCorrectAnswer) {
                      optionStyle = "border-emerald-500 bg-emerald-950/30 text-emerald-300 font-semibold";
                    } else if (isChosen && !isCorrectAnswer) {
                      optionStyle = "border-rose-500 bg-rose-950/30 text-rose-300 font-semibold";
                    }
                  } else if (isChosen) {
                    optionStyle =
                      "border-cyan-500 bg-cyan-500/15 text-cyan-300 font-semibold shadow-[0_0_10px_rgba(0,229,255,0.1)]";
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleAnswer(currentQ.id, optIdx)}
                      className={`w-full text-left p-3.5 rounded-lg border text-xs flex items-center justify-between transition-all ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-[10px] font-mono">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isSubmitted && isCorrectAnswer && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      )}
                      {isSubmitted && isChosen && !isCorrectAnswer && (
                        <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation upon submission */}
              {isSubmitted && (
                <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-4 text-xs space-y-1 animate-in fade-in">
                  <span className="font-mono font-bold uppercase text-cyan-400">
                    TECHNICAL EXPLANATION:
                  </span>
                  <p className="text-muted-foreground leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}
            </div>

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="gap-1 text-xs"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>

              <div className="flex items-center gap-2">
                {!isSubmitted ? (
                  <Button
                    onClick={handleSubmit}
                    className="gap-1.5 bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold text-xs h-9 shadow-[0_0_15px_rgba(0,229,255,0.25)]"
                  >
                    <Check className="h-4 w-4" />
                    <span>SUBMIT ASSESSMENT</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="gap-1.5 text-xs text-muted-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Retake</span>
                  </Button>
                )}

                {currentQuestionIndex < questions.length - 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))
                    }
                    className="gap-1 text-xs"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">No questions loaded.</div>
        )}
      </Card>
    </div>
  );
}
