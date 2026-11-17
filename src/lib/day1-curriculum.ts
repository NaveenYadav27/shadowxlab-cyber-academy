import curriculumData from "@/data/day1-curriculum.json";
import assessmentBankData from "@/data/day1-assessment-bank.json";

export type Day1Concept = {
  id: string;
  number: number;
  title: string;
  sessionId: string;
  durationMinutes: number;
  learningObjectives: string[];
  technicalExplanation: string;
  architectureOrWorkflow: string;
  enterpriseExample: string;
  securityEngineeringRelevance: string;
  instructorExplanation: string;
  commonMistakes: string[];
  knowledgeCheckObjectives: string[];
  diagramSpecification: string;
  recommendedLab: string[];
  prerequisites: string[];
};

export type Day1Session = {
  id: string;
  index: number;
  title: string;
  start: string;
  end: string;
  kind: "lesson" | "lab" | "capstone" | "assessment";
  durationMinutes: number;
  description: string;
  conceptRange: [number, number];
  labReferences: string[];
};

export type Day1Lab = {
  id: string;
  number: number;
  title: string;
  linkedSessionIds: string[];
  conceptIds: string[];
  estimatedMinutes?: number;
  kind?: string;
  description?: string;
  objectives?: string[];
};

export type AssessmentQuestion = {
  id: string;
  conceptId: string;
  sessionId: string;
  prompt: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
};

export const DAY1_CURRICULUM = curriculumData;
export const DAY1_SESSIONS = curriculumData.day.sessions as Day1Session[];
export const DAY1_CONCEPTS = curriculumData.day.concepts as Day1Concept[];
export const DAY1_LABS = curriculumData.day.labs as Day1Lab[];

export const DAY1_ASSESSMENT_BANK = assessmentBankData;
export const DAY1_CONCEPT_CHECKS = assessmentBankData.conceptChecks as AssessmentQuestion[];
export const DAY1_SESSION_ASSESSMENTS = assessmentBankData.sessionAssessments as Record<
  string,
  AssessmentQuestion[]
>;
export const DAY1_FINAL_ASSESSMENT = assessmentBankData.finalAssessment as AssessmentQuestion[];

export function getConceptById(id: string): Day1Concept | undefined {
  return DAY1_CONCEPTS.find((c) => c.id === id);
}

export function getConceptsForSession(sessionId: string): Day1Concept[] {
  return DAY1_CONCEPTS.filter((c) => c.sessionId === sessionId);
}

export function getLabById(id: string): Day1Lab | undefined {
  return DAY1_LABS.find((l) => l.id === id);
}

export function getConceptChecksForConcept(conceptId: string): AssessmentQuestion[] {
  return DAY1_CONCEPT_CHECKS.filter((q) => q.conceptId === conceptId);
}

export function getSessionAssessment(sessionId: string): AssessmentQuestion[] {
  return DAY1_SESSION_ASSESSMENTS[sessionId] || [];
}

export function getPreviousConcept(conceptId: string): Day1Concept | undefined {
  const current = getConceptById(conceptId);
  if (!current) return undefined;
  const sessionConcepts = getConceptsForSession(current.sessionId);
  const index = sessionConcepts.findIndex((c) => c.id === conceptId);
  if (index > 0) return sessionConcepts[index - 1];
  return undefined;
}

export function getNextConcept(conceptId: string): Day1Concept | undefined {
  const current = getConceptById(conceptId);
  if (!current) return undefined;
  const sessionConcepts = getConceptsForSession(current.sessionId);
  const index = sessionConcepts.findIndex((c) => c.id === conceptId);
  if (index >= 0 && index < sessionConcepts.length - 1) return sessionConcepts[index + 1];
  return undefined;
}

export function checkPrerequisites(
  conceptId: string,
  completedConceptIds: string[] = [],
): { satisfied: boolean; missing: string[] } {
  const concept = getConceptById(conceptId);
  if (!concept || !concept.prerequisites || concept.prerequisites.length === 0) {
    return { satisfied: true, missing: [] };
  }
  const missing = concept.prerequisites.filter((reqId) => !completedConceptIds.includes(reqId));
  return { satisfied: missing.length === 0, missing };
}

export function calculateDay1Metrics(
  completedConceptIds: string[] = [],
  labScores: Record<string, number> = {},
  sessionScores: Record<string, number> = {},
  finalScore: number | null = null,
) {
  const validCompletedConcepts = completedConceptIds.filter((id) =>
    DAY1_CONCEPTS.some((c) => c.id === id),
  );
  const conceptCount = validCompletedConcepts.length;
  const totalConcepts = 48;
  const conceptPercentage = Math.round((conceptCount / totalConcepts) * 100);

  const passedLabs = DAY1_LABS.filter((lab) => (labScores[lab.id] ?? 0) >= 70).length;
  const totalLabs = DAY1_LABS.length; // 4

  const passedSessions = DAY1_SESSIONS.filter((s) => (sessionScores[s.id] ?? 0) >= 70).length;
  const totalSessions = DAY1_SESSIONS.length; // 4

  const finalPassed = (finalScore ?? 0) >= 70;

  // Weighted overall Day 1 mastery: Concepts 40%, Labs 30%, Session Quizzes 15%, Final Exam 15%
  const labAverage =
    totalLabs > 0 ? DAY1_LABS.reduce((acc, l) => acc + (labScores[l.id] ?? 0), 0) / totalLabs : 0;
  const sessionAverage =
    totalSessions > 0
      ? DAY1_SESSIONS.reduce((acc, s) => acc + (sessionScores[s.id] ?? 0), 0) / totalSessions
      : 0;
  const examScore = finalScore ?? 0;

  const overallScore = Math.round(
    conceptPercentage * 0.4 + labAverage * 0.3 + sessionAverage * 0.15 + examScore * 0.15,
  );

  return {
    conceptCount,
    totalConcepts,
    conceptPercentage,
    passedLabs,
    totalLabs,
    labScores,
    passedSessions,
    totalSessions,
    sessionScores,
    finalScore,
    finalPassed,
    overallScore,
  };
}
