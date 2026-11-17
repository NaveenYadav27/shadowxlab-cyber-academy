import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UniversalSessionEngine } from "@/components/session-engine/universal-session-engine";
import { StudentWorkspace } from "@/components/workspaces/student-workspace";
import { InstructorWorkspace } from "@/components/workspaces/instructor-workspace";
import { AdminWorkspace } from "@/components/workspaces/admin-workspace";
import { createInitialState, INITIAL_PROGRAMME } from "@/lib/training-platform";

describe("ShadowXLab Platform Redesign — Master Acceptance Verification", () => {
  const mockState = createInitialState();
  const testSession = INITIAL_PROGRAMME.days[0]!.sessions[0]!;

  describe("1. Universal Session Learning Engine (8 Stages)", () => {
    it("renders Stage 1: Mission Briefing with enterprise threat context", () => {
      render(
        <UniversalSessionEngine
          session={testSession}
          dayIndex={0}
          programme={INITIAL_PROGRAMME}
          state={mockState}
          onSessionComplete={vi.fn()}
          onNavigateToSchedule={vi.fn()}
        />,
      );

      expect(screen.getByText(/Operational Briefing & Threat Context/i)).toBeInTheDocument();
      expect(screen.getByText(/National Public Land Records Agency/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Proceed to Concepts/i })).toBeInTheDocument();
    });

    it("navigates through all 8 instructional stages in sequence", () => {
      const onSessionComplete = vi.fn();
      render(
        <UniversalSessionEngine
          session={testSession}
          dayIndex={0}
          programme={INITIAL_PROGRAMME}
          state={mockState}
          onSessionComplete={onSessionComplete}
          onNavigateToSchedule={vi.fn()}
        />,
      );

      // Verify all 8 stage chips exist in the stepper
      expect(screen.getByText("Briefing")).toBeInTheDocument();
      expect(screen.getByText("Concepts")).toBeInTheDocument();
      expect(screen.getByText("Architecture")).toBeInTheDocument();
      expect(screen.getByText("Instructor Demo")).toBeInTheDocument();
      expect(screen.getByText("Guided Practical")).toBeInTheDocument();
      expect(screen.getByText("Mission")).toBeInTheDocument();
      expect(screen.getByText("Assessment")).toBeInTheDocument();
      expect(screen.getByText("Summary")).toBeInTheDocument();

      // Click to jump to Stage 3 Architecture
      fireEvent.click(screen.getByText("Architecture"));
      expect(screen.getByText(/10.50.0.0\/16 Subnet Segmentation/i)).toBeInTheDocument();

      // Click to jump to Stage 8 Summary
      fireEvent.click(screen.getByText("Summary"));
      expect(screen.getByText(/SESSION CONCLUDED/i)).toBeInTheDocument();

      const completeBtn = screen.getByRole("button", {
        name: /Mark Session Complete & Continue/i,
      });
      fireEvent.click(completeBtn);
      expect(onSessionComplete).toHaveBeenCalledWith(testSession.id);
    });
  });

  describe("2. Student Workspace & Landing Experience", () => {
    it("renders prominent CONTINUE LEARNING hero action and enrolled programme details", () => {
      render(
        <StudentWorkspace
          state={mockState}
          programme={INITIAL_PROGRAMME}
          activeNavId="my-learning"
          onSelectNav={vi.fn()}
          onToggleSessionComplete={vi.fn()}
          onToggleConceptComplete={vi.fn()}
          onSaveLabScore={vi.fn()}
          onSaveSessionAssessmentScore={vi.fn()}
          onSaveFinalScore={vi.fn()}
          onSelectLabMode={vi.fn()}
          onOpenReadiness={vi.fn()}
        />,
      );

      expect(screen.getByText("Firewall & VPN Security Administration")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /CONTINUE LEARNING/i })).toBeInTheDocument();
      expect(screen.getByText(/Naveen Kumar Yadav Loya/i)).toBeInTheDocument();
      expect(screen.getByText(/30 Contact Hours/i)).toBeInTheDocument();
    });

    it("launches the Universal Session Engine when CONTINUE LEARNING is clicked", () => {
      render(
        <StudentWorkspace
          state={mockState}
          programme={INITIAL_PROGRAMME}
          activeNavId="my-learning"
          onSelectNav={vi.fn()}
          onToggleSessionComplete={vi.fn()}
          onToggleConceptComplete={vi.fn()}
          onSaveLabScore={vi.fn()}
          onSaveSessionAssessmentScore={vi.fn()}
          onSaveFinalScore={vi.fn()}
          onSelectLabMode={vi.fn()}
          onOpenReadiness={vi.fn()}
        />,
      );

      const continueBtn = screen.getByRole("button", { name: /CONTINUE LEARNING/i });
      fireEvent.click(continueBtn);

      // Now inside the Universal Session Engine
      expect(screen.getByText(/Operational Briefing & Threat Context/i)).toBeInTheDocument();
    });
  });

  describe("3. Instructor Workspace", () => {
    it("renders cohort overview, broadcast announcer, and session delivery launcher", () => {
      const onSelectNav = vi.fn();
      render(
        <InstructorWorkspace
          state={mockState}
          programme={INITIAL_PROGRAMME}
          activeNavId="instructor-overview"
          onSelectNav={onSelectNav}
          onUpdateAttendance={vi.fn()}
        />,
      );

      expect(screen.getByText(/INSTRUCTOR COMMAND CONSOLE/i)).toBeInTheDocument();
      expect(screen.getByText(/NPLRA Cyber Defense Cohort Nov-2026/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Launch Live Delivery/i })).toBeInTheDocument();
    });

    it("renders attendance roster with student seats", () => {
      render(
        <InstructorWorkspace
          state={mockState}
          programme={INITIAL_PROGRAMME}
          activeNavId="attendance"
          onSelectNav={vi.fn()}
          onUpdateAttendance={vi.fn()}
        />,
      );

      expect(screen.getByText(/Classroom Attendance Record/i)).toBeInTheDocument();
      expect(screen.getByText("Station 01")).toBeInTheDocument();
      expect(screen.getByText("Alex Chen")).toBeInTheDocument();
    });
  });

  describe("4. Administrator Workspace", () => {
    it("renders platform governance overview and database health status", () => {
      render(
        <AdminWorkspace
          state={mockState}
          programme={INITIAL_PROGRAMME}
          activeNavId="admin-overview"
          onSelectNav={vi.fn()}
          onResetToSeed={vi.fn()}
        />,
      );

      expect(screen.getByText(/PLATFORM GOVERNANCE & ARCHITECTURE/i)).toBeInTheDocument();
      expect(screen.getByText(/Supabase PostgREST & RLS Active/i)).toBeInTheDocument();
      expect(screen.getByText(/sxl-net.shadowxlab.com/i)).toBeInTheDocument();
    });

    it("enforces non-negotiable curriculum preservation lock in curriculum-admin", () => {
      render(
        <AdminWorkspace
          state={mockState}
          programme={INITIAL_PROGRAMME}
          activeNavId="curriculum-admin"
          onSelectNav={vi.fn()}
          onResetToSeed={vi.fn()}
        />,
      );

      expect(
        screen.getByText(/NON-NEGOTIABLE CURRICULUM PRESERVATION LOCK/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/30 hours total/i)).toBeInTheDocument();
    });
  });
});
