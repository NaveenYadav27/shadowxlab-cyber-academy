import { describe, expect, it } from "vitest";
import {
  DAY1_CURRICULUM,
  DAY1_SESSIONS,
  DAY1_CONCEPTS,
  DAY1_LABS,
  DAY1_ASSESSMENT_BANK,
  DAY1_CONCEPT_CHECKS,
  DAY1_SESSION_ASSESSMENTS,
  DAY1_FINAL_ASSESSMENT,
  getConceptById,
  getConceptsForSession,
  getLabById,
  checkPrerequisites,
  calculateDay1Metrics,
} from "../lib/day1-curriculum";

describe("Day 1 Curriculum Structure", () => {
  it("contains exactly 4 sessions", () => {
    expect(DAY1_SESSIONS).toHaveLength(4);
    const sessionIds = DAY1_SESSIONS.map((s) => s.id);
    expect(sessionIds).toEqual(["d1-s1", "d1-s2", "d1-s3", "d1-s4"]);
  });

  it("contains exactly 12 concepts per session (48 total)", () => {
    let totalConcepts = 0;
    DAY1_SESSIONS.forEach((session) => {
      const sessionConcepts = getConceptsForSession(session.id);
      expect(sessionConcepts).toHaveLength(12);
      totalConcepts += sessionConcepts.length;
    });
    expect(totalConcepts).toBe(48);
    expect(DAY1_CONCEPTS).toHaveLength(48);
  });

  it("has unique concept IDs across all sessions", () => {
    const allConceptIds = DAY1_CONCEPTS.map((c) => c.id);
    const uniqueIds = new Set(allConceptIds);
    expect(uniqueIds.size).toBe(48);
  });

  it("has valid concept prerequisites", () => {
    const allConceptIds = new Set(DAY1_CONCEPTS.map((c) => c.id));

    DAY1_CONCEPTS.forEach((concept) => {
      concept.prerequisites.forEach((prereqId) => {
        expect(allConceptIds.has(prereqId)).toBe(true);
      });
    });
  });

  it("contains exactly 4 authoritative practical labs", () => {
    expect(DAY1_LABS).toHaveLength(4);
    const labIds = DAY1_LABS.map((l) => l.id);
    expect(labIds).toEqual(["day1-lab-01", "day1-lab-02", "day1-lab-03", "day1-lab-04"]);

    DAY1_LABS.forEach((lab) => {
      expect(lab.title.length).toBeGreaterThan(0);
      expect(lab.linkedSessionIds.length).toBeGreaterThanOrEqual(1);
      expect(lab.conceptIds.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("resolves concepts and labs by ID and checks prerequisites correctly", () => {
    const firstConcept = getConceptById("day1-concept-01");
    expect(firstConcept).toBeDefined();
    expect(firstConcept?.title).toBe("Security objectives and assurance");

    const firstLab = getLabById("day1-lab-01");
    expect(firstLab).toBeDefined();
    expect(firstLab?.title).toBe("Attack Surface & Threat Mapping");

    // First concept has no prerequisites
    const prereqs1 = checkPrerequisites("day1-concept-01", []);
    expect(prereqs1.satisfied).toBe(true);
    expect(prereqs1.missing).toHaveLength(0);

    // Concept with prerequisites requires them to be completed
    const conceptWithPrereqs = DAY1_CONCEPTS.find(
      (c) => c.prerequisites && c.prerequisites.length > 0,
    );
    if (conceptWithPrereqs) {
      const metWithout = checkPrerequisites(conceptWithPrereqs.id, []);
      expect(metWithout.satisfied).toBe(false);
      expect(metWithout.missing).toEqual(conceptWithPrereqs.prerequisites);

      const metWith = checkPrerequisites(conceptWithPrereqs.id, conceptWithPrereqs.prerequisites);
      expect(metWith.satisfied).toBe(true);
      expect(metWith.missing).toHaveLength(0);
    }
  });
});

describe("Day 1 Assessment Bank", () => {
  it("contains 240 concept check questions (48 concepts * 5 questions)", () => {
    expect(DAY1_CONCEPT_CHECKS).toHaveLength(240);

    DAY1_CONCEPT_CHECKS.forEach((q) => {
      expect(q.prompt.length).toBeGreaterThan(0);
      expect(q.options).toHaveLength(4);
      expect(q.correctAnswer).toBeGreaterThanOrEqual(0);
      expect(q.correctAnswer).toBeLessThanOrEqual(3);
      expect(q.explanation.length).toBeGreaterThan(0);
      expect(q.conceptId.length).toBeGreaterThan(0);
    });
  });

  it("contains 80 session assessment questions (4 sessions * 20 questions)", () => {
    const sessionKeys = Object.keys(DAY1_SESSION_ASSESSMENTS);
    expect(sessionKeys).toEqual(["d1-s1", "d1-s2", "d1-s3", "d1-s4"]);

    let totalSessionQuestions = 0;
    sessionKeys.forEach((key) => {
      const questions = DAY1_SESSION_ASSESSMENTS[key] ?? [];
      expect(questions).toHaveLength(20);
      totalSessionQuestions += questions.length;

      questions.forEach((q) => {
        expect(q.prompt.length).toBeGreaterThan(0);
        expect(q.options).toHaveLength(4);
        expect(q.correctAnswer).toBeGreaterThanOrEqual(0);
        expect(q.correctAnswer).toBeLessThanOrEqual(3);
        expect(q.explanation.length).toBeGreaterThan(0);
      });
    });

    expect(totalSessionQuestions).toBe(80);
  });

  it("contains 40 final comprehensive exam questions", () => {
    expect(DAY1_FINAL_ASSESSMENT).toHaveLength(40);

    DAY1_FINAL_ASSESSMENT.forEach((q) => {
      expect(q.prompt.length).toBeGreaterThan(0);
      expect(q.options).toHaveLength(4);
      expect(q.correctAnswer).toBeGreaterThanOrEqual(0);
      expect(q.correctAnswer).toBeLessThanOrEqual(3);
      expect(q.explanation.length).toBeGreaterThan(0);
    });
  });

  it("contains 360 authored questions in total across all banks", () => {
    const total =
      DAY1_CONCEPT_CHECKS.length +
      Object.values(DAY1_SESSION_ASSESSMENTS).reduce((sum, qs) => sum + qs.length, 0) +
      DAY1_FINAL_ASSESSMENT.length;

    expect(total).toBe(360);
  });
});

describe("Day 1 Progress Metric Calculations", () => {
  it("calculates 0% on initial empty state", () => {
    const metrics = calculateDay1Metrics([], {}, {}, null);
    expect(metrics.conceptCount).toBe(0);
    expect(metrics.totalConcepts).toBe(48);
    expect(metrics.conceptPercentage).toBe(0);
    expect(metrics.passedLabs).toBe(0);
    expect(metrics.totalLabs).toBe(4);
    expect(metrics.passedSessions).toBe(0);
    expect(metrics.totalSessions).toBe(4);
    expect(metrics.finalPassed).toBe(false);
    expect(metrics.overallScore).toBe(0);
  });

  it("calculates 100% when all requirements are met", () => {
    const allConceptIds = DAY1_CONCEPTS.map((c) => c.id);
    const labScores = {
      "day1-lab-01": 100,
      "day1-lab-02": 100,
      "day1-lab-03": 100,
      "day1-lab-04": 100,
    };
    const sessionScores = {
      "d1-s1": 100,
      "d1-s2": 100,
      "d1-s3": 100,
      "d1-s4": 100,
    };
    const finalScore = 100;

    const metrics = calculateDay1Metrics(allConceptIds, labScores, sessionScores, finalScore);
    expect(metrics.conceptCount).toBe(48);
    expect(metrics.conceptPercentage).toBe(100);
    expect(metrics.passedLabs).toBe(4);
    expect(metrics.passedSessions).toBe(4);
    expect(metrics.finalPassed).toBe(true);
    expect(metrics.overallScore).toBe(100);
  });

  it("calculates weighted partial progress accurately", () => {
    // 24 of 48 concepts = 50% * 0.40 = 20%
    const halfConcepts = DAY1_CONCEPTS.slice(0, 24).map((c) => c.id);
    // Labs average: (80 + 90 + 0 + 0) / 4 = 170 / 4 = 42.5 * 0.30 = 12.75%
    const labScores = { "day1-lab-01": 80, "day1-lab-02": 90 };
    // Sessions average: (80 + 0 + 0 + 0) / 4 = 20 * 0.15 = 3%
    const sessionScores = { "d1-s1": 80 };
    // Final exam: 0 * 0.15 = 0%
    const metrics = calculateDay1Metrics(halfConcepts, labScores, sessionScores, null);

    expect(metrics.conceptCount).toBe(24);
    expect(metrics.conceptPercentage).toBe(50);
    expect(metrics.passedLabs).toBe(2);
    expect(metrics.passedSessions).toBe(1);
    // 20 + 12.75 + 3 = 35.75 -> rounded to 36
    expect(metrics.overallScore).toBe(36);
  });
});
