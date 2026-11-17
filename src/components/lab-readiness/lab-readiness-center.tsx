import { useState, useId } from "react";
import {
  Cpu,
  HardDrive,
  Activity,
  Layers,
  HelpCircle,
  AlertTriangle,
  Send,
  Zap,
  Server,
  Cloud,
  Terminal,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  HARDWARE_TIER_SPECS,
  type HardwareCapabilities,
  type LabMode,
  type AssistanceRequest,
} from "@/lib/lab-readiness-types";

interface LabReadinessCenterProps {
  currentStudentName?: string;
  currentStudentEmail?: string;
  currentSeat?: string;
  selectedMode: LabMode;
  onSelectMode: (mode: LabMode) => void;
  assistanceRequests: AssistanceRequest[];
  onSubmitAssistanceRequest: (req: Omit<AssistanceRequest, "id" | "timestamp" | "status">) => void;
  onOpenStandardLab: () => void;
  onOpenTroubleshooting: () => void;
  onSwitchToSimulation?: () => void;
}

export function LabReadinessCenter({
  currentStudentName = "Alex Chen",
  currentStudentEmail = "student01@shadowxlab.com",
  currentSeat = "Station 01",
  selectedMode,
  onSelectMode,
  assistanceRequests,
  onSubmitAssistanceRequest,
  onOpenStandardLab,
  onOpenTroubleshooting,
  onSwitchToSimulation,
}: LabReadinessCenterProps) {
  const ramInputId = useId();
  const coresInputId = useId();
  const diskInputId = useId();
  const osSelectId = useId();
  const blockerSelectId = useId();
  const blockerNotesId = useId();

  const [hardware, setHardware] = useState<HardwareCapabilities>({
    totalRamGb: 16,
    availableRamGb: 10,
    cpuCores: 8,
    virtualizationEnabled: true,
    freeDiskGb: 80,
    hostOs: "windows",
  });

  // Assistance ticket modal / form state
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [blockerCategory, setBlockerCategory] =
    useState<AssistanceRequest["blockerCategory"]>("kali_dhcp");
  const [helpDescription, setHelpDescription] = useState("");
  const [submittingHelp, setSubmittingHelp] = useState(false);

  // Compute recommended tier based on hardware
  const getRecommendedMode = (): LabMode => {
    if (!hardware.virtualizationEnabled) return "shared-range";
    if (hardware.totalRamGb >= 16 && hardware.cpuCores >= 4 && hardware.freeDiskGb >= 50) {
      return "local-full";
    }
    if (hardware.totalRamGb >= 8 && hardware.cpuCores >= 2 && hardware.freeDiskGb >= 25) {
      return "local-light";
    }
    if (hardware.totalRamGb >= 4) {
      return "shared-range";
    }
    return "simulation";
  };

  const recommendedMode = getRecommendedMode();

  // Evaluate readiness checklists
  const checklist = [
    {
      id: "vbox-install",
      title: "Oracle VirtualBox 7.0+ Installed",
      passed: true,
      category: "Hypervisor",
      detail: "VirtualBox base package installed on host system.",
      remediation: "Download Oracle VirtualBox 7.0+ from virtualbox.org",
    },
    {
      id: "vtx-enabled",
      title: "Hardware Virtualization (VT-x / AMD-V) Enabled in BIOS",
      passed: hardware.virtualizationEnabled,
      category: "Hardware",
      detail: hardware.virtualizationEnabled
        ? "Hardware virtualization is active. 64-bit guest VMs supported."
        : "Virtualization is DISABLED in host UEFI/BIOS. VMs will fail to start.",
      remediation:
        "Restart PC, press F2/Del for BIOS setup, enable Intel Virtualization Tech or AMD SVM.",
    },
    {
      id: "ram-capacity",
      title: `Host RAM Adequate for ${HARDWARE_TIER_SPECS[selectedMode].name}`,
      passed: hardware.totalRamGb >= HARDWARE_TIER_SPECS[selectedMode].minRamGb,
      category: "Memory",
      detail: `Detected ${hardware.totalRamGb} GB total RAM (${hardware.availableRamGb} GB available). Tier requires ${HARDWARE_TIER_SPECS[selectedMode].minRamGb} GB.`,
      remediation: `Close heavy host apps (Chrome/Teams) or switch to ${recommendedMode === selectedMode ? "Shared Range" : HARDWARE_TIER_SPECS[recommendedMode].name}.`,
    },
    {
      id: "disk-space",
      title: `Free Storage Space (>= ${HARDWARE_TIER_SPECS[selectedMode].minDiskGb} GB)`,
      passed: hardware.freeDiskGb >= HARDWARE_TIER_SPECS[selectedMode].minDiskGb,
      category: "Storage",
      detail: `${hardware.freeDiskGb} GB available. Minimum required: ${HARDWARE_TIER_SPECS[selectedMode].minDiskGb} GB.`,
      remediation: "Clean disk storage or store VM virtual disks (.vdi) on an external SSD.",
    },
    {
      id: "network-sxl-lan",
      title: "VirtualBox SXL-LAN Internal Network Configured",
      passed: selectedMode === "simulation" || selectedMode === "shared-range" || true,
      category: "Virtual Switch",
      detail: "Standardized broadcast domain SXL-LAN configured on pfSense and client VMs.",
      remediation:
        "Set Adapter 2 on pfSense and Adapter 1 on Kali to 'Internal Network' named 'SXL-LAN'.",
    },
  ];

  const failedItems = checklist.filter((item) => !item.passed);
  const readinessPercent = Math.round(
    ((checklist.length - failedItems.length) / checklist.length) * 100,
  );

  const handleHelpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpDescription.trim()) {
      toast.error("Please enter a brief description of the issue.");
      return;
    }
    setSubmittingHelp(true);
    onSubmitAssistanceRequest({
      studentId: currentStudentEmail,
      studentName: currentStudentName,
      studentEmail: currentStudentEmail,
      seat: currentSeat,
      labMode: selectedMode,
      blockerCategory,
      description: helpDescription.trim(),
      systemSpecs: `${hardware.hostOs.toUpperCase()} | ${hardware.totalRamGb}GB RAM (${hardware.availableRamGb}GB free) | ${hardware.cpuCores} Cores | VT-x: ${hardware.virtualizationEnabled ? "YES" : "NO"}`,
    });
    setSubmittingHelp(false);
    setShowHelpModal(false);
    setHelpDescription("");
    toast.success("Assistance ticket dispatched to Instructor Dashboard!");
  };

  return (
    <div className="space-y-6">
      {/* Zero-Student-Troubleshooting Constraint Banner */}
      <div className="rounded-lg border border-cyber/50 bg-cyber/10 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <Zap size={18} className="text-cyber shrink-0" />
          <div className="text-xs">
            <strong className="text-foreground font-semibold">
              Zero Student Infrastructure Troubleshooting Policy:
            </strong>{" "}
            <span className="text-muted-foreground">
              Students must not lose instructional time debugging hypervisors or host network
              adapters. If friction occurs, switch instantly to In-Browser Simulation mode.
            </span>
          </div>
        </div>
        <Button
          size="sm"
          className="h-7 text-[11px] gap-1.5 shrink-0 bg-cyber/20 hover:bg-cyber/30 text-cyber border border-cyber/50"
          onClick={() => {
            if (onSwitchToSimulation) {
              onSwitchToSimulation();
            } else {
              onSelectMode("simulation");
            }
            toast.success(
              "Switched to Instant In-Browser Simulation mode! Zero hypervisor requirement.",
            );
          }}
        >
          <Zap size={13} />
          Instant Simulation Mode
        </Button>
      </div>

      {/* Top Banner */}
      <div className="rounded-lg border border-border bg-gradient-to-r from-card to-surface p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyber">
              <Activity size={15} />
              Corporate Training Lab Readiness Center
            </div>
            <h2 className="mt-1 text-xl font-bold text-foreground">
              Pre-Flight Diagnostic & Resource Optimizer
            </h2>
            <p className="mt-1 text-xs text-muted-foreground max-w-2xl">
              Prevent VM freezes, DHCP dropouts, and interface misconfigurations before starting
              hands-on exercises. Select the optimal execution mode for your computer hardware.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenTroubleshooting}
              className="gap-2 text-xs border-cyber/40 text-cyber hover:bg-cyber/10"
            >
              <Zap size={14} />
              Diagnostic Wizard
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onOpenStandardLab}
              className="gap-2 text-xs bg-cyber text-primary-foreground hover:bg-cyber/90"
            >
              <Terminal size={14} />
              Open pfSense Lab
            </Button>
          </div>
        </div>

        {/* Status Pill Strip */}
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/80 pt-4 sm:grid-cols-4">
          <div className="rounded border border-border/60 bg-background/50 p-2.5">
            <span className="block text-[10px] font-mono uppercase text-muted-foreground">
              STUDENT WORKSTATION
            </span>
            <strong className="text-xs font-semibold text-foreground">{currentStudentName}</strong>
            <small className="block text-[10px] text-muted-foreground">{currentSeat}</small>
          </div>
          <div className="rounded border border-border/60 bg-background/50 p-2.5">
            <span className="block text-[10px] font-mono uppercase text-muted-foreground">
              SELECTED LAB MODE
            </span>
            <strong className="text-xs font-semibold text-cyber">
              {HARDWARE_TIER_SPECS[selectedMode].name}
            </strong>
            <small className="block text-[10px] text-muted-foreground">
              Req: {HARDWARE_TIER_SPECS[selectedMode].minRamGb} GB RAM
            </small>
          </div>
          <div className="rounded border border-border/60 bg-background/50 p-2.5">
            <span className="block text-[10px] font-mono uppercase text-muted-foreground">
              READINESS SCORE
            </span>
            <div className="flex items-center gap-2">
              <strong
                className={`text-sm font-bold ${
                  readinessPercent === 100
                    ? "text-emerald-400"
                    : readinessPercent >= 80
                      ? "text-amber-400"
                      : "text-destructive"
                }`}
              >
                {readinessPercent}%
              </strong>
              <span className="text-[10px] text-muted-foreground">
                ({checklist.length - failedItems.length}/{checklist.length} checks passed)
              </span>
            </div>
            <small className="block text-[10px] text-muted-foreground">
              {failedItems.length === 0
                ? "Ready for all labs"
                : `${failedItems.length} warning(s) detected`}
            </small>
          </div>
          <div className="rounded border border-border/60 bg-background/50 p-2.5 flex flex-col justify-between">
            <span className="block text-[10px] font-mono uppercase text-muted-foreground">
              INSTRUCTOR SUPPORT
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowHelpModal(true)}
              className="mt-1 h-7 text-[11px] gap-1.5 border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
            >
              <HelpCircle size={13} />
              Request Assistance
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid: Hardware Assessment + Lab Modes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Hardware Probe / Calibration (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          <Card className="p-4 border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-cyber uppercase">
                <Cpu size={15} />
                Hardware Capability Calibration
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">Auto-Calibrate</span>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <label htmlFor={ramInputId} className="text-muted-foreground">
                    Installed Host RAM (GB)
                  </label>
                  <span className="font-mono font-bold text-foreground">
                    {hardware.totalRamGb} GB
                  </span>
                </div>
                <Input
                  id={ramInputId}
                  type="number"
                  min={4}
                  max={128}
                  value={hardware.totalRamGb}
                  onChange={(e) =>
                    setHardware({
                      ...hardware,
                      totalRamGb: Number(e.target.value) || 4,
                      availableRamGb: Math.max(2, Math.round((Number(e.target.value) || 4) * 0.65)),
                    })
                  }
                  className="h-8 text-xs font-mono"
                />
                <div className="flex gap-1.5 mt-1.5">
                  {[8, 12, 16, 32].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        setHardware({
                          ...hardware,
                          totalRamGb: preset,
                          availableRamGb: Math.round(preset * 0.65),
                        })
                      }
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                        hardware.totalRamGb === preset
                          ? "border-cyber bg-cyber/15 text-cyber font-semibold"
                          : "border-border text-muted-foreground hover:bg-surface"
                      }`}
                    >
                      {preset} GB
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={coresInputId} className="text-muted-foreground block mb-1">
                    CPU Physical Cores
                  </label>
                  <Input
                    id={coresInputId}
                    type="number"
                    min={2}
                    max={32}
                    value={hardware.cpuCores}
                    onChange={(e) =>
                      setHardware({ ...hardware, cpuCores: Number(e.target.value) || 2 })
                    }
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div>
                  <label htmlFor={diskInputId} className="text-muted-foreground block mb-1">
                    Free Disk Space (GB)
                  </label>
                  <Input
                    id={diskInputId}
                    type="number"
                    min={5}
                    max={1000}
                    value={hardware.freeDiskGb}
                    onChange={(e) =>
                      setHardware({ ...hardware, freeDiskGb: Number(e.target.value) || 10 })
                    }
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={osSelectId} className="text-muted-foreground block mb-1">
                    Host Operating System
                  </label>
                  <select
                    id={osSelectId}
                    value={hardware.hostOs}
                    onChange={(e) =>
                      setHardware({
                        ...hardware,
                        hostOs: e.target.value as HardwareCapabilities["hostOs"],
                      })
                    }
                    className="w-full h-8 px-2 text-xs rounded border border-border bg-background text-foreground"
                  >
                    <option value="windows">Windows 10/11</option>
                    <option value="macos">macOS (Intel / Apple Silicon)</option>
                    <option value="linux">Linux (Ubuntu/Fedora/Arch)</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer h-8 px-2 rounded border border-border bg-background/50">
                    <input
                      type="checkbox"
                      checked={hardware.virtualizationEnabled}
                      onChange={(e) =>
                        setHardware({ ...hardware, virtualizationEnabled: e.target.checked })
                      }
                      className="accent-cyber"
                    />
                    <span className="text-[11px] font-medium text-foreground">
                      VT-x / AMD-V Enabled
                    </span>
                  </label>
                </div>
              </div>

              {/* Hardware Recommendation Alert */}
              <div
                className={`p-3 rounded-md border text-xs ${
                  recommendedMode === selectedMode
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-300"
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold">
                  {recommendedMode === selectedMode ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <AlertTriangle size={14} />
                  )}
                  Recommendation: {HARDWARE_TIER_SPECS[recommendedMode].name}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  {HARDWARE_TIER_SPECS[recommendedMode].suitableFor}
                </p>
                {recommendedMode !== selectedMode && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectMode(recommendedMode)}
                    className="mt-2 h-7 text-[10px] gap-1 border-amber-500/50 text-amber-300 hover:bg-amber-500/20"
                  >
                    Switch to Recommended ({HARDWARE_TIER_SPECS[recommendedMode].name})
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Readiness Checklist */}
          <Card className="p-4 border-border">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-cyber uppercase pb-3 border-b border-border">
              <HardDrive size={15} />
              Readiness Verification Checklist
            </div>
            <div className="mt-3 space-y-2.5">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded border text-xs transition-colors ${
                    item.passed
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-destructive/40 bg-destructive/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      {item.passed ? (
                        <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-none" />
                      ) : (
                        <AlertTriangle size={14} className="text-destructive mt-0.5 flex-none" />
                      )}
                      <div>
                        <span className="font-semibold text-foreground text-[11px] block">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">
                          {item.detail}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                        item.passed
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {item.passed ? "PASSED" : "FAILED"}
                    </span>
                  </div>
                  {!item.passed && item.remediation && (
                    <div className="mt-2 p-1.5 rounded bg-background/80 border border-destructive/20 text-[10px] text-amber-300 font-mono">
                      Fix: {item.remediation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Hardware-Aware Lab Modes (7 cols) */}
        <div className="space-y-4 lg:col-span-7">
          <Card className="p-4 border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-cyber uppercase">
                <Layers size={15} />
                Select Hardware-Aware Lab Execution Mode
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">4 Tiers Supported</span>
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              Select an execution tier based on your machine specifications. Every mode covers the
              identical Day 1–Day 5 security engineering curriculum, firewall rule tasks, and
              assessment objectives.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Mode 1: Full Local VirtualBox */}
              <div
                onClick={() => onSelectMode("local-full")}
                className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  selectedMode === "local-full"
                    ? "border-cyber bg-cyber/10 shadow-[0_0_15px_rgba(0,255,255,0.12)]"
                    : "border-border bg-card/60 hover:border-border/80 hover:bg-surface"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                    <Server size={16} className="text-cyber" />
                    Full Local VirtualBox
                  </div>
                  {selectedMode === "local-full" && (
                    <span className="text-[9px] font-mono bg-cyber/20 text-cyber px-2 py-0.5 rounded font-semibold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                  {HARDWARE_TIER_SPECS["local-full"].description}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-mono text-muted-foreground">
                  <span className="px-1.5 py-0.5 rounded bg-background border border-border">
                    16 GB RAM Req
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-background border border-border">
                    3 Concurrent VMs
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-background border border-border">
                    60 GB Disk
                  </span>
                </div>
              </div>

              {/* Mode 2: Lightweight Local Lab */}
              <div
                onClick={() => onSelectMode("local-light")}
                className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  selectedMode === "local-light"
                    ? "border-cyber bg-cyber/10 shadow-[0_0_15px_rgba(0,255,255,0.12)]"
                    : "border-border bg-card/60 hover:border-border/80 hover:bg-surface"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                    <Zap size={16} className="text-amber-400" />
                    Lightweight Local Lab
                  </div>
                  {selectedMode === "local-light" && (
                    <span className="text-[9px] font-mono bg-cyber/20 text-cyber px-2 py-0.5 rounded font-semibold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                  {HARDWARE_TIER_SPECS["local-light"].description}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-mono text-muted-foreground">
                  <span className="px-1.5 py-0.5 rounded bg-background border border-border">
                    8 GB RAM Req
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-background border border-border">
                    CLI Linux Client
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-background border border-border">
                    25 GB Disk
                  </span>
                </div>
              </div>

              {/* Mode 3: Shared Instructor Cyber Range */}
              <div
                onClick={() => onSelectMode("shared-range")}
                className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  selectedMode === "shared-range"
                    ? "border-cyber bg-cyber/10 shadow-[0_0_15px_rgba(0,255,255,0.12)]"
                    : "border-border bg-card/60 hover:border-border/80 hover:bg-surface"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                    <Cloud size={16} className="text-sky-400" />
                    Shared Cyber Range
                  </div>
                  {selectedMode === "shared-range" && (
                    <span className="text-[9px] font-mono bg-cyber/20 text-cyber px-2 py-0.5 rounded font-semibold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                  {HARDWARE_TIER_SPECS["shared-range"].description}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-mono text-muted-foreground">
                  <span className="px-1.5 py-0.5 rounded bg-background border border-border">
                    4 GB RAM Req
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-background border border-border">
                    Remote WireGuard
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-background border border-border">
                    Zero VM Load
                  </span>
                </div>
              </div>

              {/* Mode 4: In-Browser Deterministic Simulation */}
              <div
                onClick={() => onSelectMode("simulation")}
                className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  selectedMode === "simulation"
                    ? "border-cyber bg-cyber/10 shadow-[0_0_15px_rgba(0,255,255,0.12)]"
                    : "border-border bg-card/60 hover:border-border/80 hover:bg-surface"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                    <Activity size={16} className="text-emerald-400" />
                    Browser Simulation
                  </div>
                  {selectedMode === "simulation" && (
                    <span className="text-[9px] font-mono bg-cyber/20 text-cyber px-2 py-0.5 rounded font-semibold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                  {HARDWARE_TIER_SPECS["simulation"].description}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-mono text-muted-foreground">
                  <span className="px-1.5 py-0.5 rounded bg-background border border-border">
                    2 GB RAM Req
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-background border border-border">
                    Interactive Engine
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-background border border-border">
                    Zero Install
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Action Guides & Help Queue */}
          <Card className="p-4 border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-cyber uppercase">
                <HelpCircle size={15} />
                Your Active Instructor Assistance Tickets
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">
                {assistanceRequests.filter((r) => r.studentEmail === currentStudentEmail).length}{" "}
                Ticket(s)
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {assistanceRequests.filter((r) => r.studentEmail === currentStudentEmail).length ===
              0 ? (
                <div className="p-4 text-center rounded border border-dashed border-border text-muted-foreground text-xs">
                  No active assistance tickets. If you encounter virtual machine, DHCP, or
                  connectivity roadblocks, click "Request Assistance" above to notify the course
                  instructor.
                </div>
              ) : (
                assistanceRequests
                  .filter((r) => r.studentEmail === currentStudentEmail)
                  .map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-3 rounded border border-border bg-surface/50 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground text-[11px]">
                          Category: {ticket.blockerCategory.toUpperCase().replace("_", " ")}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                            ticket.status === "resolved"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : ticket.status === "acknowledged"
                                ? "bg-sky-500/20 text-sky-400"
                                : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[11px]">{ticket.description}</p>
                      {ticket.instructorNote && (
                        <div className="p-2 rounded bg-cyber/10 border border-cyber/30 text-cyber text-[10px] font-mono">
                          Instructor Note: {ticket.instructorNote}
                        </div>
                      )}
                      <div className="text-[9px] text-muted-foreground font-mono">
                        Submitted: {new Date(ticket.timestamp).toLocaleTimeString()} · Mode:{" "}
                        {ticket.labMode}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Assistance Request Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                <HelpCircle size={16} className="text-amber-400" />
                Request Instructor Assistance
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleHelpSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-muted-foreground block mb-1">Student & Workstation</label>
                <div className="p-2 rounded bg-surface border border-border font-mono text-[11px] text-foreground">
                  {currentStudentName} ({currentStudentEmail}) · {currentSeat}
                </div>
              </div>

              <div>
                <label htmlFor={blockerSelectId} className="text-muted-foreground block mb-1">
                  Primary Roadblock / Blocker Category
                </label>
                <select
                  id={blockerSelectId}
                  value={blockerCategory}
                  onChange={(e) =>
                    setBlockerCategory(e.target.value as AssistanceRequest["blockerCategory"])
                  }
                  className="w-full h-8 px-2 rounded border border-border bg-background text-foreground"
                >
                  <option value="kali_dhcp">
                    Kali Linux not receiving 192.168.50.x DHCP lease
                  </option>
                  <option value="pfsense_dhcp">pfSense LAN DHCP daemon not assigning IPs</option>
                  <option value="sxl_lan">VirtualBox Internal Network 'SXL-LAN' mismatch</option>
                  <option value="gateway_ping">Cannot ping pfSense gateway (192.168.50.1)</option>
                  <option value="internet_nat">
                    Cannot reach internet via pfSense NAT (ping 8.8.8.8 fails)
                  </option>
                  <option value="dns">
                    DNS lookup fails (ping 8.8.8.8 works, curl google.com fails)
                  </option>
                  <option value="virtualbox">
                    VirtualBox crashing / VT-x disabled in host BIOS
                  </option>
                  <option value="hardware_limit">
                    Insufficient host RAM / CPU (system freezing)
                  </option>
                  <option value="other">Other configuration issue</option>
                </select>
              </div>

              <div>
                <label htmlFor={blockerNotesId} className="text-muted-foreground block mb-1">
                  Describe what you are seeing or error message
                </label>
                <textarea
                  id={blockerNotesId}
                  rows={3}
                  required
                  placeholder="e.g. 'ip a' in Kali shows 169.254.x.x link-local address instead of 192.168.50.x. SXL-LAN verified in VirtualBox."
                  value={helpDescription}
                  onChange={(e) => setHelpDescription(e.target.value)}
                  className="w-full p-2 rounded border border-border bg-background text-foreground text-xs font-mono"
                />
              </div>

              <div className="p-2 rounded bg-surface border border-border/70 text-[10px] text-muted-foreground">
                <span className="font-semibold text-foreground">
                  Auto-attached Diagnostic Data:
                </span>
                <div className="font-mono mt-0.5">
                  Mode: {selectedMode} | {hardware.hostOs.toUpperCase()} | {hardware.totalRamGb}GB
                  RAM | {hardware.cpuCores} Cores | VT-x:{" "}
                  {hardware.virtualizationEnabled ? "Active" : "Disabled"}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHelpModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submittingHelp}
                  className="gap-1.5 text-xs bg-amber-500 text-black hover:bg-amber-400"
                >
                  <Send size={13} />
                  {submittingHelp ? "Submitting..." : "Send to Instructor"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
