import React, { useState } from "react";
import {
  Shield,
  Server,
  Monitor,
  Globe,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Info,
  Terminal,
  Activity,
  Network,
  Cpu,
  Layers,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DAY2_ADDRESSING } from "@/lib/day2-curriculum";

export interface PacketFlowScenario {
  id: string;
  name: string;
  sourceNode: string;
  sourceIp: string;
  destNode: string;
  destIp: string;
  protocol: "TCP" | "UDP" | "ICMP";
  port: number | string;
  service: string;
  verdict: "ACCEPTED" | "DROPPED";
  matchingRule: string;
  conntrackState: string;
  narrative: string;
}

const PRESET_SCENARIOS: PacketFlowScenario[] = [
  {
    id: "lan-to-dmz-web",
    name: "LAN User visits DMZ Web Server",
    sourceNode: "sxl-lan01 (LAN Workstation)",
    sourceIp: "10.231.20.10:54320",
    destNode: "sxl-dmz01 (Nginx Web)",
    destIp: "10.231.30.10:80",
    protocol: "TCP",
    port: 80,
    service: "HTTP Web Traffic",
    verdict: "ACCEPTED",
    matchingRule: "iif eth1 oif eth0 ip daddr 10.231.30.10 tcp dport { 80, 443 } accept",
    conntrackState: "NEW -> ESTABLISHED",
    narrative:
      "Internal workstation on LAN initiates HTTP request to DMZ web portal. sxl-fw01 evaluates LAN-to-DMZ policy, logs match, and creates a dynamic conntrack entry for return packets.",
  },
  {
    id: "lan-to-wan-https",
    name: "LAN User browses External Internet",
    sourceNode: "sxl-lan01 (LAN Workstation)",
    sourceIp: "10.231.20.10:51240",
    destNode: "sxl-wan01 (External ISP)",
    destIp: "10.231.10.10:443",
    protocol: "TCP",
    port: 443,
    service: "HTTPS Outbound",
    verdict: "ACCEPTED",
    matchingRule: "iif eth1 oif eth2 accept",
    conntrackState: "NEW -> ESTABLISHED",
    narrative:
      "Workstation requests secure outbound connection to external service. Allowed by standard outbound internet policy with stateful session tracking.",
  },
  {
    id: "wan-to-dmz-https",
    name: "External Citizen queries DMZ Web Server",
    sourceNode: "sxl-wan01 (External Client)",
    sourceIp: "10.231.10.10:49210",
    destNode: "sxl-dmz01 (Nginx Web)",
    destIp: "10.231.30.10:443",
    protocol: "TCP",
    port: 443,
    service: "HTTPS Inbound Publishing",
    verdict: "ACCEPTED",
    matchingRule: "iif eth2 oif eth0 ip daddr 10.231.30.10 tcp dport 443 accept",
    conntrackState: "NEW -> ESTABLISHED",
    narrative:
      "Public user connects to official DMZ web services. Traffic arrives on eth2, matches inbound publishing ACL, and routes safely to eth0 DMZ without touching internal LAN.",
  },
  {
    id: "wan-to-lan-attack",
    name: "WAN Attacker probes Internal LAN (Direct Probe)",
    sourceNode: "sxl-wan01 (External Attacker)",
    sourceIp: "10.231.10.10:60124",
    destNode: "sxl-lan01 (LAN Workstation)",
    destIp: "10.231.20.10:22",
    protocol: "TCP",
    port: 22,
    service: "SSH Brute-Force Probe",
    verdict: "DROPPED",
    matchingRule: "chain forward { policy drop; } (Default-Deny Posture)",
    conntrackState: "INVALID / NO_MATCH",
    narrative:
      "External attacker attempts unsolicited SSH connection to internal workstation. sxl-fw01 evaluates forward chain, finds no permitting rule, drops the packet, and increments telemetry drop counter.",
  },
  {
    id: "dmz-to-lan-lateral",
    name: "Compromised DMZ Server probes Internal LAN",
    sourceNode: "sxl-dmz01 (Compromised Web Server)",
    sourceIp: "10.231.30.10:41020",
    destNode: "sxl-lan01 (LAN Workstation)",
    destIp: "10.231.20.10:445",
    protocol: "TCP",
    port: 445,
    service: "SMB Lateral Movement Attempt",
    verdict: "DROPPED",
    matchingRule: "iif eth0 oif eth1 counter drop (DMZ Isolation Enforcement)",
    conntrackState: "DROPPED / LOGGED",
    narrative:
      "Attacker compromises DMZ web server and attempts lateral movement into internal LAN file shares. Explicit DMZ-to-LAN isolation rule halts the packet immediately, preventing perimeter breach.",
  },
  {
    id: "wan-to-fw-mgmt",
    name: "WAN Attacker attempts Firewall Management",
    sourceNode: "sxl-wan01 (External Attacker)",
    sourceIp: "10.231.10.10:55120",
    destNode: "sxl-fw01 (Firewall Control Plane)",
    destIp: "10.231.10.254:22",
    protocol: "TCP",
    port: 22,
    service: "Control Plane Hijack Attempt",
    verdict: "DROPPED",
    matchingRule: "chain input { policy drop; } (Control Plane Protection)",
    conntrackState: "DROPPED",
    narrative:
      "Attacker targets firewall external IP directly on port 22. In the input chain, management is only allowed from LAN eth1. Packet is dropped instantly before reaching the SSH daemon.",
  },
  {
    id: "lan-to-fw-mgmt",
    name: "Authorized Admin manages Firewall via SSH",
    sourceNode: "sxl-lan01 (Authorized Admin)",
    sourceIp: "10.231.20.10:52110",
    destNode: "sxl-fw01 (Firewall Control Plane)",
    destIp: "10.231.20.254:22",
    protocol: "TCP",
    port: 22,
    service: "Administrative SSH Console",
    verdict: "ACCEPTED",
    matchingRule: "iif eth1 ip saddr 10.231.20.10 tcp dport 22 accept",
    conntrackState: "NEW -> ESTABLISHED",
    narrative:
      "Authorized system administrator on internal management station connects to sxl-fw01 LAN IP. In-band management policy authenticates source IP and permits SSH terminal session.",
  },
];

export function Day2TopologyCanvas() {
  const [selectedNode, setSelectedNode] = useState<string>("firewall");
  const [activeScenario, setActiveScenario] = useState<PacketFlowScenario>(PRESET_SCENARIOS[0]!);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simStep, setSimStep] = useState<number>(0);
  const [simHistory, setSimHistory] = useState<
    { time: string; name: string; verdict: "ACCEPTED" | "DROPPED" }[]
  >([]);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimStep(1);

    setTimeout(() => setSimStep(2), 600);
    setTimeout(() => setSimStep(3), 1200);
    setTimeout(() => {
      setSimStep(4);
      setIsSimulating(false);
      setSimHistory((prev) => [
        {
          time: new Date().toLocaleTimeString(),
          name: activeScenario.name,
          verdict: activeScenario.verdict,
        },
        ...prev.slice(0, 5),
      ]);
    }, 1800);
  };

  return (
    <div className="day2-topology-canvas space-y-6">
      {/* Top Banner & Mode Disclosure */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-500/30 bg-card/60 p-4">
        <div>
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300 font-mono">
              ESCI PILOT TOPOLOGY & PACKET FLOW TRACER
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Interactive visual network model for WAN (10.231.10.0/24), LAN (10.231.20.0/24), and DMZ (10.231.30.0/24).
          </p>
        </div>
        <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 font-mono text-[11px]">
          <span className="h-2 w-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
          DETERMINISTIC SIMULATION ENGINE
        </Badge>
      </div>

      {/* Main Visual Topology Map */}
      <div className="relative rounded-2xl border border-border/80 bg-slate-950/90 p-6 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(#00e5ff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        {/* 3-Zone Architecture Diagram */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* WAN ZONE (Outside) */}
          <div
            onClick={() => setSelectedNode("wan")}
            className={`cursor-pointer rounded-xl border p-4 transition-all ${
              selectedNode === "wan"
                ? "border-amber-500 bg-amber-950/25 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                : "border-border/60 bg-card/40 hover:border-amber-500/50"
            }`}
          >
            <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-3">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 font-mono text-[10px]">
                OUTSIDE ZONE (TRUST 0)
              </Badge>
              <Globe className="h-4 w-4 text-amber-400" />
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="text-foreground font-bold text-sm">sxl-wan01</div>
              <div className="text-muted-foreground text-[11px]">Subnet: 10.231.10.0/24</div>
              <div className="text-amber-400 font-semibold">IP: 10.231.10.10</div>
              <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                Firewall Link: eth2 (10.231.10.254)
              </div>
            </div>
          </div>

          {/* FIREWALL CORE (sxl-fw01) */}
          <div
            onClick={() => setSelectedNode("firewall")}
            className={`cursor-pointer rounded-xl border p-5 text-center transition-all ${
              selectedNode === "firewall"
                ? "border-cyan-500 bg-cyan-950/30 shadow-[0_0_25px_rgba(0,229,255,0.25)]"
                : "border-cyan-500/50 bg-card/50 hover:border-cyan-400"
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-cyan-400" />
              <span className="font-mono text-xs font-bold uppercase text-cyan-300">
                SECURITY GATEWAY
              </span>
            </div>
            <div className="text-lg font-extrabold text-foreground font-mono">sxl-fw01</div>
            <div className="text-[11px] text-cyan-400/90 font-mono mt-0.5">
              nftables v1.0.6 Stateful Core
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/70 pt-3 text-[10px] font-mono">
              <div className="p-1.5 rounded bg-slate-900 border border-border/60">
                <span className="text-amber-400 font-bold">eth2</span>
                <div className="text-muted-foreground text-[9px]">10.231.10.254</div>
                <div className="text-amber-300/80 text-[8px] uppercase">WAN</div>
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-border/60">
                <span className="text-emerald-400 font-bold">eth1</span>
                <div className="text-muted-foreground text-[9px]">10.231.20.254</div>
                <div className="text-emerald-300/80 text-[8px] uppercase">LAN</div>
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-border/60">
                <span className="text-purple-400 font-bold">eth0</span>
                <div className="text-muted-foreground text-[9px]">10.231.30.254</div>
                <div className="text-purple-300/80 text-[8px] uppercase">DMZ</div>
              </div>
            </div>
          </div>

          {/* INTERNAL ZONES: LAN & DMZ */}
          <div className="space-y-4">
            {/* LAN ZONE (Inside) */}
            <div
              onClick={() => setSelectedNode("lan")}
              className={`cursor-pointer rounded-xl border p-4 transition-all ${
                selectedNode === "lan"
                  ? "border-emerald-500 bg-emerald-950/25 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : "border-border/60 bg-card/40 hover:border-emerald-500/50"
              }`}
            >
              <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-2">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-mono text-[10px]">
                  INSIDE ZONE (TRUST 100)
                </Badge>
                <Monitor className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="space-y-1 font-mono text-xs">
                <div className="text-foreground font-bold text-sm">sxl-lan01 (Workstation)</div>
                <div className="text-muted-foreground text-[11px]">Subnet: 10.231.20.0/24</div>
                <div className="text-emerald-400 font-semibold">IP: 10.231.20.10</div>
                <div className="text-[10px] text-muted-foreground">Gateway: 10.231.20.254 (eth1)</div>
              </div>
            </div>

            {/* DMZ ZONE (Perimeter Services) */}
            <div
              onClick={() => setSelectedNode("dmz")}
              className={`cursor-pointer rounded-xl border p-4 transition-all ${
                selectedNode === "dmz"
                  ? "border-purple-500 bg-purple-950/25 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                  : "border-border/60 bg-card/40 hover:border-purple-500/50"
              }`}
            >
              <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-2">
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 font-mono text-[10px]">
                  DMZ ZONE (TRUST 50)
                </Badge>
                <Server className="h-4 w-4 text-purple-400" />
              </div>
              <div className="space-y-1 font-mono text-xs">
                <div className="text-foreground font-bold text-sm">sxl-dmz01 (Nginx Web)</div>
                <div className="text-muted-foreground text-[11px]">Subnet: 10.231.30.0/24</div>
                <div className="text-purple-400 font-semibold">IP: 10.231.30.10 (HTTP:80, HTTPS:443)</div>
                <div className="text-[10px] text-muted-foreground">Gateway: 10.231.30.254 (eth0)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Packet Flight Indicator (when simulating) */}
        {isSimulating && (
          <div className="mt-6 rounded-lg border border-cyan-500/50 bg-slate-900/90 p-3 font-mono text-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-cyan-300">
                {simStep === 1 && `[STEP 1/4] Transmitting packet from ${activeScenario.sourceIp}...`}
                {simStep === 2 && `[STEP 2/4] Arrived at sxl-fw01: Kernel IP forwarding check & route lookup...`}
                {simStep === 3 && `[STEP 3/4] Netfilter FORWARD chain evaluation against rule: ${activeScenario.matchingRule}...`}
                {simStep === 4 && `[STEP 4/4] Final Verdict reached: ${activeScenario.verdict}`}
              </span>
            </div>
            <Badge
              className={
                activeScenario.verdict === "ACCEPTED"
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "bg-rose-500 text-slate-950 font-bold"
              }
            >
              {activeScenario.verdict}
            </Badge>
          </div>
        )}
      </div>

      {/* Interactive Control Deck: Flow Scenario Selector & Packet Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Deck */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5 border-border/80 bg-card/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-cyan-400" />
                <h4 className="font-mono text-xs font-bold uppercase text-foreground">
                  ENTERPRISE TRAFFIC FLOW SCENARIOS ({PRESET_SCENARIOS.length})
                </h4>
              </div>
              <Button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                size="sm"
                className="gap-1.5 bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold text-xs h-8 shadow-[0_0_12px_rgba(0,229,255,0.3)]"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>TRACE PACKET FLOW</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_SCENARIOS.map((scenario) => {
                const isSelected = activeScenario.id === scenario.id;
                const isPass = scenario.verdict === "ACCEPTED";

                return (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => setActiveScenario(scenario)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "border-cyan-500 bg-cyan-500/15 shadow-[0_0_12px_rgba(0,229,255,0.12)] text-foreground font-medium"
                        : "border-border/60 bg-card/40 text-muted-foreground hover:bg-card/70 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[10px] text-cyan-400 uppercase font-bold">
                        {scenario.protocol} • {scenario.service}
                      </span>
                      <span
                        className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          isPass
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-950/60 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {scenario.verdict}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-foreground mt-1 line-clamp-1">
                      {scenario.name}
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground mt-0.5 truncate">
                      {scenario.sourceIp} → {scenario.destIp}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Scenario Trace Detail */}
            <div className="rounded-xl border border-cyan-500/40 bg-slate-950 p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-border/80 pb-2">
                <span className="text-cyan-300 font-bold uppercase tracking-wider">
                  ACTIVE FLOW TRACE: {activeScenario.name}
                </span>
                <Badge
                  className={
                    activeScenario.verdict === "ACCEPTED"
                      ? "bg-emerald-500 text-slate-950 font-bold"
                      : "bg-rose-500 text-slate-950 font-bold"
                  }
                >
                  {activeScenario.verdict === "ACCEPTED" ? (
                    <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1 inline" />
                  )}
                  {activeScenario.verdict}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 rounded bg-card/50 border border-border/50">
                  <span className="text-muted-foreground text-[10px] block">SOURCE:</span>
                  <span className="text-foreground font-semibold">{activeScenario.sourceIp}</span>
                </div>
                <div className="p-2 rounded bg-card/50 border border-border/50">
                  <span className="text-muted-foreground text-[10px] block">DESTINATION:</span>
                  <span className="text-foreground font-semibold">{activeScenario.destIp}</span>
                </div>
                <div className="p-2 rounded bg-card/50 border border-border/50">
                  <span className="text-muted-foreground text-[10px] block">PROTOCOL:</span>
                  <span className="text-cyan-400 font-semibold">{activeScenario.protocol} (Port {activeScenario.port})</span>
                </div>
                <div className="p-2 rounded bg-card/50 border border-border/50">
                  <span className="text-muted-foreground text-[10px] block">CONNTRACK:</span>
                  <span className="text-emerald-400 font-semibold">{activeScenario.conntrackState}</span>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-muted-foreground text-[10px] block">EVALUATED RULE:</span>
                <code className="text-cyan-300 bg-card/70 px-2.5 py-1.5 rounded block text-[11px] border border-border/60">
                  {activeScenario.matchingRule}
                </code>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed font-sans pt-1">
                {activeScenario.narrative}
              </p>
            </div>
          </Card>
        </div>

        {/* Node Detail Drawer / Inspection Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-5 border-border/80 bg-card/60 space-y-4">
            <div className="flex items-center gap-2 border-b border-border/80 pb-3">
              <Info className="h-4 w-4 text-cyan-400" />
              <h4 className="font-mono text-xs font-bold uppercase text-foreground">
                NODE INSPECTION DRAWER
              </h4>
            </div>

            {selectedNode === "firewall" && (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-cyan-400 uppercase font-bold">NODE IDENTITY</span>
                  <div className="text-base font-bold text-foreground mt-0.5">sxl-fw01</div>
                  <div className="text-muted-foreground text-[11px]">
                    nftables v1.0.6 (Linux 6.x Netfilter Core)
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-border/60 pt-2.5 text-[11px]">
                  <span className="text-muted-foreground text-[10px] uppercase font-bold">
                    ACTIVE INTERFACES:
                  </span>
                  <div className="p-2 rounded bg-slate-950 border border-border/60 space-y-1">
                    <div className="text-amber-400">eth2: 10.231.10.254/24 (WAN)</div>
                    <div className="text-emerald-400">eth1: 10.231.20.254/24 (LAN)</div>
                    <div className="text-purple-400">eth0: 10.231.30.254/24 (DMZ)</div>
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-border/60 pt-2.5 text-[11px]">
                  <span className="text-muted-foreground text-[10px] uppercase font-bold">
                    KERNEL PARAMETERS:
                  </span>
                  <div className="p-2 rounded bg-slate-950 border border-border/60 space-y-0.5 text-cyan-300">
                    <div>net.ipv4.ip_forward = 1</div>
                    <div>net.netfilter.nf_conntrack_max = 262144</div>
                    <div>net.ipv4.tcp_syncookies = 1</div>
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-border/60 pt-2.5 text-[11px]">
                  <span className="text-muted-foreground text-[10px] uppercase font-bold">
                    DEFAULT POLICY:
                  </span>
                  <div className="p-2 rounded bg-slate-950 border border-border/60 space-y-0.5 text-rose-400">
                    <div>chain input: policy drop</div>
                    <div>chain forward: policy drop</div>
                    <div>chain output: policy accept</div>
                  </div>
                </div>
              </div>
            )}

            {selectedNode === "wan" && (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-amber-400 uppercase font-bold">NODE IDENTITY</span>
                  <div className="text-base font-bold text-foreground mt-0.5">sxl-wan01</div>
                  <div className="text-muted-foreground text-[11px]">Untrusted External Network Host</div>
                </div>
                <div className="p-3 rounded bg-slate-950 border border-border/60 space-y-1 text-[11px]">
                  <div>IP Address: 10.231.10.10/24</div>
                  <div>Default Gateway: 10.231.10.254 (sxl-fw01 eth2)</div>
                  <div>Role: Simulates external public web users & potential threat actors</div>
                </div>
              </div>
            )}

            {selectedNode === "lan" && (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-emerald-400 uppercase font-bold">NODE IDENTITY</span>
                  <div className="text-base font-bold text-foreground mt-0.5">sxl-lan01</div>
                  <div className="text-muted-foreground text-[11px]">Internal Workstation & Admin Host</div>
                </div>
                <div className="p-3 rounded bg-slate-950 border border-border/60 space-y-1 text-[11px]">
                  <div>IP Address: 10.231.20.10/24</div>
                  <div>Default Gateway: 10.231.20.254 (sxl-fw01 eth1)</div>
                  <div>Authorized Privileges: In-band SSH administrative access to sxl-fw01</div>
                </div>
              </div>
            )}

            {selectedNode === "dmz" && (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-purple-400 uppercase font-bold">NODE IDENTITY</span>
                  <div className="text-base font-bold text-foreground mt-0.5">sxl-dmz01</div>
                  <div className="text-muted-foreground text-[11px]">Demilitarized Application Server</div>
                </div>
                <div className="p-3 rounded bg-slate-950 border border-border/60 space-y-1 text-[11px]">
                  <div>IP Address: 10.231.30.10/24</div>
                  <div>Default Gateway: 10.231.30.254 (sxl-fw01 eth0)</div>
                  <div>Active Daemon: Nginx 1.24 (HTTP Port 80, HTTPS Port 443)</div>
                  <div>Security Restriction: Blocked from initiating sessions into LAN</div>
                </div>
              </div>
            )}
          </Card>

          {/* Telemetry Trace History */}
          {simHistory.length > 0 && (
            <Card className="p-4 border-border/80 bg-card/60 space-y-2">
              <span className="font-mono text-[10px] font-bold uppercase text-muted-foreground">
                RECENT SIMULATION LOGS
              </span>
              <div className="space-y-1.5 text-xs font-mono">
                {simHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-1.5 rounded bg-slate-950/70 border border-border/50 text-[11px]"
                  >
                    <span className="text-muted-foreground truncate max-w-[170px]">{item.name}</span>
                    <span
                      className={
                        item.verdict === "ACCEPTED" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"
                      }
                    >
                      {item.verdict}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
