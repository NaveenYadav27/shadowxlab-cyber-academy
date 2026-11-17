import React, { useState } from "react";
import {
  Radio,
  Network,
  Shield,
  Activity,
  Server,
  Terminal,
  Layers,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Cpu,
  MonitorCheck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PacketJourneySimulator from "@/components/day1/packet-journey-simulator";
import { StandardPfSenseLab } from "@/components/lab-readiness/standard-pfsense-lab";
import { LabReadinessCenter } from "@/components/lab-readiness/lab-readiness-center";
import { LabTroubleshootingWizard } from "@/components/lab-readiness/lab-troubleshooting-wizard";
import type {
  LabMode,
  StandardLabVerificationState,
  AssistanceRequest,
} from "@/lib/lab-readiness-types";

interface UnifiedCyberRangeProps {
  selectedLabMode: LabMode;
  onSelectLabMode: (mode: LabMode) => void;
  standardLabVerification?: StandardLabVerificationState | undefined;
  onUpdateVerification?: ((state: Partial<StandardLabVerificationState>) => void) | undefined;
}

const defaultVerification: StandardLabVerificationState = {
  kaliIpVerified: false,
  pfsensePingVerified: false,
  ubuntuPingVerified: false,
  internetPingVerified: false,
  dnsLookupVerified: false,
  pfsenseWebGuiVerified: false,
};

export function UnifiedCyberRange({
  selectedLabMode,
  onSelectLabMode,
  standardLabVerification = defaultVerification,
  onUpdateVerification,
}: UnifiedCyberRangeProps) {
  const [activeTab, setActiveTab] = useState<
    "packet-journey" | "pfsense-console" | "topology" | "diagnostics" | "troubleshooting"
  >("packet-journey");

  const [assistanceRequests, setAssistanceRequests] = useState<AssistanceRequest[]>([]);

  const handleUpdateVerif = (update: Partial<StandardLabVerificationState>) => {
    if (onUpdateVerification) {
      onUpdateVerification(update);
    }
  };

  const handleSubmitAssistance = (req: Omit<AssistanceRequest, "id" | "timestamp" | "status">) => {
    const newReq: AssistanceRequest = {
      ...req,
      id: `req-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: "open",
    };
    setAssistanceRequests((prev) => [newReq, ...prev]);
    toast.success("Assistance ticket submitted to instructor queue.");
  };

  return (
    <div className="unified-cyber-range space-y-6 max-w-7xl mx-auto pb-12">
      {/* Range Mode Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-card via-card to-cyan-950/20 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,229,255,0.2)]">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
                SHADOWXLAB CYBER RANGE
              </span>
              <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/40 text-emerald-400">
                ZERO INFRASTRUCTURE TROUBLESHOOTING
              </Badge>
            </div>
            <h2 className="text-lg font-bold text-foreground">
              Government Enterprise Perimeter & Traffic Simulation
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={selectedLabMode === "simulation" ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectLabMode("simulation")}
            className="text-xs h-8"
          >
            Browser Simulation
          </Button>
          <Button
            variant={selectedLabMode === "local-full" ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectLabMode("local-full")}
            className="text-xs h-8"
          >
            Local VirtualBox
          </Button>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-3">
        {[
          { id: "packet-journey", label: "Packet Journey Simulator", icon: Zap },
          { id: "pfsense-console", label: "Standard pfSense Gateway", icon: Shield },
          { id: "diagnostics", label: "Hardware & Readiness Diagnostics", icon: MonitorCheck },
          { id: "troubleshooting", label: "Zero-Troubleshooting Wizard", icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition-all ${
                isActive
                  ? "border-cyan-500 bg-cyan-500/10 text-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.1)]"
                  : "border-border/60 bg-card/40 text-muted-foreground hover:bg-card/70 hover:text-foreground"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-cyan-400" : "text-muted-foreground"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Packet Journey Simulator */}
      {activeTab === "packet-journey" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <PacketJourneySimulator />
        </div>
      )}

      {/* Tab 2: Standard pfSense Lab Verification */}
      {activeTab === "pfsense-console" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <StandardPfSenseLab
            labMode={selectedLabMode}
            verificationState={standardLabVerification}
            onUpdateVerification={handleUpdateVerif}
            onSubmitEvidence={(evidence, notes) => {
              handleUpdateVerif({
                kaliIpOutput: evidence,
                completionEvidenceNotes: notes,
                completedAt: new Date().toISOString(),
              });
              toast.success("Lab verification evidence saved.");
            }}
            onOpenTroubleshooting={() => setActiveTab("troubleshooting")}
            onSwitchToSimulation={() => {
              onSelectLabMode("simulation");
              setActiveTab("packet-journey");
            }}
          />
        </div>
      )}

      {/* Tab 3: Lab Readiness Diagnostics */}
      {activeTab === "diagnostics" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <LabReadinessCenter
            selectedMode={selectedLabMode}
            onSelectMode={onSelectLabMode}
            assistanceRequests={assistanceRequests}
            onSubmitAssistanceRequest={handleSubmitAssistance}
            onOpenStandardLab={() => setActiveTab("pfsense-console")}
            onOpenTroubleshooting={() => setActiveTab("troubleshooting")}
            onSwitchToSimulation={() => {
              onSelectLabMode("simulation");
              setActiveTab("packet-journey");
            }}
          />
        </div>
      )}

      {/* Tab 4: Troubleshooting Wizard */}
      {activeTab === "troubleshooting" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <LabTroubleshootingWizard
            onOpenAssistanceModal={(category, defaultMsg) => {
              handleSubmitAssistance({
                studentId: "student-01",
                studentName: "Alex Chen",
                studentEmail: "student01@shadowxlab.com",
                seat: "Station 01",
                labMode: selectedLabMode,
                blockerCategory: category,
                description: defaultMsg,
                systemSpecs: "16 GB RAM • Intel VT-x Enabled",
              });
            }}
            onOpenStandardLab={() => setActiveTab("pfsense-console")}
          />
        </div>
      )}
    </div>
  );
}
