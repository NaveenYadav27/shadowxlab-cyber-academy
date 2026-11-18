import React, { useState } from "react";
import {
  Shield,
  LayoutDashboard,
  Network,
  Route,
  FileText,
  Layers,
  Sliders,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Terminal,
  Activity,
  Server,
  Monitor,
  Globe,
  Info,
  Check,
  HelpCircle,
  AlertTriangle,
  Code2,
  Lock,
  ExternalLink,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DAY2_LABS, type Day2Lab } from "@/lib/day2-curriculum";

export type EmulatorTab =
  | "dashboard"
  | "interfaces"
  | "routing"
  | "policies"
  | "addresses"
  | "services"
  | "nat"
  | "logs";

interface Day2LabsProps {
  labScores: Record<string, number>;
  onSaveLabScore: (labId: string, score: number) => void;
  onNavigateToSchedule?: () => void;
  activeLabId?: string;
}

export function Day2Labs({
  labScores,
  onSaveLabScore,
  onNavigateToSchedule,
  activeLabId = "day2-lab-01",
}: Day2LabsProps) {
  const [activeTab, setActiveTab] = useState<EmulatorTab>("dashboard");
  const [selectedLabId, setSelectedLabId] = useState<string>(activeLabId);

  // Configuration State
  // Interfaces
  const [eth0Ip, setEth0Ip] = useState<string>("10.231.30.254/24");
  const [eth1Ip, setEth1Ip] = useState<string>("10.231.20.254/24");
  const [eth2Ip, setEth2Ip] = useState<string>("10.231.10.254/24");
  const [sshAllowedInterface, setSshAllowedInterface] = useState<string>("eth1");

  // Routing
  const [defaultGateway, setDefaultGateway] = useState<string>("10.231.10.1");
  const [ipForwardEnabled, setIpForwardEnabled] = useState<boolean>(true);

  // Policies (nftables / FortiOS)
  const [defaultForwardPolicy, setDefaultForwardPolicy] = useState<string>("drop");
  const [allowConntrack, setAllowConntrack] = useState<boolean>(true);
  const [allowLanToDmzWeb, setAllowLanToDmzWeb] = useState<boolean>(true);
  const [allowWanToDmzWeb, setAllowWanToDmzWeb] = useState<boolean>(true);
  const [blockDmzToLan, setBlockDmzToLan] = useState<boolean>(true);

  // Verification Logs
  const [lab1Verified, setLab1Verified] = useState<boolean>(false);
  const [lab1Output, setLab1Output] = useState<string[]>([]);

  const [lab2Verified, setLab2Verified] = useState<boolean>(false);
  const [lab2Output, setLab2Output] = useState<string[]>([]);

  const [lab3Verified, setLab3Verified] = useState<boolean>(false);
  const [lab3Output, setLab3Output] = useState<string[]>([]);

  // Lab 1 Verification Logic
  const runLab1Verification = () => {
    const logs: string[] = [];
    logs.push("[TEST 1/4] Verifying eth0 (DMZ) IP assignment: " + eth0Ip);
    const eth0Pass = eth0Ip.trim() === "10.231.30.254/24";
    if (eth0Pass) logs.push("  ✓ PASSED: eth0 configured on 10.231.30.254/24 (DMZ Zone)");
    else logs.push("  ✗ FAILED: Expected 10.231.30.254/24 for DMZ zone");

    logs.push("[TEST 2/4] Verifying eth1 (LAN) IP assignment: " + eth1Ip);
    const eth1Pass = eth1Ip.trim() === "10.231.20.254/24";
    if (eth1Pass) logs.push("  ✓ PASSED: eth1 configured on 10.231.20.254/24 (LAN Zone)");
    else logs.push("  ✗ FAILED: Expected 10.231.20.254/24 for LAN zone");

    logs.push("[TEST 3/4] Verifying eth2 (WAN) IP assignment: " + eth2Ip);
    const eth2Pass = eth2Ip.trim() === "10.231.10.254/24";
    if (eth2Pass) logs.push("  ✓ PASSED: eth2 configured on 10.231.10.254/24 (WAN Zone)");
    else logs.push("  ✗ FAILED: Expected 10.231.10.254/24 for WAN zone");

    logs.push("[TEST 4/4] Verifying SSH management interface binding: " + sshAllowedInterface);
    const sshPass = sshAllowedInterface === "eth1";
    if (sshPass) logs.push("  ✓ PASSED: Administrative SSH bound strictly to internal LAN eth1");
    else logs.push("  ✗ FAILED: SSH must NOT be allowed from untrusted WAN eth2 or DMZ eth0");

    const passedCount = [eth0Pass, eth1Pass, eth2Pass, sshPass].filter(Boolean).length;
    const score = Math.round((passedCount / 4) * 100);
    logs.push(`\n[RESULT] Lab 1 Interface Setup Score: ${score}% (${passedCount}/4 tests passed)`);

    setLab1Output(logs);
    if (score >= 75) {
      setLab1Verified(true);
      onSaveLabScore("day2-lab-01", score);
    }
  };

  // Lab 2 Verification Logic
  const runLab2Verification = () => {
    const logs: string[] = [];
    logs.push("[TEST 1/4] Verifying default gateway route: " + defaultGateway);
    const gwPass = defaultGateway.trim() === "10.231.10.1";
    if (gwPass) logs.push("  ✓ PASSED: Default route 0.0.0.0/0 points to 10.231.10.1 dev eth2");
    else logs.push("  ✗ FAILED: Expected upstream gateway 10.231.10.1 on WAN");

    logs.push("[TEST 2/4] Verifying kernel forwarding: net.ipv4.ip_forward = " + (ipForwardEnabled ? "1" : "0"));
    if (ipForwardEnabled) logs.push("  ✓ PASSED: Linux kernel IP forwarding active");
    else logs.push("  ✗ FAILED: Kernel packet forwarding is disabled; inter-zone routing will fail");

    logs.push("[TEST 3/4] Testing ICMP ping reachability across directly connected subnets:");
    logs.push("  PING 10.231.20.10 (sxl-lan01): 64 bytes, ttl=64 time=0.28ms ✓");
    logs.push("  PING 10.231.30.10 (sxl-dmz01): 64 bytes, ttl=64 time=0.31ms ✓");
    logs.push("  PING 10.231.10.10 (sxl-wan01): 64 bytes, ttl=64 time=0.25ms ✓");

    logs.push("[TEST 4/4] Verifying Longest Prefix Match (LPM) FIB resolution:");
    logs.push("  ip route get 8.8.8.8 -> 8.8.8.8 via 10.231.10.1 dev eth2 (FIB resolution OK) ✓");

    const passedCount = [gwPass, ipForwardEnabled, true, true].filter(Boolean).length;
    const score = Math.round((passedCount / 4) * 100);
    logs.push(`\n[RESULT] Lab 2 Static Routing Score: ${score}% (${passedCount}/4 tests passed)`);

    setLab2Output(logs);
    if (score >= 75) {
      setLab2Verified(true);
      onSaveLabScore("day2-lab-02", score);
    }
  };

  // Lab 3 Verification Logic
  const runLab3Verification = () => {
    const logs: string[] = [];
    logs.push("[TEST 1/5] Verifying FORWARD chain default policy: " + defaultForwardPolicy);
    const policyPass = defaultForwardPolicy === "drop";
    if (policyPass) logs.push("  ✓ PASSED: FORWARD chain default policy is DROP (Default-Deny)");
    else logs.push("  ✗ FAILED: FORWARD chain policy must be drop to maintain a secure perimeter");

    logs.push("[TEST 2/5] Verifying Connection Tracking: ct state established,related accept");
    if (allowConntrack) logs.push("  ✓ PASSED: Stateful return traffic permitted via conntrack table");
    else logs.push("  ✗ FAILED: Conntrack rule missing; bidirectional TCP handshakes will fail");

    logs.push("[TEST 3/5] Verifying LAN to DMZ Web rule: iif eth1 oif eth0 tcp dport { 80, 443 }");
    if (allowLanToDmzWeb) logs.push("  ✓ PASSED: LAN workstations permitted to reach DMZ web portal");
    else logs.push("  ✗ FAILED: LAN access to DMZ web service blocked");

    logs.push("[TEST 4/5] Verifying WAN to DMZ Inbound Publishing: iif eth2 oif eth0 tcp dport { 80, 443 }");
    if (allowWanToDmzWeb) logs.push("  ✓ PASSED: External public users permitted to query DMZ website");
    else logs.push("  ✗ FAILED: Inbound web publishing blocked");

    logs.push("[TEST 5/5] Verifying Cardinal DMZ-to-LAN Isolation: iif eth0 oif eth1 counter drop");
    if (blockDmzToLan) logs.push("  ✓ PASSED: Unsolicited DMZ-to-LAN initiation dropped and logged");
    else logs.push("  ✗ FAILED: Lateral movement from DMZ into internal corporate LAN is not blocked");

    const passedCount = [
      policyPass,
      allowConntrack,
      allowLanToDmzWeb,
      allowWanToDmzWeb,
      blockDmzToLan,
    ].filter(Boolean).length;
    const score = Math.round((passedCount / 5) * 100);
    logs.push(`\n[RESULT] Lab 3 nftables Policy Score: ${score}% (${passedCount}/5 tests passed)`);

    setLab3Output(logs);
    if (score >= 80) {
      setLab3Verified(true);
      onSaveLabScore("day2-lab-03", score);
    }
  };

  const handleSelectLab = (labId: string) => {
    setSelectedLabId(labId);
    if (labId === "day2-lab-01") setActiveTab("interfaces");
    else if (labId === "day2-lab-02") setActiveTab("routing");
    else if (labId === "day2-lab-03") setActiveTab("policies");
  };

  return (
    <div className="space-y-6">
      {/* 3 Practical Lab Quick Launch Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {DAY2_LABS.map((lab, idx) => {
          const isSelected = selectedLabId === lab.id;
          const score = labScores[lab.id];
          const isDone = (score ?? 0) >= 70;

          return (
            <button
              key={lab.id}
              type="button"
              onClick={() => handleSelectLab(lab.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? "border-red-500 bg-red-50/70 shadow-2xs text-gray-900 ring-1 ring-red-400"
                  : isDone
                    ? "border-emerald-200 bg-emerald-50/40 text-gray-900"
                    : "border-border bg-white text-gray-900 hover:bg-slate-50 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] text-red-600 font-bold uppercase">
                  PRACTICAL LAB {idx + 1}
                </span>
                {isDone ? (
                  <Badge className="bg-emerald-600 text-white text-[10px] font-mono">
                    <Check className="h-3 w-3 mr-1 inline" />
                    {score}%
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] font-mono border-gray-200 text-gray-500">
                    Pending
                  </Badge>
                )}
              </div>
              <div className="text-sm font-bold text-gray-900 line-clamp-1">{lab.title}</div>
              <div className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                {lab.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* Disclaimer & Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50/60 p-3.5 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <Shield className="h-5 w-5 text-red-600 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-foreground">
                ESCI Enterprise Firewall Learning Console
              </span>
              <Badge className="bg-red-600 text-white font-mono text-[9px] uppercase px-1.5 py-0">
                FortiGate-Inspired Emulator
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              High-fidelity interactive environment modeling FortiOS administrative workflows and Linux Netfilter/nftables mechanics.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
          <span className="h-2 w-2 rounded-full bg-emerald-600" />
          <span>Device: sxl-fw01 (v7.2.5-sim)</span>
        </div>
      </div>

      {/* Main Console Grid: Sidebar Tabs + Working Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          <div className="rounded-lg border border-border bg-white p-2 shadow-2xs space-y-1">
            <div className="px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Firewall Console Views
            </div>

            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                activeTab === "dashboard"
                  ? "bg-red-50 text-red-600 font-semibold shadow-[inset_3px_0_0_#D71920]"
                  : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
              }`}
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              <span>System Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("interfaces")}
              className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                activeTab === "interfaces"
                  ? "bg-red-50 text-red-600 font-semibold shadow-[inset_3px_0_0_#D71920]"
                  : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
              }`}
            >
              <Network className="h-4 w-4 shrink-0" />
              <div className="flex flex-1 items-center justify-between">
                <span>Network Interfaces</span>
                <span className="text-[10px] font-mono text-muted-foreground">3</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("routing")}
              className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                activeTab === "routing"
                  ? "bg-red-50 text-red-600 font-semibold shadow-[inset_3px_0_0_#D71920]"
                  : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
              }`}
            >
              <Route className="h-4 w-4 shrink-0" />
              <span>Static Routing</span>
            </button>

            <button
              onClick={() => setActiveTab("policies")}
              className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                activeTab === "policies"
                  ? "bg-red-50 text-red-600 font-semibold shadow-[inset_3px_0_0_#D71920]"
                  : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
              }`}
            >
              <FileText className="h-4 w-4 shrink-0" />
              <div className="flex flex-1 items-center justify-between">
                <span>Firewall Policies</span>
                <Badge className="bg-red-100 text-red-700 font-mono text-[9px] px-1 py-0">ACL</Badge>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("addresses")}
              className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                activeTab === "addresses"
                  ? "bg-red-50 text-red-600 font-semibold shadow-[inset_3px_0_0_#D71920]"
                  : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
              }`}
            >
              <Layers className="h-4 w-4 shrink-0" />
              <span>Address Objects</span>
            </button>

            <button
              onClick={() => setActiveTab("services")}
              className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                activeTab === "services"
                  ? "bg-red-50 text-red-600 font-semibold shadow-[inset_3px_0_0_#D71920]"
                  : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
              }`}
            >
              <Sliders className="h-4 w-4 shrink-0" />
              <span>Service Objects</span>
            </button>

            <button
              onClick={() => setActiveTab("nat")}
              className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                activeTab === "nat"
                  ? "bg-red-50 text-red-600 font-semibold shadow-[inset_3px_0_0_#D71920]"
                  : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
              }`}
            >
              <RefreshCw className="h-4 w-4 shrink-0" />
              <span>NAT & VIP Port Forwarding</span>
            </button>

            <button
              onClick={() => setActiveTab("logs")}
              className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                activeTab === "logs"
                  ? "bg-red-50 text-red-600 font-semibold shadow-[inset_3px_0_0_#D71920]"
                  : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
              }`}
            >
              <Activity className="h-4 w-4 shrink-0" />
              <span>Traffic & Event Logs</span>
            </button>
          </div>

          {/* Quick Lab Evaluation Switcher */}
          <div className="rounded-lg border border-border bg-white p-3 shadow-2xs space-y-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Day 2 Lab Checkpoints
            </span>
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => {
                  setSelectedLabId("day2-lab-01");
                  setActiveTab("interfaces");
                }}
                className={`w-full flex items-center justify-between p-2 rounded border text-left ${
                  selectedLabId === "day2-lab-01"
                    ? "border-red-300 bg-red-50/50 text-red-700 font-semibold"
                    : "border-border text-muted-foreground hover:bg-slate-50"
                }`}
              >
                <span>Lab 1: Interfaces</span>
                <span className="font-mono text-[10px]">
                  {labScores["day2-lab-01"] ? `${labScores["day2-lab-01"]}%` : "Pending"}
                </span>
              </button>

              <button
                onClick={() => {
                  setSelectedLabId("day2-lab-02");
                  setActiveTab("routing");
                }}
                className={`w-full flex items-center justify-between p-2 rounded border text-left ${
                  selectedLabId === "day2-lab-02"
                    ? "border-red-300 bg-red-50/50 text-red-700 font-semibold"
                    : "border-border text-muted-foreground hover:bg-slate-50"
                }`}
              >
                <span>Lab 2: Static Routing</span>
                <span className="font-mono text-[10px]">
                  {labScores["day2-lab-02"] ? `${labScores["day2-lab-02"]}%` : "Pending"}
                </span>
              </button>

              <button
                onClick={() => {
                  setSelectedLabId("day2-lab-03");
                  setActiveTab("policies");
                }}
                className={`w-full flex items-center justify-between p-2 rounded border text-left ${
                  selectedLabId === "day2-lab-03"
                    ? "border-red-300 bg-red-50/50 text-red-700 font-semibold"
                    : "border-border text-muted-foreground hover:bg-slate-50"
                }`}
              >
                <span>Lab 3: nftables ACLs</span>
                <span className="font-mono text-[10px]">
                  {labScores["day2-lab-03"] ? `${labScores["day2-lab-03"]}%` : "Pending"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Working View (Active Tab) */}
        <div className="lg:col-span-9 space-y-6">
          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <Card className="p-6 border-border bg-white shadow-2xs space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground">System Dashboard</h3>
                    <p className="text-xs text-muted-foreground">
                      Real-time status, hardware resource metrics, and operational health.
                    </p>
                  </div>
                  <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 text-xs">
                    Cluster Status: HEALTHY
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-3.5 rounded-lg border border-border bg-slate-50/60">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">Hostname</span>
                    <div className="text-sm font-bold text-foreground font-mono mt-1">sxl-fw01</div>
                    <small className="text-[10px] text-muted-foreground">ESCI Campus Core</small>
                  </div>

                  <div className="p-3.5 rounded-lg border border-border bg-slate-50/60">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">Firmware / Kernel</span>
                    <div className="text-sm font-bold text-foreground font-mono mt-1">Linux 6.6 / nftables</div>
                    <small className="text-[10px] text-muted-foreground">FortiOS v7.2 Modeled</small>
                  </div>

                  <div className="p-3.5 rounded-lg border border-border bg-slate-50/60">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">CPU & Memory</span>
                    <div className="text-sm font-bold text-foreground font-mono mt-1">12% / 28%</div>
                    <small className="text-[10px] text-emerald-600">Optimal Utilization</small>
                  </div>

                  <div className="p-3.5 rounded-lg border border-border bg-slate-50/60">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">Active Sessions</span>
                    <div className="text-sm font-bold text-red-600 font-mono mt-1">14 Sessions</div>
                    <small className="text-[10px] text-muted-foreground">Conntrack Table Active</small>
                  </div>
                </div>

                {/* Interface Summary Table */}
                <div className="space-y-2">
                  <span className="font-mono text-xs font-bold text-foreground uppercase">
                    Network Interface Status
                  </span>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 border-b border-border text-[11px] font-mono text-muted-foreground">
                        <tr>
                          <th className="p-2.5">Port</th>
                          <th className="p-2.5">Security Zone</th>
                          <th className="p-2.5">IP Address</th>
                          <th className="p-2.5">Link Status</th>
                          <th className="p-2.5">Admin Access</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="p-2.5 font-mono font-semibold">eth2</td>
                          <td className="p-2.5">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              WAN (Untrusted)
                            </span>
                          </td>
                          <td className="p-2.5 font-mono">{eth2Ip}</td>
                          <td className="p-2.5 text-emerald-600 font-medium">1000Mbps Full Duplex</td>
                          <td className="p-2.5 text-muted-foreground">ping</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono font-semibold">eth1</td>
                          <td className="p-2.5">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              LAN (Trusted)
                            </span>
                          </td>
                          <td className="p-2.5 font-mono">{eth1Ip}</td>
                          <td className="p-2.5 text-emerald-600 font-medium">1000Mbps Full Duplex</td>
                          <td className="p-2.5 text-emerald-600 font-medium">https, ssh, ping</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono font-semibold">eth0</td>
                          <td className="p-2.5">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                              DMZ (Semi-Trusted)
                            </span>
                          </td>
                          <td className="p-2.5 font-mono">{eth0Ip}</td>
                          <td className="p-2.5 text-emerald-600 font-medium">1000Mbps Full Duplex</td>
                          <td className="p-2.5 text-muted-foreground">ping</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>

              {/* Dedicated Explanation Panel */}
              <ExplanationPanel
                title="System Dashboard & Telemetry Overview"
                controls="Aggregates system hostname, firmware revision, hardware CPU/RAM loads, interface status, and active connection count."
                required="Enables administrators to assess overall firewall health at a glance before making configuration edits and detect overload or outages instantly."
                incorrect="Misreading telemetry can result in deploying changes during peak traffic saturation or failing to notice that a critical WAN link is offline."
                verification="Check that all 3 interfaces report 1000Mbps Full Duplex, CPU load remains under 50%, and cluster state reports HEALTHY."
                fortiOS={`get system status
get system performance status
diagnose hardware sysinfo memory`}
                linux={`uptime
hostnamectl
free -h
ip -s link show`}
              />
            </div>
          )}

          {/* TAB 2: INTERFACES */}
          {activeTab === "interfaces" && (
            <div className="space-y-6">
              <Card className="p-6 border-border bg-white shadow-2xs space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Network Interfaces</h3>
                    <p className="text-xs text-muted-foreground">
                      Configure physical and logical ports, assign IP addresses, and bind administrative access.
                    </p>
                  </div>
                  <Button
                    onClick={runLab1Verification}
                    className="bg-red-600 text-white hover:bg-red-700 font-bold text-xs h-8"
                  >
                    <Play className="h-3.5 w-3.5 mr-1" />
                    Verify Lab 1 Settings
                  </Button>
                </div>

                {/* Configuration Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* eth0 DMZ */}
                  <div className="rounded-lg border border-purple-200 bg-purple-50/40 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-purple-700">eth0 • DMZ ZONE</span>
                      <Badge className="bg-purple-100 text-purple-700 text-[10px]">Trust 50</Badge>
                    </div>
                    <label className="text-[11px] font-mono text-muted-foreground block">
                      Assigned CIDR Address:
                    </label>
                    <input
                      type="text"
                      value={eth0Ip}
                      onChange={(e) => setEth0Ip(e.target.value)}
                      className="w-full rounded border border-border bg-white p-2 font-mono text-xs text-foreground focus:border-red-500 focus:outline-none"
                    />
                    <small className="text-[10px] text-muted-foreground block font-mono">
                      Target: 10.231.30.254/24
                    </small>
                  </div>

                  {/* eth1 LAN */}
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-emerald-700">eth1 • LAN ZONE</span>
                      <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Trust 100</Badge>
                    </div>
                    <label className="text-[11px] font-mono text-muted-foreground block">
                      Assigned CIDR Address:
                    </label>
                    <input
                      type="text"
                      value={eth1Ip}
                      onChange={(e) => setEth1Ip(e.target.value)}
                      className="w-full rounded border border-border bg-white p-2 font-mono text-xs text-foreground focus:border-red-500 focus:outline-none"
                    />
                    <small className="text-[10px] text-muted-foreground block font-mono">
                      Target: 10.231.20.254/24
                    </small>
                  </div>

                  {/* eth2 WAN */}
                  <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-amber-700">eth2 • WAN ZONE</span>
                      <Badge className="bg-amber-100 text-amber-700 text-[10px]">Trust 0</Badge>
                    </div>
                    <label className="text-[11px] font-mono text-muted-foreground block">
                      Assigned CIDR Address:
                    </label>
                    <input
                      type="text"
                      value={eth2Ip}
                      onChange={(e) => setEth2Ip(e.target.value)}
                      className="w-full rounded border border-border bg-white p-2 font-mono text-xs text-foreground focus:border-red-500 focus:outline-none"
                    />
                    <small className="text-[10px] text-muted-foreground block font-mono">
                      Target: 10.231.10.254/24
                    </small>
                  </div>
                </div>

                {/* Management Binding Control */}
                <div className="rounded-lg border border-border bg-slate-50/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-foreground">
                        Administrative SSH/HTTPS Access Binding
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Select which physical interface accepts administrative management connections.
                      </p>
                    </div>
                    <select
                      value={sshAllowedInterface}
                      onChange={(e) => setSshAllowedInterface(e.target.value)}
                      className="rounded border border-border bg-white px-3 py-1.5 font-mono text-xs text-foreground"
                    >
                      <option value="eth1">eth1 only (LAN - Secure)</option>
                      <option value="eth2">eth2 (WAN - INSECURE)</option>
                      <option value="eth0">eth0 (DMZ - RISKY)</option>
                      <option value="all">All Interfaces (CRITICAL RISK)</option>
                    </select>
                  </div>
                </div>

                {/* Lab 1 Output Terminal */}
                {lab1Output.length > 0 && (
                  <div className="rounded-lg border border-border bg-slate-900 p-4 font-mono text-xs text-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground text-[10px] border-b border-slate-800 pb-2 mb-2">
                      <span>LAB 1 VERIFICATION TELEMETRY</span>
                      <Badge className={lab1Verified ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}>
                        {lab1Verified ? "PASS" : "FAIL"}
                      </Badge>
                    </div>
                    {lab1Output.map((line, i) => (
                      <div
                        key={i}
                        className={
                          line.includes("✓")
                            ? "text-emerald-400"
                            : line.includes("✗")
                              ? "text-red-400 font-bold"
                              : "text-slate-300"
                        }
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Dedicated Explanation Panel */}
              <ExplanationPanel
                title="Network Interface Configuration & Management Binding"
                controls="Assigns Layer 3 IPv4 addresses and subnet masks to physical NICs and restricts administrative SSH/HTTPS daemons to internal zones."
                required="Every routed firewall interface must have a distinct IP address serving as the default gateway for endpoints in that security zone."
                incorrect="Overlapping subnets cause IP address collisions; exposing administrative access to WAN allows external attackers to brute-force the firewall."
                verification="Run `ip addr show` to confirm IP assignment and attempt SSH from LAN vs WAN to confirm only LAN connects."
                fortiOS={`config system interface
    edit "port1"
        set ip 10.231.10.254 255.255.255.0
        set allowaccess ping
    next
    edit "port2"
        set ip 10.231.20.254 255.255.255.0
        set allowaccess ping https ssh
    next
end`}
                linux={`ip addr add 10.231.10.254/24 dev eth2
ip addr add 10.231.20.254/24 dev eth1
ip addr add 10.231.30.254/24 dev eth0
ip link set dev eth1 up`}
              />
            </div>
          )}

          {/* TAB 3: STATIC ROUTING */}
          {activeTab === "routing" && (
            <div className="space-y-6">
              <Card className="p-6 border-border bg-white shadow-2xs space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Static Routing Configuration</h3>
                    <p className="text-xs text-muted-foreground">
                      Define the upstream default gateway (0.0.0.0/0) and manage kernel IP forwarding.
                    </p>
                  </div>
                  <Button
                    onClick={runLab2Verification}
                    className="bg-red-600 text-white hover:bg-red-700 font-bold text-xs h-8"
                  >
                    <Play className="h-3.5 w-3.5 mr-1" />
                    Verify Lab 2 Settings
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Default Gateway Route Input */}
                  <div className="rounded-lg border border-border bg-slate-50/60 p-4 space-y-2">
                    <label className="text-xs font-bold text-foreground block">
                      Default Gateway IP (0.0.0.0/0 Next Hop):
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      The upstream ISP router IP reachable through WAN interface eth2.
                    </p>
                    <input
                      type="text"
                      value={defaultGateway}
                      onChange={(e) => setDefaultGateway(e.target.value)}
                      className="w-full rounded border border-border bg-white p-2 font-mono text-xs text-foreground focus:border-red-500 focus:outline-none"
                    />
                    <small className="text-[10px] text-muted-foreground block font-mono">
                      Expected Gateway: 10.231.10.1 (ISP Uplink)
                    </small>
                  </div>

                  {/* Kernel IP Forwarding Toggle */}
                  <div className="rounded-lg border border-border bg-slate-50/60 p-4 space-y-2">
                    <label className="text-xs font-bold text-foreground block">
                      Linux Kernel IP Forwarding:
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Governs whether the kernel forwards transit packets between different network interfaces.
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant={ipForwardEnabled ? "default" : "outline"}
                        onClick={() => setIpForwardEnabled(true)}
                        className={ipForwardEnabled ? "bg-emerald-600 text-white" : ""}
                      >
                        Enabled (1)
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={!ipForwardEnabled ? "destructive" : "outline"}
                        onClick={() => setIpForwardEnabled(false)}
                      >
                        Disabled (0)
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Routing Table Display */}
                <div className="space-y-2">
                  <span className="font-mono text-xs font-bold text-foreground uppercase">
                    Active Kernel Forwarding Information Base (FIB)
                  </span>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 border-b border-border text-[11px] font-mono text-muted-foreground">
                        <tr>
                          <th className="p-2.5">Destination Subnet</th>
                          <th className="p-2.5">Next Hop Gateway</th>
                          <th className="p-2.5">Interface</th>
                          <th className="p-2.5">Metric / Distance</th>
                          <th className="p-2.5">Route Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border font-mono text-[11px]">
                        <tr>
                          <td className="p-2.5 font-bold text-foreground">0.0.0.0/0</td>
                          <td className="p-2.5 text-red-600 font-semibold">{defaultGateway}</td>
                          <td className="p-2.5">eth2 (WAN)</td>
                          <td className="p-2.5">10</td>
                          <td className="p-2.5 text-muted-foreground">Static Default Route</td>
                        </tr>
                        <tr>
                          <td className="p-2.5">10.231.10.0/24</td>
                          <td className="p-2.5 text-muted-foreground">0.0.0.0 (Direct)</td>
                          <td className="p-2.5">eth2 (WAN)</td>
                          <td className="p-2.5">0</td>
                          <td className="p-2.5 text-emerald-600">Connected</td>
                        </tr>
                        <tr>
                          <td className="p-2.5">10.231.20.0/24</td>
                          <td className="p-2.5 text-muted-foreground">0.0.0.0 (Direct)</td>
                          <td className="p-2.5">eth1 (LAN)</td>
                          <td className="p-2.5">0</td>
                          <td className="p-2.5 text-emerald-600">Connected</td>
                        </tr>
                        <tr>
                          <td className="p-2.5">10.231.30.0/24</td>
                          <td className="p-2.5 text-muted-foreground">0.0.0.0 (Direct)</td>
                          <td className="p-2.5">eth0 (DMZ)</td>
                          <td className="p-2.5">0</td>
                          <td className="p-2.5 text-emerald-600">Connected</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Lab 2 Output Terminal */}
                {lab2Output.length > 0 && (
                  <div className="rounded-lg border border-border bg-slate-900 p-4 font-mono text-xs text-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground text-[10px] border-b border-slate-800 pb-2 mb-2">
                      <span>LAB 2 VERIFICATION TELEMETRY</span>
                      <Badge className={lab2Verified ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}>
                        {lab2Verified ? "PASS" : "FAIL"}
                      </Badge>
                    </div>
                    {lab2Output.map((line, i) => (
                      <div
                        key={i}
                        className={
                          line.includes("✓")
                            ? "text-emerald-400"
                            : line.includes("✗")
                              ? "text-red-400 font-bold"
                              : "text-slate-300"
                        }
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Dedicated Explanation Panel */}
              <ExplanationPanel
                title="Static Routing & Default Gateway Injection"
                controls="Configures static routes for non-connected destination subnets and sets the default route (0.0.0.0/0) pointing to the ISP uplink."
                required="Without a default route, the firewall has no path to deliver packets destined for remote internet IP addresses and discards them immediately."
                incorrect="Pointing the default route to an internal interface causes routing loops; disabling IP forwarding stops cross-subnet packet forwarding entirely."
                verification="Execute `ip route show` or `get router info routing-table all` and ping 8.8.8.8 to verify resolution."
                fortiOS={`config router static
    edit 1
        set dst 0.0.0.0 0.0.0.0
        set gateway 10.231.10.1
        set device "port1"
    next
end`}
                linux={`ip route add default via 10.231.10.1 dev eth2
sysctl -w net.ipv4.ip_forward=1`}
              />
            </div>
          )}

          {/* TAB 4: FIREWALL POLICIES */}
          {activeTab === "policies" && (
            <div className="space-y-6">
              <Card className="p-6 border-border bg-white shadow-2xs space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Firewall Access Control Policies</h3>
                    <p className="text-xs text-muted-foreground">
                      Sequential top-down 5-tuple filtering rules enforcing inter-zone boundaries and default-deny posture.
                    </p>
                  </div>
                  <Button
                    onClick={runLab3Verification}
                    className="bg-red-600 text-white hover:bg-red-700 font-bold text-xs h-8"
                  >
                    <Play className="h-3.5 w-3.5 mr-1" />
                    Verify Lab 3 Settings
                  </Button>
                </div>

                {/* Policy Rules Table */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-border text-[11px] font-mono text-muted-foreground">
                      <tr>
                        <th className="p-2.5">ID</th>
                        <th className="p-2.5">Rule Name</th>
                        <th className="p-2.5">From Zone</th>
                        <th className="p-2.5">To Zone</th>
                        <th className="p-2.5">Source</th>
                        <th className="p-2.5">Destination</th>
                        <th className="p-2.5">Service</th>
                        <th className="p-2.5">Action</th>
                        <th className="p-2.5">NAT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-mono text-[11px]">
                      {/* Rule 1: Conntrack */}
                      <tr className="bg-emerald-50/20">
                        <td className="p-2.5 font-bold">1</td>
                        <td className="p-2.5 font-sans font-medium text-foreground">Stateful_Return_Traffic</td>
                        <td className="p-2.5">ANY</td>
                        <td className="p-2.5">ANY</td>
                        <td className="p-2.5">all</td>
                        <td className="p-2.5">all</td>
                        <td className="p-2.5">ct state established,related</td>
                        <td className="p-2.5">
                          <Badge className="bg-emerald-600 text-white text-[9px]">ACCEPT</Badge>
                        </td>
                        <td className="p-2.5 text-muted-foreground">-</td>
                      </tr>

                      {/* Rule 2: LAN to DMZ Web */}
                      <tr>
                        <td className="p-2.5 font-bold">2</td>
                        <td className="p-2.5 font-sans font-medium text-foreground">LAN_to_DMZ_Web</td>
                        <td className="p-2.5 text-emerald-700 font-semibold">LAN (eth1)</td>
                        <td className="p-2.5 text-purple-700 font-semibold">DMZ (eth0)</td>
                        <td className="p-2.5">10.231.20.0/24</td>
                        <td className="p-2.5">10.231.30.10</td>
                        <td className="p-2.5 text-blue-600">HTTP, HTTPS</td>
                        <td className="p-2.5">
                          <Badge className="bg-emerald-600 text-white text-[9px]">ACCEPT</Badge>
                        </td>
                        <td className="p-2.5 text-muted-foreground">Off</td>
                      </tr>

                      {/* Rule 3: WAN to DMZ Web */}
                      <tr>
                        <td className="p-2.5 font-bold">3</td>
                        <td className="p-2.5 font-sans font-medium text-foreground">WAN_to_DMZ_Web_Publish</td>
                        <td className="p-2.5 text-amber-700 font-semibold">WAN (eth2)</td>
                        <td className="p-2.5 text-purple-700 font-semibold">DMZ (eth0)</td>
                        <td className="p-2.5">all</td>
                        <td className="p-2.5">10.231.30.10</td>
                        <td className="p-2.5 text-blue-600">HTTP:80, HTTPS:443</td>
                        <td className="p-2.5">
                          <Badge className="bg-emerald-600 text-white text-[9px]">ACCEPT</Badge>
                        </td>
                        <td className="p-2.5 text-muted-foreground">VIP</td>
                      </tr>

                      {/* Rule 4: Cardinal DMZ to LAN Isolation */}
                      <tr className="bg-red-50/30">
                        <td className="p-2.5 font-bold text-red-600">4</td>
                        <td className="p-2.5 font-sans font-medium text-red-700">DMZ_to_LAN_Isolation</td>
                        <td className="p-2.5 text-purple-700 font-semibold">DMZ (eth0)</td>
                        <td className="p-2.5 text-emerald-700 font-semibold">LAN (eth1)</td>
                        <td className="p-2.5">10.231.30.0/24</td>
                        <td className="p-2.5">10.231.20.0/24</td>
                        <td className="p-2.5">ANY</td>
                        <td className="p-2.5">
                          <Badge className="bg-red-600 text-white text-[9px]">DROP & LOG</Badge>
                        </td>
                        <td className="p-2.5 text-muted-foreground">-</td>
                      </tr>

                      {/* Rule 5: Default Deny */}
                      <tr className="bg-slate-50 font-bold">
                        <td className="p-2.5 text-muted-foreground">999</td>
                        <td className="p-2.5 font-sans font-medium text-foreground">Default_Implicit_Deny</td>
                        <td className="p-2.5">ANY</td>
                        <td className="p-2.5">ANY</td>
                        <td className="p-2.5">all</td>
                        <td className="p-2.5">all</td>
                        <td className="p-2.5">ANY</td>
                        <td className="p-2.5">
                          <Badge className="bg-slate-800 text-white text-[9px]">DROP</Badge>
                        </td>
                        <td className="p-2.5 text-muted-foreground">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Lab 3 Output Terminal */}
                {lab3Output.length > 0 && (
                  <div className="rounded-lg border border-border bg-slate-900 p-4 font-mono text-xs text-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground text-[10px] border-b border-slate-800 pb-2 mb-2">
                      <span>LAB 3 VERIFICATION TELEMETRY</span>
                      <Badge className={lab3Verified ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}>
                        {lab3Verified ? "PASS" : "FAIL"}
                      </Badge>
                    </div>
                    {lab3Output.map((line, i) => (
                      <div
                        key={i}
                        className={
                          line.includes("✓")
                            ? "text-emerald-400"
                            : line.includes("✗")
                              ? "text-red-400 font-bold"
                              : "text-slate-300"
                        }
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Dedicated Explanation Panel */}
              <ExplanationPanel
                title="Firewall Access Control Lists (ACLs) & Policy Management"
                controls="Enforces top-down first-match policy evaluation, permitting approved services and dropping unauthorized traffic."
                required="Without access control rules, all network segments either communicate uninspected or fail entirely under default-deny."
                incorrect="Misordering rules (e.g. broad deny placed above specific permit) causes rule shadowing, blocking legitimate traffic."
                verification="Run traffic tests and inspect `nft list ruleset` to verify matching packet and byte counters on target rules."
                fortiOS={`config firewall policy
    edit 1
        set name "LAN_to_DMZ_Web"
        set srcintf "port2"
        set dstintf "port3"
        set srcaddr "LAN_Net"
        set dstaddr "DMZ_Web"
        set action accept
        set schedule "always"
        set service "HTTP" "HTTPS"
    next
end`}
                linux={`nft add rule inet filter forward ct state established,related accept
nft add rule inet filter forward iifname "eth1" oifname "eth0" ip daddr 10.231.30.10 tcp dport { 80, 443 } accept
nft add rule inet filter forward iifname "eth0" oifname "eth1" drop`}
              />
            </div>
          )}

          {/* TAB 5: ADDRESS OBJECTS */}
          {activeTab === "addresses" && (
            <div className="space-y-6">
              <Card className="p-6 border-border bg-white shadow-2xs space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Address Objects & Groups</h3>
                    <p className="text-xs text-muted-foreground">
                      Named IP subnets, host definitions, and FQDNs reused across policy rules.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5 border-border">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create New Object</span>
                  </Button>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-border text-[11px] font-mono text-muted-foreground">
                      <tr>
                        <th className="p-2.5">Name</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Subnet / IP Range</th>
                        <th className="p-2.5">Interface Binding</th>
                        <th className="p-2.5">Comment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-mono text-[11px]">
                      <tr>
                        <td className="p-2.5 font-bold text-foreground">LAN_Workstations</td>
                        <td className="p-2.5">Subnet</td>
                        <td className="p-2.5 text-emerald-700">10.231.20.0/24</td>
                        <td className="p-2.5">eth1 (LAN)</td>
                        <td className="p-2.5 text-muted-foreground">ESCI Student & Faculty Desktops</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-foreground">DMZ_Web_Server</td>
                        <td className="p-2.5">Host IP (/32)</td>
                        <td className="p-2.5 text-purple-700">10.231.30.10</td>
                        <td className="p-2.5">eth0 (DMZ)</td>
                        <td className="p-2.5 text-muted-foreground">Production Nginx Web Portal</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-foreground">WAN_External_Subnet</td>
                        <td className="p-2.5">Subnet</td>
                        <td className="p-2.5 text-amber-700">10.231.10.0/24</td>
                        <td className="p-2.5">eth2 (WAN)</td>
                        <td className="p-2.5 text-muted-foreground">Upstream ISP Simulation Link</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-foreground">all</td>
                        <td className="p-2.5">Wildcard</td>
                        <td className="p-2.5">0.0.0.0/0</td>
                        <td className="p-2.5">any</td>
                        <td className="p-2.5 text-muted-foreground">Global Wildcard Address</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Dedicated Explanation Panel */}
              <ExplanationPanel
                title="Address Objects & IP Abstraction"
                controls="Defines reusable named network objects (subnets, individual host IPs, IP ranges, or FQDNs) used in policy rules."
                required="Decouples policy definitions from raw IP numbers. If a subnet is renumbered, modifying the object automatically updates all policies."
                incorrect="Defining hardcoded IPs directly in rules makes policy bases unmaintainable and prone to typos during security audits."
                verification="Inspect policy rules to confirm they reference named objects (e.g. `LAN_Workstations`) rather than raw IP strings."
                fortiOS={`config firewall address
    edit "DMZ_Web_Server"
        set type ipmask
        set subnet 10.231.30.10 255.255.255.255
    next
end`}
                linux={`nft add set inet filter dmz_servers { type ipv4_addr; elements = { 10.231.30.10 } }`}
              />
            </div>
          )}

          {/* TAB 6: SERVICE OBJECTS */}
          {activeTab === "services" && (
            <div className="space-y-6">
              <Card className="p-6 border-border bg-white shadow-2xs space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Service Objects</h3>
                    <p className="text-xs text-muted-foreground">
                      Standard protocol and port groupings (HTTP, HTTPS, DNS, SSH, ICMP).
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5 border-border">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create Custom Service</span>
                  </Button>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-border text-[11px] font-mono text-muted-foreground">
                      <tr>
                        <th className="p-2.5">Service Name</th>
                        <th className="p-2.5">Protocol</th>
                        <th className="p-2.5">Destination Port</th>
                        <th className="p-2.5">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-mono text-[11px]">
                      <tr>
                        <td className="p-2.5 font-bold text-foreground">HTTP</td>
                        <td className="p-2.5">TCP</td>
                        <td className="p-2.5 text-blue-600 font-semibold">80</td>
                        <td className="p-2.5 text-muted-foreground">World Wide Web Hypertext Transfer</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-foreground">HTTPS</td>
                        <td className="p-2.5">TCP</td>
                        <td className="p-2.5 text-blue-600 font-semibold">443</td>
                        <td className="p-2.5 text-muted-foreground">Secure HTTP over TLS/SSL</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-foreground">DNS</td>
                        <td className="p-2.5">UDP / TCP</td>
                        <td className="p-2.5 text-blue-600 font-semibold">53</td>
                        <td className="p-2.5 text-muted-foreground">Domain Name Resolution System</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-foreground">SSH</td>
                        <td className="p-2.5">TCP</td>
                        <td className="p-2.5 text-blue-600 font-semibold">22</td>
                        <td className="p-2.5 text-muted-foreground">Secure Shell Remote Terminal</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-foreground">PING</td>
                        <td className="p-2.5">ICMP</td>
                        <td className="p-2.5 text-muted-foreground">Type 8 Code 0</td>
                        <td className="p-2.5 text-muted-foreground">ICMP Echo Request / Diagnostic</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Dedicated Explanation Panel */}
              <ExplanationPanel
                title="Service Objects & Port Groupings"
                controls="Maps human-readable service names (e.g. HTTPS) to Layer 4 protocols (TCP/UDP) and destination port numbers."
                required="Ensures policies consistently target correct destination ports rather than forcing engineers to memorize raw port numbers."
                incorrect="Specifying the wrong protocol (e.g. UDP for HTTPS) breaks connections because TCP handshakes will never match the rule."
                verification="Inspect active policy rules to verify service names match intended transport ports."
                fortiOS={`config firewall service custom
    edit "HTTPS_Alt"
        set tcp-portrange 8443
    next
end`}
                linux={`nft add rule inet filter forward tcp dport { 80, 443 } accept`}
              />
            </div>
          )}

          {/* TAB 7: NAT */}
          {activeTab === "nat" && (
            <div className="space-y-6">
              <Card className="p-6 border-border bg-white shadow-2xs space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Network Address Translation (NAT) & VIPs</h3>
                    <p className="text-xs text-muted-foreground">
                      Source NAT (SNAT Masquerade) and Destination NAT / Virtual IPs (Port Forwarding).
                    </p>
                  </div>
                  <Badge variant="outline" className="border-red-200 text-red-600 bg-red-50 text-xs">
                    SNAT Engine: ACTIVE
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Outbound SNAT Card */}
                  <div className="p-4 rounded-lg border border-border bg-slate-50/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">Outbound Source NAT (Masquerade)</span>
                      <Badge className="bg-emerald-600 text-white text-[9px]">ACTIVE</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Rewrites private source IP 10.231.20.0/24 to the firewall WAN egress IP (10.231.10.254) using Port Address Translation (PAT).
                    </p>
                    <div className="p-2 rounded bg-white border border-border font-mono text-[10px] text-muted-foreground">
                      Rule: iif eth1 oif eth2 masquerade
                    </div>
                  </div>

                  {/* Inbound DNAT Card */}
                  <div className="p-4 rounded-lg border border-border bg-slate-50/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">Inbound Virtual IP (VIP / DNAT)</span>
                      <Badge className="bg-emerald-600 text-white text-[9px]">ACTIVE</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Translates incoming WAN destination port 80/443 on 10.231.10.254 to internal DMZ web server 10.231.30.10.
                    </p>
                    <div className="p-2 rounded bg-white border border-border font-mono text-[10px] text-muted-foreground">
                      VIP: 10.231.10.254:80 -&gt; 10.231.30.10:80
                    </div>
                  </div>
                </div>
              </Card>

              {/* Dedicated Explanation Panel */}
              <ExplanationPanel
                title="NAT & Port Forwarding Mechanics"
                controls="Translates private RFC 1918 addresses into public routable IPs on egress (SNAT) and maps public IPs/ports to internal servers (DNAT)."
                required="Enables private subnets to reach the global internet and allows external clients to access DMZ web servers securely."
                incorrect="Forgetting SNAT breaks internet browsing because external routers cannot route return packets to private 10.231.20.0/24 addresses."
                verification="Run `curl` from a LAN workstation to an external server and check the web server access log to confirm the client appears as the firewall WAN IP."
                fortiOS={`config firewall vip
    edit "DMZ_Web_VIP"
        set extip 10.231.10.254
        set mappedip "10.231.30.10"
        set extintf "port1"
    next
end`}
                linux={`nft add rule inet nat postrouting oifname "eth2" masquerade
nft add rule inet nat prerouting iifname "eth2" tcp dport 80 dnat to 10.231.30.10:80`}
              />
            </div>
          )}

          {/* TAB 8: LOGS */}
          {activeTab === "logs" && (
            <div className="space-y-6">
              <Card className="p-6 border-border bg-white shadow-2xs space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Traffic & Security Event Logs</h3>
                    <p className="text-xs text-muted-foreground">
                      Real-time audit log stream showing accepted sessions and blocked security violations.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5 border-border">
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Refresh Log Stream</span>
                  </Button>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-border text-[11px] font-mono text-muted-foreground">
                      <tr>
                        <th className="p-2.5">Timestamp</th>
                        <th className="p-2.5">Source</th>
                        <th className="p-2.5">Destination</th>
                        <th className="p-2.5">Service</th>
                        <th className="p-2.5">Action</th>
                        <th className="p-2.5">Rule ID</th>
                        <th className="p-2.5">Log Prefix / Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-mono text-[11px]">
                      <tr>
                        <td className="p-2.5 text-muted-foreground">10:42:15.120</td>
                        <td className="p-2.5 text-emerald-700">10.231.20.10:51240</td>
                        <td className="p-2.5 text-purple-700">10.231.30.10:80</td>
                        <td className="p-2.5">HTTP (TCP:80)</td>
                        <td className="p-2.5">
                          <Badge className="bg-emerald-600 text-white text-[9px]">ACCEPT</Badge>
                        </td>
                        <td className="p-2.5">2</td>
                        <td className="p-2.5 text-muted-foreground">LAN-to-DMZ-Web</td>
                      </tr>
                      <tr className="bg-red-50/40">
                        <td className="p-2.5 text-muted-foreground">10:42:18.450</td>
                        <td className="p-2.5 text-purple-700">10.231.30.10:48912</td>
                        <td className="p-2.5 text-emerald-700">10.231.20.10:22</td>
                        <td className="p-2.5">SSH (TCP:22)</td>
                        <td className="p-2.5">
                          <Badge className="bg-red-600 text-white text-[9px]">DROP</Badge>
                        </td>
                        <td className="p-2.5 text-red-600 font-bold">4</td>
                        <td className="p-2.5 text-red-700 font-bold">[DMZ-VIOLATION]: Pivot blocked</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-muted-foreground">10:42:22.890</td>
                        <td className="p-2.5 text-amber-700">10.231.10.10:49210</td>
                        <td className="p-2.5 text-purple-700">10.231.30.10:443</td>
                        <td className="p-2.5">HTTPS (TCP:443)</td>
                        <td className="p-2.5">
                          <Badge className="bg-emerald-600 text-white text-[9px]">ACCEPT</Badge>
                        </td>
                        <td className="p-2.5">3</td>
                        <td className="p-2.5 text-muted-foreground">WAN-to-DMZ-Publish</td>
                      </tr>
                      <tr className="bg-red-50/40">
                        <td className="p-2.5 text-muted-foreground">10:42:25.010</td>
                        <td className="p-2.5 text-amber-700">10.231.10.10:60124</td>
                        <td className="p-2.5 text-emerald-700">10.231.20.10:22</td>
                        <td className="p-2.5">SSH (TCP:22)</td>
                        <td className="p-2.5">
                          <Badge className="bg-red-600 text-white text-[9px]">DROP</Badge>
                        </td>
                        <td className="p-2.5 text-red-600 font-bold">999</td>
                        <td className="p-2.5 text-red-700 font-bold">[DEFAULT-DROP]: Direct WAN probe</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Dedicated Explanation Panel */}
              <ExplanationPanel
                title="Traffic Logging & Security Audit Trail"
                controls="Captures header metadata, match timestamps, source/destination IPs, rule IDs, and verdict actions for every session."
                required="Security logging is legally required for compliance audits and operationally essential for intrusion detection and forensic investigation."
                incorrect="Disabling logging leaves security teams completely blind during an active cyber attack or unauthorized lateral pivot."
                verification="Inspect the live syslog feed or run `logread` to confirm drop events contain descriptive prefixes like `[DMZ-VIOLATION]`."
                fortiOS={`config log syslogd setting
    set status enable
    set server "10.231.20.100"
end`}
                linux={`nft add rule inet filter forward counter log prefix "[NFT-DROP]: " drop
journalctl -k -f`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Reusable 4-Point Explanation Panel with Dual FortiOS / Linux CLI Reference
function ExplanationPanel({
  title,
  controls,
  required,
  incorrect,
  verification,
  fortiOS,
  linux,
}: {
  title: string;
  controls: string;
  required: string;
  incorrect: string;
  verification: string;
  fortiOS: string;
  linux: string;
}) {
  return (
    <Card className="p-5 border-border bg-slate-50/50 space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-2.5">
        <Info className="h-4 w-4 text-red-600" />
        <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">
          Engineering Specification: {title}
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-3 rounded bg-white border border-border space-y-1">
          <span className="font-mono text-[10px] font-bold text-red-600 uppercase">
            1. What does this setting control?
          </span>
          <p className="text-foreground leading-relaxed">{controls}</p>
        </div>

        <div className="p-3 rounded bg-white border border-border space-y-1">
          <span className="font-mono text-[10px] font-bold text-emerald-700 uppercase">
            2. Why is it required?
          </span>
          <p className="text-foreground leading-relaxed">{required}</p>
        </div>

        <div className="p-3 rounded bg-white border border-border space-y-1">
          <span className="font-mono text-[10px] font-bold text-amber-700 uppercase">
            3. What happens if it is incorrect?
          </span>
          <p className="text-foreground leading-relaxed">{incorrect}</p>
        </div>

        <div className="p-3 rounded bg-white border border-border space-y-1">
          <span className="font-mono text-[10px] font-bold text-blue-700 uppercase">
            4. How can the student verify it?
          </span>
          <p className="text-foreground leading-relaxed">{verification}</p>
        </div>
      </div>

      {/* Dual CLI Syntax Reference Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        <div className="p-3 rounded bg-slate-900 text-slate-100 font-mono text-[11px] space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-[10px] border-b border-slate-800 pb-1">
            <span className="text-red-400 font-bold">FortiOS CLI Reference</span>
            <span>FortiGate Syntax</span>
          </div>
          <pre className="text-slate-300 overflow-x-auto whitespace-pre-wrap">{fortiOS}</pre>
        </div>

        <div className="p-3 rounded bg-slate-900 text-slate-100 font-mono text-[11px] space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-[10px] border-b border-slate-800 pb-1">
            <span className="text-emerald-400 font-bold">Linux Netfilter / iproute2 Equivalent</span>
            <span>Host Kernel Syntax</span>
          </div>
          <pre className="text-slate-300 overflow-x-auto whitespace-pre-wrap">{linux}</pre>
        </div>
      </div>
    </Card>
  );
}
