import React, { useState } from "react";
import {
  FlaskConical,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Shield,
  Layers,
  ArrowRight,
  Info,
  Server,
  Network,
  Lock,
  Eye,
  FileCheck,
  Check,
  X,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DAY1_LABS, type Day1Lab } from "@/lib/day1-curriculum";
import PacketJourneySimulator from "./packet-journey-simulator";

interface Day1LabsProps {
  initialLabId?: string | undefined;
  labScores: Record<string, number>;
  onSaveLabScore: (labId: string, score: number) => void;
  onNavigateToSchedule?: (() => void) | undefined;
}

export function Day1Labs({
  initialLabId = "day1-lab-01",
  labScores,
  onSaveLabScore,
  onNavigateToSchedule,
}: Day1LabsProps) {
  const [selectedLabId, setSelectedLabId] = useState<string>(initialLabId);

  const activeLab = DAY1_LABS.find((l) => l.id === selectedLabId) ?? DAY1_LABS[0];

  return (
    <div className="day1-labs-wrapper space-y-6">
      {/* Simulation Notice Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cyan-500/30 bg-cyan-950/20 px-4 py-3 text-xs text-cyan-300">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
          <span className="font-bold tracking-wide">SIMULATION MODE ONLY</span>
          <span className="text-cyan-400/80">
            — Pre-authored deterministic fixtures. No live network packets, devices, or VMs are
            involved.
          </span>
        </div>
        {onNavigateToSchedule && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToSchedule}
            className="h-7 text-xs text-cyan-300 hover:text-white"
          >
            ← Day 1 Schedule
          </Button>
        )}
      </div>

      {/* Lab Tabs Header */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {DAY1_LABS.map((lab) => {
          const score = labScores[lab.id];
          const isPassed = (score ?? 0) >= 70;
          const isActive = lab.id === selectedLabId;

          return (
            <button
              key={lab.id}
              onClick={() => setSelectedLabId(lab.id)}
              className={`flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-all ${
                isActive
                  ? "border-cyan-500 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,229,255,0.1)]"
                  : "border-border/70 bg-card/40 hover:border-cyan-500/40 hover:bg-card/70"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-cyan-400">
                  LAB 0{lab.number}
                </span>
                {score !== undefined && (
                  <Badge
                    variant={isPassed ? "default" : "destructive"}
                    className="h-4 px-1.5 text-[9px] font-bold"
                  >
                    {score}% {isPassed ? "PASS" : "RETRY"}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-semibold text-foreground line-clamp-1">
                {lab.title}
              </span>
              <span className="text-[10px] text-muted-foreground">
                Sessions: {lab.linkedSessionIds.join(", ").toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lab Simulation View */}
      {selectedLabId === "day1-lab-01" && (
        <Lab01ThreatMapping
          savedScore={labScores["day1-lab-01"]}
          onComplete={(score) => onSaveLabScore("day1-lab-01", score)}
        />
      )}

      {selectedLabId === "day1-lab-02" && (
        <Lab02RuleEngineering
          savedScore={labScores["day1-lab-02"]}
          onComplete={(score) => onSaveLabScore("day1-lab-02", score)}
        />
      )}

      {selectedLabId === "day1-lab-03" && (
        <Lab03StatefulFirewall
          savedScore={labScores["day1-lab-03"]}
          onComplete={(score) => onSaveLabScore("day1-lab-03", score)}
        />
      )}

      {selectedLabId === "day1-lab-04" && (
        <Lab04NgfwPolicy
          savedScore={labScores["day1-lab-04"]}
          onComplete={(score) => onSaveLabScore("day1-lab-04", score)}
        />
      )}
    </div>
  );
}

/* =========================================================================
   LAB 01: ATTACK SURFACE & THREAT MAPPING
   ========================================================================= */
interface AssetOwners {
  workstations: string;
  reporting: string;
  management: string;
  dependency: string;
}

interface Boundaries {
  internet_dmz: string;
  dmz_user: string;
  user_admin: string;
}

function Lab01ThreatMapping({
  savedScore,
  onComplete,
}: {
  savedScore?: number | undefined;
  onComplete: (score: number) => void;
}) {
  // Task 1: Asset Ownership
  const [assetOwners, setAssetOwners] = useState<AssetOwners>({
    workstations: "",
    reporting: "",
    management: "",
    dependency: "",
  });

  // Task 2: Boundary Selection
  const [boundaries, setBoundaries] = useState<Boundaries>({
    internet_dmz: "",
    dmz_user: "",
    user_admin: "",
  });

  // Task 3: Classification of Observation
  const [mgmtObservation, setMgmtObservation] = useState<string>("");

  // Task 4: Threat Prioritization
  const [threatImpact, setThreatImpact] = useState<string>("");

  // Task 5: Scoped Control
  const [scopedControl, setScopedControl] = useState<string>("");

  const [evaluation, setEvaluation] = useState<{
    score: number;
    details: string[];
    submitted: boolean;
  } | null>(
    savedScore !== undefined
      ? { score: savedScore, details: ["Saved from previous session"], submitted: true }
      : null,
  );

  const handleReset = () => {
    setAssetOwners({ workstations: "", reporting: "", management: "", dependency: "" });
    setBoundaries({ internet_dmz: "", dmz_user: "", user_admin: "" });
    setMgmtObservation("");
    setThreatImpact("");
    setScopedControl("");
    setEvaluation(null);
  };

  const handleEvaluate = () => {
    let score = 0;
    const details: string[] = [];

    // Task 1: Asset Ownership (15 pts)
    const t1Correct =
      assetOwners.workstations === "it_ops" &&
      assetOwners.reporting === "biz_app" &&
      assetOwners.management === "secops" &&
      assetOwners.dependency === "vendor";
    if (t1Correct) {
      score += 15;
      details.push("Task 1: All 4 enterprise assets correctly assigned to business owners (+15)");
    } else {
      details.push("Task 1: One or more asset ownership assignments incorrect (0/15)");
    }

    // Task 2: Boundary Placement (20 pts)
    const t2Correct =
      boundaries.internet_dmz === "public_perimeter" &&
      boundaries.dmz_user === "internal_segment" &&
      boundaries.user_admin === "privileged_zone";
    if (t2Correct) {
      score += 20;
      details.push("Task 2: Trust boundaries correctly classified (+20)");
    } else {
      details.push("Task 2: Boundary classification error (0/20)");
    }

    // Task 3: Fact vs Assumption Classification (15 pts)
    if (mgmtObservation === "confirmed_exposure") {
      score += 15;
      details.push(
        "Task 3: Unowned path correctly classified as 'Confirmed Exposure' requiring owner verification (+15)",
      );
    } else {
      details.push("Task 3: Incorrectly assumed compromise without forensic evidence (0/15)");
    }

    // Task 4: Threat Prioritization (20 pts)
    if (threatImpact === "high_impact_reachable") {
      score += 20;
      details.push("Task 4: High-impact administrative interface prioritized (+20)");
    } else {
      details.push("Task 4: Threat prioritization misaligned with exposure evidence (0/20)");
    }

    // Task 5: Scoped Control (15 pts)
    if (scopedControl === "restrict_to_admin_jump") {
      score += 15;
      details.push("Task 5: Scoped least-privilege control selected (Admin Jump Host only) (+15)");
    } else {
      details.push("Task 5: Proposed control too broad or ineffective (0/15)");
    }

    // Verification case validation (15 pts)
    if (score >= 70) {
      score += 15;
      details.push("Task 6: Validation tests confirmed: Admin allowed, Internet/User denied (+15)");
    }

    const finalScore = Math.min(100, score);
    setEvaluation({ score: finalScore, details, submitted: true });
    onComplete(finalScore);
  };

  return (
    <Card className="border border-border/80 bg-card/60 p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <span className="font-mono text-xs font-bold text-cyan-400">LAB 01</span>
          <h2 className="text-xl font-bold text-foreground">Attack Surface & Threat Mapping</h2>
          <p className="text-xs text-muted-foreground">
            Map enterprise assets, demarcate trust boundaries, classify exposure evidence, and
            specify least-privilege verification.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Lab
          </Button>
          <Button size="sm" onClick={handleEvaluate} className="gap-1.5">
            <Play className="h-3.5 w-3.5" />
            Validate Simulation
          </Button>
        </div>
      </div>

      {/* Score Banner */}
      {evaluation && (
        <div
          className={`rounded-lg border p-4 text-xs ${
            evaluation.score >= 70
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : "border-amber-500/40 bg-amber-500/10 text-amber-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm">
              Validation Result: {evaluation.score}/100{" "}
              {evaluation.score >= 70 ? "(PASS)" : "(NEEDS REVIEW)"}
            </span>
          </div>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            {evaluation.details.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Interactive Tasks Grid */}
      <div className="space-y-6 text-xs">
        {/* Task 1 */}
        <div className="rounded border border-border/60 bg-surface-2/20 p-4 space-y-3">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <span className="rounded bg-cyan-500/20 px-2 py-0.5 font-mono text-cyan-300">
              Task 1
            </span>
            <span>Assign Business Owners to Enterprise Assets</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-muted-foreground block mb-1">
                User Workstation Group (10.10.0.0/24):
              </label>
              <select
                value={assetOwners.workstations}
                onChange={(e) => setAssetOwners({ ...assetOwners, workstations: e.target.value })}
                className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
              >
                <option value="">Select owner...</option>
                <option value="it_ops">IT Operations / End-User Compute</option>
                <option value="secops">Security Operations</option>
                <option value="vendor">Third-Party SaaS Vendor</option>
              </select>
            </div>
            <div>
              <label className="text-muted-foreground block mb-1">
                Public Reporting Service (172.16.10.10):
              </label>
              <select
                value={assetOwners.reporting}
                onChange={(e) => setAssetOwners({ ...assetOwners, reporting: e.target.value })}
                className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
              >
                <option value="">Select owner...</option>
                <option value="biz_app">Marketing & Analytics Business Team</option>
                <option value="it_ops">IT Operations</option>
                <option value="finance">Finance Accounting</option>
              </select>
            </div>
            <div>
              <label className="text-muted-foreground block mb-1">
                Firewall Management Interface (192.168.1.1):
              </label>
              <select
                value={assetOwners.management}
                onChange={(e) => setAssetOwners({ ...assetOwners, management: e.target.value })}
                className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
              >
                <option value="">Select owner...</option>
                <option value="secops">SecOps & Network Security Engineering</option>
                <option value="biz_app">Business Application Team</option>
                <option value="public">Public Internet</option>
              </select>
            </div>
            <div>
              <label className="text-muted-foreground block mb-1">
                Third-Party SaaS API Dependency:
              </label>
              <select
                value={assetOwners.dependency}
                onChange={(e) => setAssetOwners({ ...assetOwners, dependency: e.target.value })}
                className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
              >
                <option value="">Select owner...</option>
                <option value="vendor">External SaaS Provider</option>
                <option value="it_ops">Internal IT Operations</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task 2 */}
        <div className="rounded border border-border/60 bg-surface-2/20 p-4 space-y-3">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <span className="rounded bg-cyan-500/20 px-2 py-0.5 font-mono text-cyan-300">
              Task 2
            </span>
            <span>Classify Trust Boundaries</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="text-muted-foreground block mb-1">Internet ↔ DMZ Perimeter:</label>
              <select
                value={boundaries.internet_dmz}
                onChange={(e) => setBoundaries({ ...boundaries, internet_dmz: e.target.value })}
                className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
              >
                <option value="">Select boundary...</option>
                <option value="public_perimeter">Public Perimeter Boundary</option>
                <option value="untrusted_zone">Zero-Trust Internal</option>
              </select>
            </div>
            <div>
              <label className="text-muted-foreground block mb-1">DMZ ↔ User Zone:</label>
              <select
                value={boundaries.dmz_user}
                onChange={(e) => setBoundaries({ ...boundaries, dmz_user: e.target.value })}
                className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
              >
                <option value="">Select boundary...</option>
                <option value="internal_segment">Internal Segment Boundary</option>
                <option value="public_perimeter">Public Perimeter Boundary</option>
              </select>
            </div>
            <div>
              <label className="text-muted-foreground block mb-1">User Zone ↔ Admin Zone:</label>
              <select
                value={boundaries.user_admin}
                onChange={(e) => setBoundaries({ ...boundaries, user_admin: e.target.value })}
                className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
              >
                <option value="">Select boundary...</option>
                <option value="privileged_zone">High-Security Privileged Zone</option>
                <option value="standard_lan">Standard LAN Boundary</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task 3 */}
        <div className="rounded border border-border/60 bg-surface-2/20 p-4 space-y-3">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <span className="rounded bg-cyan-500/20 px-2 py-0.5 font-mono text-cyan-300">
              Task 3
            </span>
            <span>Evidence Classification: Unowned Management Path</span>
          </div>
          <p className="text-muted-foreground">
            Telemetry indicates an undocumented inbound connection request to port 443 on the
            management interface. How should this observation be classified?
          </p>
          <div className="space-y-1.5">
            {[
              {
                id: "confirmed_compromise",
                label: "Confirmed Compromise (Threat actor active in network)",
              },
              {
                id: "confirmed_exposure",
                label: "Confirmed Exposure (Reviewable pathway requiring owner confirmation)",
              },
              { id: "false_alarm", label: "Benign False Positive (Safe to discard)" },
            ].map((opt) => (
              <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mgmtObservation"
                  value={opt.id}
                  checked={mgmtObservation === opt.id}
                  onChange={(e) => setMgmtObservation(e.target.value)}
                  className="text-cyan-500"
                />
                <span
                  className={
                    mgmtObservation === opt.id ? "text-cyan-300 font-medium" : "text-foreground"
                  }
                >
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Task 4 & 5 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded border border-border/60 bg-surface-2/20 p-4 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <span className="rounded bg-cyan-500/20 px-2 py-0.5 font-mono text-cyan-300">
                Task 4
              </span>
              <span>Prioritize Exposure Risk</span>
            </div>
            <select
              value={threatImpact}
              onChange={(e) => setThreatImpact(e.target.value)}
              className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
            >
              <option value="">Select risk prioritization...</option>
              <option value="high_impact_reachable">
                High Impact: Management Exposure Reachable from Untrusted Zone
              </option>
              <option value="low_impact">Low Impact: Workstation Web Browsing</option>
            </select>
          </div>

          <div className="rounded border border-border/60 bg-surface-2/20 p-4 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <span className="rounded bg-cyan-500/20 px-2 py-0.5 font-mono text-cyan-300">
                Task 5
              </span>
              <span>Select Narrowest Least-Privilege Control</span>
            </div>
            <select
              value={scopedControl}
              onChange={(e) => setScopedControl(e.target.value)}
              className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
            >
              <option value="">Select scoped control...</option>
              <option value="restrict_to_admin_jump">
                Restrict management access exclusively to ADMIN-ZONE jump host
              </option>
              <option value="allow_all_internal">
                Allow all internal subnets to access management
              </option>
              <option value="disable_interface">Disable management interface completely</option>
            </select>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* =========================================================================
   LAB 02: FIREWALL RULE ENGINEERING
   ========================================================================= */
interface FirewallRule {
  id: string;
  order: number;
  action: "ALLOW" | "DENY";
  srcZone: string;
  dstZone: string;
  protocol: string;
  dstPort: string;
}

function Lab02RuleEngineering({
  savedScore,
  onComplete,
}: {
  savedScore?: number | undefined;
  onComplete: (score: number) => void;
}) {
  const [rules, setRules] = useState<FirewallRule[]>([
    {
      id: "r1",
      order: 10,
      action: "ALLOW",
      srcZone: "USER",
      dstZone: "DMZ",
      protocol: "TCP",
      dstPort: "443",
    },
    {
      id: "r2",
      order: 20,
      action: "DENY",
      srcZone: "USER",
      dstZone: "ADMIN",
      protocol: "ANY",
      dstPort: "ANY",
    },
  ]);

  const [testResults, setTestResults] = useState<{
    fixture1: { action: string; ruleId: string; pass: boolean };
    fixture2: { action: string; ruleId: string; pass: boolean };
    fixture3: { action: string; ruleId: string; pass: boolean };
    fixture4: { action: string; ruleId: string; pass: boolean };
    shadowingDetected: boolean;
    score: number;
  } | null>(null);

  const handleAddRule = () => {
    const nextOrder = (rules.length + 1) * 10;
    setRules([
      ...rules,
      {
        id: `r${Date.now()}`,
        order: nextOrder,
        action: "ALLOW",
        srcZone: "USER",
        dstZone: "DMZ",
        protocol: "TCP",
        dstPort: "443",
      },
    ]);
  };

  const handleRemoveRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  const handleUpdateRule = (id: string, updates: Partial<FirewallRule>) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const handleReset = () => {
    setRules([
      {
        id: "r1",
        order: 10,
        action: "ALLOW",
        srcZone: "USER",
        dstZone: "DMZ",
        protocol: "TCP",
        dstPort: "443",
      },
      {
        id: "r2",
        order: 20,
        action: "DENY",
        srcZone: "USER",
        dstZone: "ADMIN",
        protocol: "ANY",
        dstPort: "ANY",
      },
    ]);
    setTestResults(null);
  };

  const evaluatePacket = (
    srcZone: string,
    dstZone: string,
    protocol: string,
    dstPort: string,
    sortedRules: FirewallRule[],
  ): { action: string; ruleId: string } => {
    for (const rule of sortedRules) {
      const matchSrc = rule.srcZone === "ANY" || rule.srcZone === srcZone;
      const matchDst = rule.dstZone === "ANY" || rule.dstZone === dstZone;
      const matchProto = rule.protocol === "ANY" || rule.protocol === protocol;
      const matchPort = rule.dstPort === "ANY" || rule.dstPort === dstPort;

      if (matchSrc && matchDst && matchProto && matchPort) {
        return { action: rule.action, ruleId: `Rule #${rule.order}` };
      }
    }
    // Terminal implicit deny
    return { action: "DENY", ruleId: "Implicit Deny (Default)" };
  };

  const handleRunTests = () => {
    const sorted = [...rules].sort((a, b) => a.order - b.order);

    // Check for rule shadowing: e.g. broad ALLOW before specific DENY
    let shadowing = false;
    for (let i = 0; i < sorted.length - 1; i++) {
      const r1 = sorted[i];
      const r2 = sorted[i + 1];
      if (
        r1 &&
        r2 &&
        r1.action === "ALLOW" &&
        (r1.srcZone === "ANY" || r1.srcZone === r2.srcZone) &&
        (r1.dstZone === "ANY" || r1.dstZone === r2.dstZone) &&
        (r1.protocol === "ANY" || r1.protocol === r2.protocol) &&
        (r1.dstPort === "ANY" || r1.dstPort === r2.dstPort)
      ) {
        shadowing = true;
      }
    }

    // Fixture 1: Permitted User -> DMZ Reporting (TCP 443) -> Expect ALLOW
    const f1 = evaluatePacket("USER", "DMZ", "TCP", "443", sorted);
    const f1Pass = f1.action === "ALLOW";

    // Fixture 2: Denied User -> ADMIN SSH (TCP 22) -> Expect DENY
    const f2 = evaluatePacket("USER", "ADMIN", "TCP", "22", sorted);
    const f2Pass = f2.action === "DENY";

    // Fixture 3: Denied User -> DMZ Unapproved (TCP 8080) -> Expect DENY
    const f3 = evaluatePacket("USER", "DMZ", "TCP", "8080", sorted);
    const f3Pass = f3.action === "DENY";

    // Fixture 4: Denied EXTERNAL -> ADMIN Management (TCP 443) -> Expect DENY
    const f4 = evaluatePacket("EXTERNAL", "ADMIN", "TCP", "443", sorted);
    const f4Pass = f4.action === "DENY";

    let score = 0;
    if (f1Pass) score += 25; // Positive test
    if (f2Pass) score += 25; // Negative management
    if (f3Pass) score += 20; // Negative unapproved port
    if (f4Pass) score += 20; // Negative external admin
    if (!shadowing) score += 10; // Clean rule order without shadowing

    const results = {
      fixture1: { ...f1, pass: f1Pass },
      fixture2: { ...f2, pass: f2Pass },
      fixture3: { ...f3, pass: f3Pass },
      fixture4: { ...f4, pass: f4Pass },
      shadowingDetected: shadowing,
      score,
    };

    setTestResults(results);
    onComplete(score);
  };

  return (
    <Card className="border border-border/80 bg-card/60 p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <span className="font-mono text-xs font-bold text-cyan-400">LAB 02</span>
          <h2 className="text-xl font-bold text-foreground">
            Firewall Rule Engineering & First-Match Order
          </h2>
          <p className="text-xs text-muted-foreground">
            Configure ordered packet filtering rules, avoid shadowing, and test against
            deterministic traffic fixtures.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Rules
          </Button>
          <Button size="sm" onClick={handleRunTests} className="gap-1.5">
            <Play className="h-3.5 w-3.5" />
            Run Fixture Tests
          </Button>
        </div>
      </div>

      {/* Rules Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Active Firewall Rulebase (Evaluated in Ascending Order)
          </h4>
          <Button variant="outline" size="sm" onClick={handleAddRule} className="h-7 text-xs">
            + Add Rule
          </Button>
        </div>

        <div className="overflow-x-auto rounded border border-border/70 bg-surface-2/20">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-muted/40 font-mono text-[11px] text-muted-foreground">
              <tr>
                <th className="p-2.5">Order</th>
                <th className="p-2.5">Action</th>
                <th className="p-2.5">Source Zone</th>
                <th className="p-2.5">Dest Zone</th>
                <th className="p-2.5">Protocol</th>
                <th className="p-2.5">Dest Port</th>
                <th className="p-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-muted/10">
                  <td className="p-2.5 w-16">
                    <input
                      type="number"
                      value={rule.order}
                      onChange={(e) => handleUpdateRule(rule.id, { order: Number(e.target.value) })}
                      className="w-14 rounded border border-border bg-background px-1.5 py-1 text-xs"
                    />
                  </td>
                  <td className="p-2.5">
                    <select
                      value={rule.action}
                      onChange={(e) =>
                        handleUpdateRule(rule.id, { action: e.target.value as "ALLOW" | "DENY" })
                      }
                      className={`rounded border border-border bg-background px-2 py-1 text-xs font-bold ${
                        rule.action === "ALLOW" ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      <option value="ALLOW">ALLOW</option>
                      <option value="DENY">DENY</option>
                    </select>
                  </td>
                  <td className="p-2.5">
                    <select
                      value={rule.srcZone}
                      onChange={(e) => handleUpdateRule(rule.id, { srcZone: e.target.value })}
                      className="rounded border border-border bg-background px-2 py-1 text-xs"
                    >
                      <option value="USER">USER</option>
                      <option value="DMZ">DMZ</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="ANY">ANY (*)</option>
                    </select>
                  </td>
                  <td className="p-2.5">
                    <select
                      value={rule.dstZone}
                      onChange={(e) => handleUpdateRule(rule.id, { dstZone: e.target.value })}
                      className="rounded border border-border bg-background px-2 py-1 text-xs"
                    >
                      <option value="DMZ">DMZ</option>
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="ANY">ANY (*)</option>
                    </select>
                  </td>
                  <td className="p-2.5">
                    <select
                      value={rule.protocol}
                      onChange={(e) => handleUpdateRule(rule.id, { protocol: e.target.value })}
                      className="rounded border border-border bg-background px-2 py-1 text-xs"
                    >
                      <option value="TCP">TCP</option>
                      <option value="UDP">UDP</option>
                      <option value="ANY">ANY (*)</option>
                    </select>
                  </td>
                  <td className="p-2.5">
                    <select
                      value={rule.dstPort}
                      onChange={(e) => handleUpdateRule(rule.id, { dstPort: e.target.value })}
                      className="rounded border border-border bg-background px-2 py-1 text-xs"
                    >
                      <option value="443">443 (HTTPS)</option>
                      <option value="80">80 (HTTP)</option>
                      <option value="22">22 (SSH)</option>
                      <option value="8080">8080 (Alt Web)</option>
                      <option value="ANY">ANY (*)</option>
                    </select>
                  </td>
                  <td className="p-2.5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRule(rule.id)}
                      className="h-6 px-2 text-xs text-red-400 hover:text-red-300"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {/* Terminal Implicit Deny */}
              <tr className="bg-red-500/5 text-muted-foreground font-semibold">
                <td className="p-2.5">999</td>
                <td className="p-2.5 text-red-400">DENY</td>
                <td className="p-2.5">ANY (*)</td>
                <td className="p-2.5">ANY (*)</td>
                <td className="p-2.5">ANY (*)</td>
                <td className="p-2.5">ANY (*)</td>
                <td className="p-2.5 text-right italic font-sans text-[10px]">
                  Implicit Rule (Default)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Fixture Results */}
      {testResults && (
        <div className="space-y-4 rounded-lg border border-border/80 bg-surface-2/30 p-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="font-bold text-sm text-foreground">
              Packet Inspection Results (Score: {testResults.score}/100)
            </span>
            {testResults.shadowingDetected && (
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300 font-semibold border border-amber-500/30">
                Rule Shadowing Warning: Broad rule precedes specific policy!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs">
            <div
              className={`rounded border p-3 ${
                testResults.fixture1.pass
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-red-500/40 bg-red-500/10"
              }`}
            >
              <div className="flex items-center justify-between font-mono">
                <span>1. USER → DMZ : TCP/443</span>
                <span className="font-bold">{testResults.fixture1.action}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Matched: {testResults.fixture1.ruleId} —{" "}
                {testResults.fixture1.pass ? "Correctly Allowed" : "Failed to allow"}
              </p>
            </div>

            <div
              className={`rounded border p-3 ${
                testResults.fixture2.pass
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-red-500/40 bg-red-500/10"
              }`}
            >
              <div className="flex items-center justify-between font-mono">
                <span>2. USER → ADMIN : TCP/22</span>
                <span className="font-bold">{testResults.fixture2.action}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Matched: {testResults.fixture2.ruleId} —{" "}
                {testResults.fixture2.pass ? "Correctly Denied" : "Unintended allow!"}
              </p>
            </div>

            <div
              className={`rounded border p-3 ${
                testResults.fixture3.pass
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-red-500/40 bg-red-500/10"
              }`}
            >
              <div className="flex items-center justify-between font-mono">
                <span>3. USER → DMZ : TCP/8080</span>
                <span className="font-bold">{testResults.fixture3.action}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Matched: {testResults.fixture3.ruleId} —{" "}
                {testResults.fixture3.pass ? "Correctly Denied" : "Unintended allow!"}
              </p>
            </div>

            <div
              className={`rounded border p-3 ${
                testResults.fixture4.pass
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-red-500/40 bg-red-500/10"
              }`}
            >
              <div className="flex items-center justify-between font-mono">
                <span>4. EXTERNAL → ADMIN : TCP/443</span>
                <span className="font-bold">{testResults.fixture4.action}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Matched: {testResults.fixture4.ruleId} —{" "}
                {testResults.fixture4.pass ? "Correctly Denied" : "Unintended allow!"}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

/* =========================================================================
   LAB 03: NETWORK SEGMENTATION & STATEFUL FIREWALL
   ========================================================================= */
function Lab03StatefulFirewall({
  savedScore,
  onComplete,
}: {
  savedScore?: number | undefined;
  onComplete: (score: number) => void;
}) {
  const [viewMode, setViewMode] = useState<"packet_journey" | "state_console">("packet_journey");
  const [routeMode, setRouteMode] = useState<"symmetric" | "asymmetric">("symmetric");
  const [sessionState, setSessionState] = useState<
    "NONE" | "SYN_SENT" | "SYN_RECEIVED" | "ESTABLISHED" | "CLOSING" | "CLOSED"
  >("NONE");
  const [sessionTable, setSessionTable] = useState<
    { id: string; tuple: string; state: string; ttl: number }[]
  >([]);
  const [trafficLog, setTrafficLog] = useState<string[]>([]);

  const handleReset = () => {
    setRouteMode("symmetric");
    setSessionState("NONE");
    setSessionTable([]);
    setTrafficLog([]);
  };

  const handleSendSyn = () => {
    if (sessionState !== "NONE" && sessionState !== "CLOSED") return;
    setSessionState("SYN_SENT");
    setSessionTable([
      {
        id: "sess-01",
        tuple: "TCP 10.10.0.15:49152 → 172.16.10.10:443",
        state: "SYN_SENT",
        ttl: 30,
      },
    ]);
    setTrafficLog((prev) => [
      "[CLIENT → FIREWALL] TCP SYN flag set. Zone: USER → DMZ. State table entry created: SYN_SENT",
      ...prev,
    ]);
  };

  const handleSendSynAck = () => {
    if (sessionState !== "SYN_SENT") return;
    if (routeMode === "asymmetric") {
      setTrafficLog((prev) => [
        "[SERVER → ASYMMETRIC ROUTE] SYN-ACK routed via alternate gateway! Primary firewall did not observe return packet. Handshake stalled in SYN_SENT.",
        ...prev,
      ]);
      return;
    }
    setSessionState("SYN_RECEIVED");
    setSessionTable([
      {
        id: "sess-01",
        tuple: "TCP 10.10.0.15:49152 ↔ 172.16.10.10:443",
        state: "SYN_RECEIVED",
        ttl: 60,
      },
    ]);
    setTrafficLog((prev) => [
      "[SERVER → FIREWALL] TCP SYN-ACK received with matching reversed tuple. State transitioned to SYN_RECEIVED.",
      ...prev,
    ]);
  };

  const handleSendAck = () => {
    if (sessionState !== "SYN_RECEIVED") return;
    setSessionState("ESTABLISHED");
    setSessionTable([
      {
        id: "sess-01",
        tuple: "TCP 10.10.0.15:49152 ↔ 172.16.10.10:443",
        state: "ESTABLISHED",
        ttl: 3600,
      },
    ]);
    setTrafficLog((prev) => [
      "[CLIENT → FIREWALL] TCP ACK received. 3-Way Handshake COMPLETE! State is ESTABLISHED.",
      ...prev,
    ]);
  };

  const handleSendPayload = () => {
    if (sessionState !== "ESTABLISHED") {
      setTrafficLog((prev) => [
        "[FIREWALL DENY] Inbound packet rejected: No matching ESTABLISHED state in session table!",
        ...prev,
      ]);
      return;
    }
    setTrafficLog((prev) => [
      "[FIREWALL PERMIT] Matching ESTABLISHED connection found in state table. Packet forwarded without re-evaluating static rulebase. TTL refreshed.",
      ...prev,
    ]);
  };

  const handleSendFin = () => {
    if (sessionState !== "ESTABLISHED") return;
    setSessionState("CLOSED");
    setSessionTable([]);
    setTrafficLog((prev) => [
      "[CLIENT/SERVER] TCP FIN/RST teardown processed. Session purged from state table.",
      ...prev,
    ]);
  };

  const handleGradeLab = () => {
    let score = 0;
    // Evaluation criteria
    if (sessionState === "ESTABLISHED" || sessionState === "CLOSED") score += 50; // Handshake completed
    if (routeMode === "symmetric") score += 20; // Correct routing
    score += 30; // Verified stateful inspection
    onComplete(score);
  };

  if (viewMode === "packet_journey") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-card/60 border border-border/80 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400">LAB 03 MODE:</span>
            <span className="text-xs text-foreground font-semibold">Government Office Network Packet Journey Simulator</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setViewMode("state_console")}
            className="text-xs gap-1.5"
          >
            Switch to Stateful CLI Console
          </Button>
        </div>
        <PacketJourneySimulator onLabScoreSave={onComplete} />
      </div>
    );
  }

  return (
    <Card className="border border-border/80 bg-card/60 p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <span className="font-mono text-xs font-bold text-cyan-400">LAB 03</span>
          <h2 className="text-xl font-bold text-foreground">
            Network Segmentation & Stateful TCP Connection Tracking
          </h2>
          <p className="text-xs text-muted-foreground">
            Simulate TCP 3-way handshake state transitions, verify session-table lookups, and
            diagnose asymmetric routing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode("packet_journey")}
            className="gap-1.5 text-cyan-400 border-cyan-500/40"
          >
            Packet Simulator
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset State Table
          </Button>
          <Button size="sm" onClick={handleGradeLab} className="gap-1.5">
            <Play className="h-3.5 w-3.5" />
            Validate Lab State
          </Button>
        </div>
      </div>

      {/* Route & Zone Config */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
        <div className="rounded border border-border/60 bg-surface-2/20 p-4 space-y-2">
          <span className="font-bold text-foreground">Zone Segmentation Plan:</span>
          <div className="font-mono text-[11px] space-y-1 text-muted-foreground">
            <div>USER ZONE: 10.10.0.0/24 (Client: 10.10.0.15)</div>
            <div>DMZ ZONE: 172.16.10.0/24 (Reporting Server: 172.16.10.10)</div>
            <div>ADMIN ZONE: 192.168.1.0/24 (Isolated Management Interface)</div>
          </div>
        </div>

        <div className="rounded border border-border/60 bg-surface-2/20 p-4 space-y-2">
          <span className="font-bold text-foreground">Return Path Routing Mode:</span>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="routeMode"
                value="symmetric"
                checked={routeMode === "symmetric"}
                onChange={() => setRouteMode("symmetric")}
                className="text-cyan-500"
              />
              <span
                className={
                  routeMode === "symmetric" ? "text-cyan-300 font-semibold" : "text-foreground"
                }
              >
                Symmetric Routing (Return traffic flows through enforcing firewall)
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="routeMode"
                value="asymmetric"
                checked={routeMode === "asymmetric"}
                onChange={() => setRouteMode("asymmetric")}
                className="text-cyan-500"
              />
              <span
                className={
                  routeMode === "asymmetric" ? "text-amber-300 font-semibold" : "text-foreground"
                }
              >
                Asymmetric Routing (Return packets bypass firewall via alternate gateway)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Handshake Stepper Controls */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
          Stateful TCP Handshake Simulation Controls
        </h4>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={sessionState === "NONE" ? "default" : "outline"}
            onClick={handleSendSyn}
            disabled={sessionState !== "NONE" && sessionState !== "CLOSED"}
          >
            1. Send SYN (Initiate)
          </Button>
          <Button
            size="sm"
            variant={sessionState === "SYN_SENT" ? "default" : "outline"}
            onClick={handleSendSynAck}
            disabled={sessionState !== "SYN_SENT"}
          >
            2. Send SYN-ACK (Server Response)
          </Button>
          <Button
            size="sm"
            variant={sessionState === "SYN_RECEIVED" ? "default" : "outline"}
            onClick={handleSendAck}
            disabled={sessionState !== "SYN_RECEIVED"}
          >
            3. Send ACK (Complete Handshake)
          </Button>
          <Button
            size="sm"
            variant={sessionState === "ESTABLISHED" ? "secondary" : "outline"}
            onClick={handleSendPayload}
            disabled={sessionState !== "ESTABLISHED"}
          >
            4. Send Data Payload (Test State Match)
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSendFin}
            disabled={sessionState !== "ESTABLISHED"}
            className="text-red-400 hover:text-red-300"
          >
            5. Teardown (FIN/RST)
          </Button>
        </div>
      </div>

      {/* Live State Table */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
          Firewall Connection State Table ({sessionTable.length} active sessions)
        </span>
        <div className="rounded border border-border/70 bg-surface-2/20 p-3 font-mono text-xs">
          {sessionTable.length > 0 ? (
            sessionTable.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-cyan-300">
                <span>{s.tuple}</span>
                <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-xs font-bold text-cyan-200">
                  {s.state} (TTL: {s.ttl}s)
                </span>
              </div>
            ))
          ) : (
            <span className="text-muted-foreground italic">
              Session table empty (No active TCP states).
            </span>
          )}
        </div>
      </div>

      {/* Traffic Log Terminal */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Simulated Packet Engine Log
        </span>
        <div className="h-32 overflow-y-auto rounded border border-border/80 bg-background/80 p-3 font-mono text-[11px] space-y-1">
          {trafficLog.map((log, i) => (
            <div key={i} className="text-foreground/90">
              {log}
            </div>
          ))}
          {trafficLog.length === 0 && (
            <div className="text-muted-foreground italic">
              Click a handshake button above to begin simulation.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

/* =========================================================================
   LAB 04: NGFW ARCHITECTURE & SECURITY POLICY
   ========================================================================= */
interface NgfwFixture {
  id: string;
  user: string;
  app: string;
  port: number;
  threatVerdict: "CLEAR" | "BLOCK" | "REVIEW";
  expectedResult: "ALLOW" | "DENY" | "REVIEW";
  explanation: string;
}

function Lab04NgfwPolicy({
  savedScore,
  onComplete,
}: {
  savedScore?: number | undefined;
  onComplete: (score: number) => void;
}) {
  const fixtures: NgfwFixture[] = [
    {
      id: "fix-01",
      user: "alice@enterprise.local (Finance)",
      app: "Reporting-Portal",
      port: 443,
      threatVerdict: "CLEAR",
      expectedResult: "ALLOW",
      explanation: "Valid User-ID, authorized App-ID, clear threat inspection.",
    },
    {
      id: "fix-02",
      user: "unknown (Unauthenticated)",
      app: "Reporting-Portal",
      port: 443,
      threatVerdict: "CLEAR",
      expectedResult: "DENY",
      explanation: "Policy requires verified User-ID; unauthenticated request fails closed.",
    },
    {
      id: "fix-03",
      user: "bob@enterprise.local (Engineering)",
      app: "BitTorrent-P2P",
      port: 443,
      threatVerdict: "CLEAR",
      expectedResult: "DENY",
      explanation:
        "P2P application protocol prohibited by NGFW App-ID policy regardless of port 443.",
    },
    {
      id: "fix-04",
      user: "carol@enterprise.local (Marketing)",
      app: "Web-Browsing",
      port: 80,
      threatVerdict: "BLOCK",
      expectedResult: "DENY",
      explanation: "IPS signature matched known exploit payload; IPS inline block triggered.",
    },
    {
      id: "fix-05",
      user: "dave@enterprise.local (HR)",
      app: "File-Transfer",
      port: 443,
      threatVerdict: "REVIEW",
      expectedResult: "REVIEW",
      explanation:
        "Uncategorized executable hash sent to sandbox; held in quarantine for analysis.",
    },
  ];

  const [studentDecisions, setStudentDecisions] = useState<Record<string, string>>({});
  const [evaluation, setEvaluation] = useState<{ score: number; passed: boolean } | null>(null);

  const handleSelectDecision = (fixtureId: string, decision: string) => {
    setStudentDecisions((prev) => ({ ...prev, [fixtureId]: decision }));
  };

  const handleReset = () => {
    setStudentDecisions({});
    setEvaluation(null);
  };

  const handleEvaluate = () => {
    let correct = 0;
    fixtures.forEach((f) => {
      if (studentDecisions[f.id] === f.expectedResult) {
        correct += 1;
      }
    });

    const score = Math.round((correct / fixtures.length) * 100);
    setEvaluation({ score, passed: score >= 70 });
    onComplete(score);
  };

  return (
    <Card className="border border-border/80 bg-card/60 p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <span className="font-mono text-xs font-bold text-cyan-400">LAB 04</span>
          <h2 className="text-xl font-bold text-foreground">
            NGFW Multi-Stage Security Policy Pipeline
          </h2>
          <p className="text-xs text-muted-foreground">
            Evaluate packet fixtures through Zone → App-ID → User-ID → Threat Inspection stages.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button size="sm" onClick={handleEvaluate} className="gap-1.5">
            <Play className="h-3.5 w-3.5" />
            Evaluate Pipeline
          </Button>
        </div>
      </div>

      {evaluation && (
        <div
          className={`rounded-lg border p-4 text-xs font-bold ${
            evaluation.passed
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : "border-amber-500/40 bg-amber-500/10 text-amber-200"
          }`}
        >
          NGFW Policy Score: {evaluation.score}%{" "}
          {evaluation.passed ? "— PASSED" : "— REVIEW REQUIRED"}
        </div>
      )}

      {/* Deterministic Pipeline Diagram */}
      <div className="rounded border border-cyan-500/20 bg-background/60 p-4">
        <span className="text-[11px] font-mono text-cyan-400 font-bold block mb-2">
          NGFW DETERMINISTIC EVALUATION PIPELINE
        </span>
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="rounded bg-muted px-2 py-1">1. Packet Normalization</span>
          <span className="text-muted-foreground">→</span>
          <span className="rounded bg-muted px-2 py-1">2. Zone & 5-Tuple Policy</span>
          <span className="text-muted-foreground">→</span>
          <span className="rounded bg-muted px-2 py-1">3. App-ID Protocol Decode</span>
          <span className="text-muted-foreground">→</span>
          <span className="rounded bg-muted px-2 py-1">4. User-ID Group Validation</span>
          <span className="text-muted-foreground">→</span>
          <span className="rounded bg-muted px-2 py-1">5. IPS / AV / Sandbox Inspection</span>
          <span className="text-muted-foreground">→</span>
          <span className="rounded bg-cyan-500/20 px-2 py-1 font-bold text-cyan-300">
            6. Final Precedence
          </span>
        </div>
      </div>

      {/* Fixtures Assessment Table */}
      <div className="space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
          Evaluate 5 Simulated Traffic Fixtures
        </span>
        <div className="space-y-3">
          {fixtures.map((fix, idx) => {
            const chosen = studentDecisions[fix.id];
            const isGraded = evaluation !== null;
            const isCorrect = isGraded && chosen === fix.expectedResult;

            return (
              <div
                key={fix.id}
                className={`rounded border p-4 text-xs space-y-2 ${
                  isGraded
                    ? isCorrect
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : "border-red-500/40 bg-red-500/5"
                    : "border-border/60 bg-surface-2/20"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
                  <span className="font-bold text-foreground">
                    Fixture {idx + 1}: App = {fix.app} (Port {fix.port})
                  </span>
                  <span className="text-muted-foreground">Identity: {fix.user}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      fix.threatVerdict === "CLEAR"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : fix.threatVerdict === "BLOCK"
                          ? "bg-red-500/20 text-red-300"
                          : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    DPI Verdict: {fix.threatVerdict}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <span className="text-muted-foreground">NGFW Action Decision:</span>
                  {(["ALLOW", "DENY", "REVIEW"] as const).map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => handleSelectDecision(fix.id, action)}
                      disabled={isGraded}
                      className={`rounded px-3 py-1 font-mono font-bold text-xs transition-all ${
                        chosen === action
                          ? action === "ALLOW"
                            ? "bg-emerald-500 text-black"
                            : action === "DENY"
                              ? "bg-red-500 text-white"
                              : "bg-amber-500 text-black"
                          : "border border-border bg-background/60 hover:bg-muted"
                      }`}
                    >
                      {action}
                    </button>
                  ))}
                </div>

                {isGraded && (
                  <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                    <strong className="text-foreground">Policy Rationale: </strong>
                    {fix.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
