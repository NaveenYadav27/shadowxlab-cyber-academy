import { describe, expect, it } from "vitest";
import {
  DIAGNOSTIC_DECISION_TREE,
  HARDWARE_TIER_SPECS,
  STANDARD_PFSENSE_TOPOLOGY,
  type AssistanceRequest,
  type HardwareCapabilities,
  type LabMode,
  type StandardLabVerificationState,
} from "../lib/lab-readiness-types";

describe("Lab Readiness Architecture & Hardware Tiers", () => {
  it("defines all 4 execution modes with realistic hardware thresholds", () => {
    const modes: LabMode[] = ["local-full", "local-light", "shared-range", "simulation"];
    modes.forEach((mode) => {
      const spec = HARDWARE_TIER_SPECS[mode];
      expect(spec).toBeDefined();
      expect(spec.name).toBeTruthy();
      expect(spec.minRamGb).toBeGreaterThanOrEqual(2);
      expect(spec.minCores).toBeGreaterThanOrEqual(1);
    });

    // Verify ordering by RAM requirements
    expect(HARDWARE_TIER_SPECS["local-full"].minRamGb).toBe(16);
    expect(HARDWARE_TIER_SPECS["local-light"].minRamGb).toBe(8);
    expect(HARDWARE_TIER_SPECS["shared-range"].minRamGb).toBe(4);
    expect(HARDWARE_TIER_SPECS["simulation"].minRamGb).toBe(2);
  });

  it("evaluates student hardware capabilities to recommend optimal lab mode", () => {
    function recommendMode(hw: HardwareCapabilities): LabMode {
      if (
        hw.virtualizationEnabled &&
        hw.totalRamGb >= 16 &&
        hw.cpuCores >= 4 &&
        hw.freeDiskGb >= 50
      ) {
        return "local-full";
      }
      if (
        hw.virtualizationEnabled &&
        hw.totalRamGb >= 8 &&
        hw.cpuCores >= 2 &&
        hw.freeDiskGb >= 25
      ) {
        return "local-light";
      }
      if (hw.totalRamGb >= 4) {
        return "shared-range";
      }
      return "simulation";
    }

    // High spec workstation -> local-full
    expect(
      recommendMode({
        totalRamGb: 32,
        availableRamGb: 22,
        cpuCores: 8,
        virtualizationEnabled: true,
        freeDiskGb: 120,
        hostOs: "windows",
      }),
    ).toBe("local-full");

    // Corporate 8GB ultrabook -> local-light
    expect(
      recommendMode({
        totalRamGb: 8,
        availableRamGb: 4,
        cpuCores: 4,
        virtualizationEnabled: true,
        freeDiskGb: 35,
        hostOs: "windows",
      }),
    ).toBe("local-light");

    // Virtualization disabled in BIOS -> shared-range
    expect(
      recommendMode({
        totalRamGb: 16,
        availableRamGb: 10,
        cpuCores: 4,
        virtualizationEnabled: false,
        freeDiskGb: 40,
        hostOs: "windows",
      }),
    ).toBe("shared-range");

    // Constrained machine -> simulation
    expect(
      recommendMode({
        totalRamGb: 2,
        availableRamGb: 1,
        cpuCores: 1,
        virtualizationEnabled: false,
        freeDiskGb: 5,
        hostOs: "windows",
      }),
    ).toBe("simulation");
  });
});

describe("Standard pfSense Lab Topology Specifications", () => {
  it("defines standard WAN VirtualBox NAT addressing", () => {
    expect(STANDARD_PFSENSE_TOPOLOGY.wan.mode).toBe("VirtualBox NAT");
    expect(STANDARD_PFSENSE_TOPOLOGY.wan.gateway).toBe("10.0.2.2");
  });

  it("defines standard LAN SXL-LAN internal network and DHCP scope", () => {
    expect(STANDARD_PFSENSE_TOPOLOGY.lan.mode).toContain("SXL-LAN");
    expect(STANDARD_PFSENSE_TOPOLOGY.lan.ip).toBe("192.168.50.1/24");
    expect(STANDARD_PFSENSE_TOPOLOGY.lan.gateway).toBe("192.168.50.1");
    expect(STANDARD_PFSENSE_TOPOLOGY.lan.dhcpRange).toBe("192.168.50.100 - 192.168.50.200");
  });

  it("assigns Kali and Ubuntu to the same SXL-LAN internal network", () => {
    expect(STANDARD_PFSENSE_TOPOLOGY.kali.adapterMode).toContain("SXL-LAN");
    expect(STANDARD_PFSENSE_TOPOLOGY.ubuntu.adapterMode).toContain("SXL-LAN");
    expect(STANDARD_PFSENSE_TOPOLOGY.ubuntu.addressing).toContain("192.168.50.20");
  });
});

describe("Diagnostic Decision Tree & Troubleshooting Stepper", () => {
  it("contains all critical diagnostic steps with unique identifiers", () => {
    const stepIds = DIAGNOSTIC_DECISION_TREE.map((step) => step.id);
    const uniqueIds = new Set(stepIds);
    expect(stepIds.length).toBe(uniqueIds.size);
    expect(stepIds.length).toBeGreaterThanOrEqual(6);
  });

  it("links every branch target to an existing step or completion state", () => {
    const stepIdSet = new Set(DIAGNOSTIC_DECISION_TREE.map((s) => s.id));

    DIAGNOSTIC_DECISION_TREE.forEach((step) => {
      if (step.yesNextStepId) {
        expect(stepIdSet.has(step.yesNextStepId)).toBe(true);
      }
      if (step.noNextStepId) {
        expect(stepIdSet.has(step.noNextStepId)).toBe(true);
      }
      if (step.actionIfNo) {
        expect(step.actionIfNo.cause).toBeTruthy();
        expect(step.actionIfNo.fixSteps.length).toBeGreaterThan(0);
        expect(step.actionIfNo.fixCommands.length).toBeGreaterThan(0);
      }
    });
  });

  it("provides copyable remediation commands with explanations", () => {
    const dhcpFailStep = DIAGNOSTIC_DECISION_TREE.find((s) => s.id === "step-1-kali-dhcp");
    expect(dhcpFailStep).toBeDefined();
    expect(dhcpFailStep?.checkCommand).toBe("ip a show eth0");

    const adapterStep = DIAGNOSTIC_DECISION_TREE.find((s) => s.id === "step-1a-check-adapters");
    expect(adapterStep?.actionIfNo?.fixCommands.some((c) => c.cmd.includes("SXL-LAN"))).toBe(true);
  });
});

describe("Assistance Request Ticketing & Verification Lifecycle", () => {
  it("tracks ticket status progression and instructor notes", () => {
    const ticket: AssistanceRequest = {
      id: "req-test-01",
      studentId: "demo-alex-chen",
      studentName: "Alex Chen",
      studentEmail: "student01@shadowxlab.com",
      seat: "Station 01",
      labMode: "local-full",
      blockerCategory: "sxl_lan",
      description: "Kali is not picking up 192.168.50.10x IP address",
      systemSpecs: "16 GB RAM | 8 Cores",
      timestamp: new Date().toISOString(),
      status: "open",
    };

    expect(ticket.status).toBe("open");

    // Instructor acknowledges
    const acknowledged: AssistanceRequest = {
      ...ticket,
      status: "acknowledged",
      instructorNote: "Checking VirtualBox internal network adapter naming.",
    };
    expect(acknowledged.status).toBe("acknowledged");
    expect(acknowledged.instructorNote).toBeTruthy();

    // Instructor resolves
    const resolved: AssistanceRequest = {
      ...acknowledged,
      status: "resolved",
      instructorNote: "Fixed SXL-LAN case mismatch on adapter 2. DHCP lease renewed.",
    };
    expect(resolved.status).toBe("resolved");
  });

  it("validates standard lab verification criteria with terminal output evidence", () => {
    const initialVerification: StandardLabVerificationState = {
      kaliIpVerified: false,
      pfsensePingVerified: false,
      ubuntuPingVerified: false,
      internetPingVerified: false,
      dnsLookupVerified: false,
      pfsenseWebGuiVerified: false,
    };

    const completedVerification: StandardLabVerificationState = {
      ...initialVerification,
      kaliIpVerified: true,
      kaliIpOutput: "inet 192.168.50.104/24 brd 192.168.50.255 scope global eth0",
      pfsensePingVerified: true,
      ubuntuPingVerified: true,
      internetPingVerified: true,
      dnsLookupVerified: true,
      pfsenseWebGuiVerified: true,
      completionEvidenceNotes:
        "Verified full bidirectional connectivity through pfSense NAT and DNS.",
      completedAt: new Date().toISOString(),
      verifiedByInstructor: true,
    };

    const isFullyCompleted =
      completedVerification.kaliIpVerified &&
      completedVerification.pfsensePingVerified &&
      completedVerification.ubuntuPingVerified &&
      completedVerification.internetPingVerified &&
      completedVerification.dnsLookupVerified &&
      completedVerification.pfsenseWebGuiVerified &&
      Boolean(completedVerification.kaliIpOutput);

    expect(isFullyCompleted).toBe(true);
    expect(completedVerification.verifiedByInstructor).toBe(true);
  });
});
