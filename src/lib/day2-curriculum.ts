import curriculumData from "@/data/day2-curriculum.json";
import assessmentBankData from "@/data/day2-assessment-bank.json";

export type ConceptKnowledgeCheckItem = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export type Day2Concept = {
  id: string;
  number: number;
  title: string;
  sessionId: string;
  durationMinutes: number;
  learningObjectives: string[];
  // 10-point pedagogical structure
  conceptIntroduction?: string;
  purpose?: string;
  howItWorks?: string[];
  architectureOrWorkflow?: string;
  enterpriseExample?: string;
  configurationRelevance?: string;
  practicalRelevance?: string;
  commonMistakes?: string[];
  keyTakeaways?: string[];
  knowledgeCheck?: ConceptKnowledgeCheckItem[];
  // Legacy fields
  technicalExplanation?: string;
  securityEngineeringRelevance?: string;
  instructorExplanation?: string;
  knowledgeCheckObjectives?: string[];
  diagramSpecification?: string;
  recommendedLab?: string[];
  prerequisites?: string[];
};

export type Day2Session = {
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

export type Day2Lab = {
  id: string;
  number: number;
  title: string;
  dayId: string;
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

export const DAY2_CURRICULUM = curriculumData;
export const DAY2_SESSIONS = curriculumData.day.sessions as Day2Session[];
export const DAY2_CONCEPTS = curriculumData.day.concepts as Day2Concept[];
export const DAY2_LABS = curriculumData.day.labs as Day2Lab[];
export const DAY2_ADDRESSING = curriculumData.day.addressingScheme;

export const DAY2_ASSESSMENT_BANK = assessmentBankData;
export const DAY2_CONCEPT_CHECKS = assessmentBankData.conceptChecks as AssessmentQuestion[];
export const DAY2_SESSION_ASSESSMENTS = assessmentBankData.sessionAssessments as Record<
  string,
  AssessmentQuestion[]
>;
export const DAY2_FINAL_ASSESSMENT = assessmentBankData.finalAssessment as AssessmentQuestion[];

export function getDay2ConceptById(id: string): Day2Concept | undefined {
  return DAY2_CONCEPTS.find((c) => c.id === id);
}

export function getDay2ConceptsForSession(sessionId: string): Day2Concept[] {
  return DAY2_CONCEPTS.filter((c) => c.sessionId === sessionId);
}

export function getDay2LabById(id: string): Day2Lab | undefined {
  return DAY2_LABS.find((l) => l.id === id);
}

export function getDay2ConceptChecksForConcept(conceptId: string): AssessmentQuestion[] {
  return DAY2_CONCEPT_CHECKS.filter((q) => q.conceptId === conceptId);
}

export function getDay2SessionAssessment(sessionId: string): AssessmentQuestion[] {
  return DAY2_SESSION_ASSESSMENTS[sessionId] || [];
}

export function checkDay2Prerequisites(
  conceptId: string,
  completedConceptIds: string[],
): { satisfied: boolean; missing: string[] } {
  const concept = getDay2ConceptById(conceptId);
  if (!concept || !concept.prerequisites || concept.prerequisites.length === 0) {
    return { satisfied: true, missing: [] };
  }
  const missing = concept.prerequisites.filter((req) => !completedConceptIds.includes(req));
  return {
    satisfied: missing.length === 0,
    missing,
  };
}
