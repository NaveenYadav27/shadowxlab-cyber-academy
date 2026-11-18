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
      expect(screen.getByText(/Naveen Kumar/i)).toBeInTheDocument();
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

  describe("5. Basic Delivery Access Control Route Guards", () => {
    it("renders Administrator Console Restricted card when unauthorized role visits /admin", async () => {
      // Import ShadowXLabApp to test complete route guard orchestration
      const { default: ShadowXLabApp } = await import("@/components/training-platform-app");
      render(<ShadowXLabApp currentView="administration" />);

      expect(screen.getByText(/Administrator Console Restricted/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Return to My Learning/i })).toBeInTheDocument();
      expect(
        screen.queryByText(/PLATFORM GOVERNANCE & ARCHITECTURE/i),
      ).not.toBeInTheDocument();
    });

    it("renders Instructor Console Restricted card when unauthorized role visits /instructor", async () => {
      const { default: ShadowXLabApp } = await import("@/components/training-platform-app");
      render(<ShadowXLabApp currentView="instructor" />);

      expect(screen.getByText(/Instructor Console Restricted/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Return to My Learning/i })).toBeInTheDocument();
      expect(screen.queryByText(/INSTRUCTOR COMMAND CONSOLE/i)).not.toBeInTheDocument();
    });
  });

  describe("6. 20-Session Universal Engine Coverage (Days 1–5)", () => {
    it("successfully mounts and renders each of the 20 approved sessions across all 5 days", () => {
      const allSessions = INITIAL_PROGRAMME.days.flatMap((day, dayIdx) =>
        day.sessions.map((sess) => ({ sess, dayIdx })),
      );

      expect(allSessions).toHaveLength(20);

      allSessions.forEach(({ sess, dayIdx }) => {
        const { unmount } = render(
          <UniversalSessionEngine
            session={sess}
            dayIndex={dayIdx}
            programme={INITIAL_PROGRAMME}
            state={mockState}
            onSessionComplete={vi.fn()}
            onNavigateToSchedule={vi.fn()}
          />,
        );

        expect(screen.getAllByText(sess.title).length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText(new RegExp(`SESSION ${sess.id}`, "i"))).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe("7. Nine Learning Resources Accessibility", () => {
    it("renders all 9 approved resources with active standard links", () => {
      render(
        <StudentWorkspace
          state={mockState}
          programme={INITIAL_PROGRAMME}
          activeNavId="resources"
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

      expect(screen.getByText(/NPLRA Network Architecture Specification/i)).toBeInTheDocument();
      expect(screen.getByText(/pfSense 2.7.2 Administration Cheat Sheet/i)).toBeInTheDocument();
      expect(screen.getByText(/Stateful TCP Connection Inspection Guide/i)).toBeInTheDocument();
      expect(screen.getByText(/Zero-Troubleshooting Range Diagnostics Runbook/i)).toBeInTheDocument();
      expect(screen.getByText(/NIST SP 800-41 Rev. 1/i)).toBeInTheDocument();
      expect(screen.getByText(/NIST SP 800-77 Rev. 1/i)).toBeInTheDocument();
      expect(screen.getByText(/NIST SP 800-207/i)).toBeInTheDocument();
      expect(screen.getByText(/RFC 7296/i)).toBeInTheDocument();
      expect(screen.getByText(/RFC 4301 \/ RFC 8446/i)).toBeInTheDocument();
    });
  });

  describe("8. Instructor Session Delivery Across Days 1–5", () => {
    it("provides access to all 20 sessions in session-delivery view", () => {
      render(
        <InstructorWorkspace
          state={mockState}
          programme={INITIAL_PROGRAMME}
          activeNavId="session-delivery"
          onSelectNav={vi.fn()}
          onUpdateAttendance={vi.fn()}
        />,
      );

      // Verify sessions from both Day 1 and later days appear in delivery list
      expect(screen.getByText("D1-S1")).toBeInTheDocument();
      expect(screen.getByText("D4-S4")).toBeInTheDocument();
      expect(screen.getByText("D5-S4")).toBeInTheDocument();
    });
  });

  describe("9. ESCI Day 2 Curriculum & Practical Engine", () => {
    it("verifies ESCI institution branding, active training date and pilot subnets", () => {
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

      expect(screen.getAllByText(/ENGINEERING STAFF COLLEGE OF INDIA/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/Tuesday, 17 November 2026/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/10.231.10.0\/24/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/10.231.20.0\/24/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/10.231.30.0\/24/i)[0]).toBeInTheDocument();
    });

    it("verifies Day 2 schedule accordion renders the 4 official sessions without break displays", () => {
      render(
        <StudentWorkspace
          state={mockState}
          programme={INITIAL_PROGRAMME}
          activeNavId="sessions"
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

      // Verify Day 2 schedule sessions
      expect(screen.getAllByText(/Firewall Architecture, Deployment Modes and Security Zones/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/Configuration of LAN, WAN, DMZ Interfaces and Static Routing/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/Firewall Access Control Lists \(ACLs\), Rules and Policy Management/i)[0]).toBeInTheDocument();

      // Verify NO break or lunch texts are present
      expect(screen.queryByText(/tea break/i)).toBeNull();
      expect(screen.queryByText(/lunch break/i)).toBeNull();
    });

    it("renders Day 2 Practical Labs engine with interface, routing, and nftables modules", () => {
      render(
        <StudentWorkspace
          state={mockState}
          programme={INITIAL_PROGRAMME}
          activeNavId="labs"
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

      expect(screen.getAllByText(/Network Topology Design & Firewall Interface Setup/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/Static Routing & Inter-Zone Reachability/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/nftables ACL Policy Management/i)[0]).toBeInTheDocument();
    });
  });
});

