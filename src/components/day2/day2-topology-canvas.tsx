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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-red-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 font-mono">
              ESCI PILOT TOPOLOGY & PACKET FLOW TRACER
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Interactive visual network model for WAN (10.231.10.0/24), LAN (10.231.20.0/24), and DMZ (10.231.30.0/24).
          </p>
        </div>
        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 font-mono text-[11px]">
          <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
          DETERMINISTIC SIMULATION ENGINE
        </Badge>
      </div>

      {/* Main Visual Topology Map */}
      <div className="relative rounded-2xl border border-gray-200 bg-gray-50/70 p-6 overflow-hidden shadow-sm">
        {/* 3-Zone Architecture Diagram */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* WAN ZONE (Outside) */}
          <div
            onClick={() => setSelectedNode("wan")}
            className={`cursor-pointer rounded-xl border p-4 transition-all bg-white shadow-sm ${
              selectedNode === "wan"
                ? "border-amber-500 ring-2 ring-amber-100 shadow-md"
                : "border-gray-200 hover:border-amber-400"
            }`}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
              <Badge className="bg-amber-50 text-amber-800 border-amber-200 font-mono text-[10px]">
                OUTSIDE ZONE (TRUST 0)
              </Badge>
              <Globe className="h-4 w-4 text-amber-600" />
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="text-gray-900 font-bold text-sm">sxl-wan01</div>
              <div className="text-gray-500 text-[11px]">Subnet: 10.231.10.0/24</div>
              <div className="text-amber-700 font-semibold">IP: 10.231.10.10</div>
              <div className="text-[10px] text-gray-500 pt-1 border-t border-gray-100">
                Firewall Link: eth2 (10.231.10.254)
              </div>
            </div>
          </div>

          {/* FIREWALL CORE (sxl-fw01) */}
          <div
            onClick={() => setSelectedNode("firewall")}
            className={`cursor-pointer rounded-xl border p-5 text-center transition-all bg-white shadow-sm ${
              selectedNode === "firewall"
                ? "border-red-600 ring-2 ring-red-100 shadow-md"
                : "border-gray-200 hover:border-red-400"
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-red-600" />
              <span className="font-mono text-xs font-bold uppercase text-red-600">
                SECURITY GATEWAY
              </span>
            </div>
            <div className="text-lg font-extrabold text-gray-900 font-mono">sxl-fw01</div>
            <div className="text-[11px] text-gray-500 font-mono mt-0.5">
              nftables v1.0.6 Stateful Core
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3 text-[10px] font-mono">
              <div className="p-1.5 rounded bg-amber-50/60 border border-amber-100">
                <span className="text-amber-800 font-bold">eth2</span>
                <div className="text-gray-600 text-[9px]">10.231.10.254</div>
                <div className="text-amber-700 text-[8px] uppercase font-semibold">WAN</div>
              </div>
              <div className="p-1.5 rounded bg-emerald-50/60 border border-emerald-100">
                <span className="text-emerald-800 font-bold">eth1</span>
                <div className="text-gray-600 text-[9px]">10.231.20.254</div>
                <div className="text-emerald-700 text-[8px] uppercase font-semibold">LAN</div>
              </div>
              <div className="p-1.5 rounded bg-purple-50/60 border border-purple-100">
                <span className="text-purple-800 font-bold">eth0</span>
                <div className="text-gray-600 text-[9px]">10.231.30.254</div>
                <div className="text-purple-700 text-[8px] uppercase font-semibold">DMZ</div>
              </div>
            </div>
          </div>

          {/* INTERNAL ZONES: LAN & DMZ */}
          <div className="space-y-4">
            {/* LAN ZONE (Inside) */}
            <div
              onClick={() => setSelectedNode("lan")}
              className={`cursor-pointer rounded-xl border p-4 transition-all bg-white shadow-sm ${
                selectedNode === "lan"
                  ? "border-emerald-500 ring-2 ring-emerald-100 shadow-md"
                  : "border-gray-200 hover:border-emerald-400"
              }`}
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 font-mono text-[10px]">
                  INSIDE ZONE (TRUST 100)
                </Badge>
                <Monitor className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="space-y-1 font-mono text-xs">
                <div className="text-gray-900 font-bold text-sm">sxl-lan01 (Workstation)</div>
                <div className="text-gray-500 text-[11px]">Subnet: 10.231.20.0/24</div>
                <div className="text-emerald-700 font-semibold">IP: 10.231.20.10</div>
                <div className="text-[10px] text-gray-500">Gateway: 10.231.20.254 (eth1)</div>
              </div>
            </div>

            {/* DMZ ZONE (Perimeter Services) */}
            <div
              onClick={() => setSelectedNode("dmz")}
              className={`cursor-pointer rounded-xl border p-4 transition-all bg-white shadow-sm ${
                selectedNode === "dmz"
                  ? "border-purple-500 ring-2 ring-purple-100 shadow-md"
                  : "border-gray-200 hover:border-purple-400"
              }`}
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                <Badge className="bg-purple-50 text-purple-800 border-purple-200 font-mono text-[10px]">
                  DMZ ZONE (TRUST 50)
                </Badge>
                <Server className="h-4 w-4 text-purple-600" />
              </div>
              <div className="space-y-1 font-mono text-xs">
                <div className="text-gray-900 font-bold text-sm">sxl-dmz01 (Nginx Web)</div>
                <div className="text-gray-500 text-[11px]">Subnet: 10.231.30.0/24</div>
                <div className="text-purple-700 font-semibold">IP: 10.231.30.10 (HTTP:80, HTTPS:443)</div>
                <div className="text-[10px] text-gray-500">Gateway: 10.231.30.254 (eth0)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Packet Flight Indicator (when simulating) */}
        {isSimulating && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50/70 p-3 font-mono text-xs flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-red-600 animate-ping" />
              <span className="text-red-900 font-medium">
                {simStep === 1 && `[STEP 1/4] Transmitting packet from ${activeScenario.sourceIp}...`}
                {simStep === 2 && `[STEP 2/4] Arrived at sxl-fw01: Kernel IP forwarding check & route lookup...`}
                {simStep === 3 && `[STEP 3/4] Netfilter FORWARD chain evaluation against rule: ${activeScenario.matchingRule}...`}
                {simStep === 4 && `[STEP 4/4] Final Verdict reached: ${activeScenario.verdict}`}
              </span>
            </div>
            <Badge
              className={
                activeScenario.verdict === "ACCEPTED"
                  ? "bg-emerald-600 text-white font-bold"
                  : "bg-red-600 text-white font-bold"
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
          <Card className="p-5 border-gray-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-red-600" />
                <h4 className="font-mono text-xs font-bold uppercase text-gray-900">
                  ENTERPRISE TRAFFIC FLOW SCENARIOS ({PRESET_SCENARIOS.length})
                </h4>
              </div>
              <Button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                size="sm"
                className="gap-1.5 bg-red-600 text-white hover:bg-red-700 font-bold text-xs h-8 shadow-sm"
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
                        ? "border-red-600 bg-red-50 text-gray-900 font-medium shadow-sm"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[10px] text-red-600 uppercase font-bold">
                        {scenario.protocol} • {scenario.service}
                      </span>
                      <span
                        className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          isPass
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {scenario.verdict}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-gray-900 mt-1 line-clamp-1">
                      {scenario.name}
                    </div>
                    <div className="text-[10px] font-mono text-gray-500 mt-0.5 truncate">
                      {scenario.sourceIp} → {scenario.destIp}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Scenario Trace Detail */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-900 font-bold uppercase tracking-wider">
                  ACTIVE FLOW TRACE: {activeScenario.name}
                </span>
                <Badge
                  className={
                    activeScenario.verdict === "ACCEPTED"
                      ? "bg-emerald-600 text-white font-bold"
                      : "bg-red-600 text-white font-bold"
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
                <div className="p-2 rounded bg-white border border-gray-200">
                  <span className="text-gray-500 text-[10px] block">SOURCE:</span>
                  <span className="text-gray-900 font-semibold">{activeScenario.sourceIp}</span>
                </div>
                <div className="p-2 rounded bg-white border border-gray-200">
                  <span className="text-gray-500 text-[10px] block">DESTINATION:</span>
                  <span className="text-gray-900 font-semibold">{activeScenario.destIp}</span>
                </div>
                <div className="p-2 rounded bg-white border border-gray-200">
                  <span className="text-gray-500 text-[10px] block">PROTOCOL:</span>
                  <span className="text-red-700 font-semibold">{activeScenario.protocol} (Port {activeScenario.port})</span>
                </div>
                <div className="p-2 rounded bg-white border border-gray-200">
                  <span className="text-gray-500 text-[10px] block">CONNTRACK:</span>
                  <span className="text-emerald-700 font-semibold">{activeScenario.conntrackState}</span>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-gray-500 text-[10px] block">EVALUATED RULE:</span>
                <code className="text-gray-900 bg-white px-2.5 py-1.5 rounded block text-[11px] border border-gray-200 font-mono">
                  {activeScenario.matchingRule}
                </code>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed font-sans pt-1">
                {activeScenario.narrative}
              </p>
            </div>
          </Card>
        </div>

        {/* Node Detail Drawer / Inspection Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-5 border-gray-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
              <Info className="h-4 w-4 text-red-600" />
              <h4 className="font-mono text-xs font-bold uppercase text-gray-900">
                NODE INSPECTION DRAWER
              </h4>
            </div>

            {selectedNode === "firewall" && (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-red-600 uppercase font-bold">NODE IDENTITY</span>
                  <div className="text-base font-bold text-gray-900 mt-0.5">sxl-fw01</div>
                  <div className="text-gray-500 text-[11px]">
                    nftables v1.0.6 (Linux 6.x Netfilter Core)
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-gray-100 pt-2.5 text-[11px]">
                  <span className="text-gray-500 text-[10px] uppercase font-bold">
                    ACTIVE INTERFACES:
                  </span>
                  <div className="p-2 rounded bg-gray-50 border border-gray-200 space-y-1">
                    <div className="text-amber-800">eth2: 10.231.10.254/24 (WAN)</div>
                    <div className="text-emerald-800">eth1: 10.231.20.254/24 (LAN)</div>
                    <div className="text-purple-800">eth0: 10.231.30.254/24 (DMZ)</div>
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-gray-100 pt-2.5 text-[11px]">
                  <span className="text-gray-500 text-[10px] uppercase font-bold">
                    KERNEL PARAMETERS:
                  </span>
                  <div className="p-2 rounded bg-gray-50 border border-gray-200 space-y-0.5 text-gray-800 font-mono">
                    <div>net.ipv4.ip_forward = 1</div>
                    <div>net.netfilter.nf_conntrack_max = 262144</div>
                    <div>net.ipv4.tcp_syncookies = 1</div>
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-gray-100 pt-2.5 text-[11px]">
                  <span className="text-gray-500 text-[10px] uppercase font-bold">
                    DEFAULT POLICY:
                  </span>
                  <div className="p-2 rounded bg-gray-50 border border-gray-200 space-y-0.5 text-red-700 font-mono">
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
                  <span className="text-[10px] text-amber-700 uppercase font-bold">NODE IDENTITY</span>
                  <div className="text-base font-bold text-gray-900 mt-0.5">sxl-wan01</div>
                  <div className="text-gray-500 text-[11px]">Untrusted External Network Host</div>
                </div>
                <div className="p-3 rounded bg-gray-50 border border-gray-200 space-y-1 text-[11px] text-gray-700">
                  <div>IP Address: 10.231.10.10/24</div>
                  <div>Default Gateway: 10.231.10.254 (sxl-fw01 eth2)</div>
                  <div>Role: Simulates external public web users & potential threat actors</div>
                </div>
              </div>
            )}

            {selectedNode === "lan" && (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-emerald-700 uppercase font-bold">NODE IDENTITY</span>
                  <div className="text-base font-bold text-gray-900 mt-0.5">sxl-lan01</div>
                  <div className="text-gray-500 text-[11px]">Internal Workstation & Admin Host</div>
                </div>
                <div className="p-3 rounded bg-gray-50 border border-gray-200 space-y-1 text-[11px] text-gray-700">
                  <div>IP Address: 10.231.20.10/24</div>
                  <div>Default Gateway: 10.231.20.254 (sxl-fw01 eth1)</div>
                  <div>Authorized Privileges: In-band SSH administrative access to sxl-fw01</div>
                </div>
              </div>
            )}

            {selectedNode === "dmz" && (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-purple-700 uppercase font-bold">NODE IDENTITY</span>
                  <div className="text-base font-bold text-gray-900 mt-0.5">sxl-dmz01</div>
                  <div className="text-gray-500 text-[11px]">Demilitarized Application Server</div>
                </div>
                <div className="p-3 rounded bg-gray-50 border border-gray-200 space-y-1 text-[11px] text-gray-700">
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
            <Card className="p-4 border-gray-200 bg-white shadow-sm space-y-2">
              <span className="font-mono text-[10px] font-bold uppercase text-gray-500">
                RECENT SIMULATION LOGS
              </span>
              <div className="space-y-1.5 text-xs font-mono">
                {simHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-1.5 rounded bg-gray-50 border border-gray-200 text-[11px]"
                  >
                    <span className="text-gray-600 truncate max-w-[170px]">{item.name}</span>
                    <span
                      className={
                        item.verdict === "ACCEPTED" ? "text-emerald-700 font-bold" : "text-red-700 font-bold"
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
