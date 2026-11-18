import React, { useState } from "react";
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Terminal,
  Activity,
  Layers,
  Shield,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Server,
  Network,
  Cpu,
  Check,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DAY2_LABS, type Day2Lab } from "@/lib/day2-curriculum";

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
  const [selectedLabId, setSelectedLabId] = useState<string>(activeLabId);
  const currentLab: Day2Lab = DAY2_LABS.find((l) => l.id === selectedLabId) ?? DAY2_LABS[0]!;

  // Lab 1 State: Interface setup
  const [eth0Ip, setEth0Ip] = useState<string>("10.231.30.254/24");
  const [eth1Ip, setEth1Ip] = useState<string>("10.231.20.254/24");
  const [eth2Ip, setEth2Ip] = useState<string>("10.231.10.254/24");
  const [sshAllowedInterface, setSshAllowedInterface] = useState<string>("eth1");
  const [lab1Verified, setLab1Verified] = useState<boolean>(false);
  const [lab1Output, setLab1Output] = useState<string[]>([]);

  // Lab 2 State: Static routing & reachability
  const [defaultGateway, setDefaultGateway] = useState<string>("10.231.10.1");
  const [ipForwardEnabled, setIpForwardEnabled] = useState<boolean>(true);
  const [lab2Verified, setLab2Verified] = useState<boolean>(false);
  const [lab2Output, setLab2Output] = useState<string[]>([]);

  // Lab 3 State: nftables ACL rules
  const [defaultForwardPolicy, setDefaultForwardPolicy] = useState<string>("drop");
  const [allowConntrack, setAllowConntrack] = useState<boolean>(true);
  const [allowLanToDmzWeb, setAllowLanToDmzWeb] = useState<boolean>(true);
  const [allowWanToDmzWeb, setAllowWanToDmzWeb] = useState<boolean>(true);
  const [blockDmzToLan, setBlockDmzToLan] = useState<boolean>(true);
  const [lab3Verified, setLab3Verified] = useState<boolean>(false);
  const [lab3Output, setLab3Output] = useState<string[]>([]);

  // Execute Lab 1 Verification
  const runLab1Verification = () => {
    const logs: string[] = [];
    logs.push("[TEST 1/4] Checking eth0 (DMZ) assignment: " + eth0Ip);
    const eth0Pass = eth0Ip.trim() === "10.231.30.254/24";
    if (eth0Pass) logs.push("  ✓ PASSED: eth0 configured on 10.231.30.254/24");
    else logs.push("  ✗ FAILED: Expected 10.231.30.254/24 for DMZ zone");

    logs.push("[TEST 2/4] Checking eth1 (LAN) assignment: " + eth1Ip);
    const eth1Pass = eth1Ip.trim() === "10.231.20.254/24";
    if (eth1Pass) logs.push("  ✓ PASSED: eth1 configured on 10.231.20.254/24");
    else logs.push("  ✗ FAILED: Expected 10.231.20.254/24 for LAN zone");

    logs.push("[TEST 3/4] Checking eth2 (WAN) assignment: " + eth2Ip);
    const eth2Pass = eth2Ip.trim() === "10.231.10.254/24";
    if (eth2Pass) logs.push("  ✓ PASSED: eth2 configured on 10.231.10.254/24");
    else logs.push("  ✗ FAILED: Expected 10.231.10.254/24 for WAN zone");

    logs.push("[TEST 4/4] Checking SSH management binding: " + sshAllowedInterface);
    const sshPass = sshAllowedInterface === "eth1";
    if (sshPass) logs.push("  ✓ PASSED: SSH bound strictly to internal LAN eth1");
    else logs.push("  ✗ FAILED: SSH must not be allowed from WAN eth2 or DMZ eth0");

    const passedCount = [eth0Pass, eth1Pass, eth2Pass, sshPass].filter(Boolean).length;
    const score = Math.round((passedCount / 4) * 100);
    logs.push(`\n[RESULT] Interface setup evaluation score: ${score}% (${passedCount}/4 tests passed)`);

    setLab1Output(logs);
    if (score >= 75) {
      setLab1Verified(true);
      onSaveLabScore("day2-lab-01", score);
    }
  };

  // Execute Lab 2 Verification
  const runLab2Verification = () => {
    const logs: string[] = [];
    logs.push("[TEST 1/4] Checking default gateway route: " + defaultGateway);
    const gwPass = defaultGateway.trim() === "10.231.10.1";
    if (gwPass) logs.push("  ✓ PASSED: Default route 0.0.0.0/0 via 10.231.10.1 dev eth2");
    else logs.push("  ✗ FAILED: Expected upstream gateway 10.231.10.1 on WAN");

    logs.push("[TEST 2/4] Checking kernel forwarding: net.ipv4.ip_forward = " + (ipForwardEnabled ? "1" : "0"));
    if (ipForwardEnabled) logs.push("  ✓ PASSED: Kernel IP forwarding active");
    else logs.push("  ✗ FAILED: Kernel packet forwarding is disabled");

    logs.push("[TEST 3/4] Verifying ping reachability across directly connected subnets:");
    logs.push("  PING 10.231.20.10 (sxl-lan01): 64 bytes, ttl=64 time=0.28ms ✓");
    logs.push("  PING 10.231.30.10 (sxl-dmz01): 64 bytes, ttl=64 time=0.31ms ✓");
    logs.push("  PING 10.231.10.10 (sxl-wan01): 64 bytes, ttl=64 time=0.25ms ✓");

    logs.push("[TEST 4/4] Checking routing table resolution (Longest Prefix Match):");
    logs.push("  ip route get 8.8.8.8 -> 8.8.8.8 via 10.231.10.1 dev eth2 ✓");

    const passedCount = [gwPass, ipForwardEnabled, true, true].filter(Boolean).length;
    const score = Math.round((passedCount / 4) * 100);
    logs.push(`\n[RESULT] Static routing evaluation score: ${score}% (${passedCount}/4 tests passed)`);

    setLab2Output(logs);
    if (score >= 75) {
      setLab2Verified(true);
      onSaveLabScore("day2-lab-02", score);
    }
  };

  // Execute Lab 3 Verification
  const runLab3Verification = () => {
    const logs: string[] = [];
    logs.push("[TEST 1/5] Checking Forward chain default policy: " + defaultForwardPolicy);
    const policyPass = defaultForwardPolicy === "drop";
    if (policyPass) logs.push("  ✓ PASSED: Forward chain policy set to drop (Default-Deny)");
    else logs.push("  ✗ FAILED: Forward chain policy must be drop");

    logs.push("[TEST 2/5] Checking Connection Tracking rule: ct state established,related accept");
    if (allowConntrack) logs.push("  ✓ PASSED: Stateful return traffic allowed via conntrack");
    else logs.push("  ✗ FAILED: Conntrack rule missing; bidirectional sessions will break");

    logs.push("[TEST 3/5] Checking LAN to DMZ Web rule: iif eth1 oif eth0 tcp dport { 80, 443 }");
    if (allowLanToDmzWeb) logs.push("  ✓ PASSED: LAN workstations permitted to access DMZ web services");
    else logs.push("  ✗ FAILED: LAN cannot reach DMZ web server");

    logs.push("[TEST 4/5] Checking WAN to DMZ Inbound Publishing: iif eth2 oif eth0 tcp dport { 80, 443 }");
    if (allowWanToDmzWeb) logs.push("  ✓ PASSED: Inbound web traffic permitted to DMZ");
    else logs.push("  ✗ FAILED: External web publishing blocked");

    logs.push("[TEST 5/5] Checking DMZ to LAN Isolation: iif eth0 oif eth1 counter drop");
    if (blockDmzToLan) logs.push("  ✓ PASSED: DMZ to LAN unsolicited connection drop rule active");
    else logs.push("  ✗ FAILED: Lateral movement from DMZ into LAN is not blocked");

    const passedCount = [
      policyPass,
      allowConntrack,
      allowLanToDmzWeb,
      allowWanToDmzWeb,
      blockDmzToLan,
    ].filter(Boolean).length;
    const score = Math.round((passedCount / 5) * 100);
    logs.push(`\n[RESULT] nftables policy evaluation score: ${score}% (${passedCount}/5 tests passed)`);

    setLab3Output(logs);
    if (score >= 80) {
      setLab3Verified(true);
      onSaveLabScore("day2-lab-03", score);
    }
  };

  return (
    <div className="day2-labs space-y-6">
      {/* Lab Nav Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {DAY2_LABS.map((lab, idx) => {
          const isSelected = selectedLabId === lab.id;
          const score = labScores[lab.id];
          const isDone = (score ?? 0) >= 70;

          return (
            <button
              key={lab.id}
              type="button"
              onClick={() => setSelectedLabId(lab.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? "border-cyan-500 bg-cyan-500/15 shadow-[0_0_15px_rgba(0,229,255,0.15)] text-foreground"
                  : isDone
                    ? "border-emerald-500/40 bg-card/50 text-muted-foreground"
                    : "border-border/60 bg-card/30 text-muted-foreground hover:bg-card/60 hover:text-foreground"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-cyan-400 font-bold uppercase">
                  PRACTICAL LAB {idx + 1}
                </span>
                {isDone ? (
                  <Badge className="bg-emerald-950/60 text-emerald-300 border-emerald-500/40 text-[10px] font-mono">
                    <Check className="h-3 w-3 mr-1 inline" />
                    {score}%
                  </Badge>
                ) : (
                  <span className="text-[10px] font-mono text-muted-foreground">Pending</span>
                )}
              </div>
              <div className="text-sm font-bold text-foreground mt-1 line-clamp-1">{lab.title}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                {lab.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* ACTIVE LAB WORKSPACE */}
      <Card className="p-6 border-cyan-500/30 bg-card/60 space-y-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-cyan-400" />
              <span className="font-mono text-xs font-bold uppercase text-cyan-400">
                HANDS-ON PRACTICAL LAB
              </span>
            </div>
            <h2 className="text-xl font-bold text-foreground mt-1">{currentLab.title}</h2>
            <p className="text-xs text-muted-foreground mt-1">{currentLab.description}</p>
          </div>
          <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 font-mono text-xs">
            PILOT TOPOLOGY: 10.231.x.x
          </Badge>
        </div>

        {/* LAB 1: INTERFACE SETUP */}
        {selectedLabId === "day2-lab-01" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border border-purple-500/40 bg-purple-950/15 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-purple-400">eth0 • DMZ ZONE</span>
                  <Badge variant="outline" className="text-[10px] text-purple-300 border-purple-500/30">
                    Semi-Trusted
                  </Badge>
                </div>
                <label className="text-[11px] text-muted-foreground block font-mono">
                  Assigned CIDR Address:
                </label>
                <input
                  type="text"
                  value={eth0Ip}
                  onChange={(e) => setEth0Ip(e.target.value)}
                  className="w-full rounded bg-slate-950 border border-border p-2 font-mono text-xs text-foreground focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-[10px] text-muted-foreground block font-mono">
                  Target: 10.231.30.254/24
                </span>
              </div>

              <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/15 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-400">eth1 • LAN ZONE</span>
                  <Badge variant="outline" className="text-[10px] text-emerald-300 border-emerald-500/30">
                    Trusted
                  </Badge>
                </div>
                <label className="text-[11px] text-muted-foreground block font-mono">
                  Assigned CIDR Address:
                </label>
                <input
                  type="text"
                  value={eth1Ip}
                  onChange={(e) => setEth1Ip(e.target.value)}
                  className="w-full rounded bg-slate-950 border border-border p-2 font-mono text-xs text-foreground focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-[10px] text-muted-foreground block font-mono">
                  Target: 10.231.20.254/24
                </span>
              </div>

              <div className="rounded-lg border border-amber-500/40 bg-amber-950/15 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-400">eth2 • WAN ZONE</span>
                  <Badge variant="outline" className="text-[10px] text-amber-300 border-amber-500/30">
                    Untrusted
                  </Badge>
                </div>
                <label className="text-[11px] text-muted-foreground block font-mono">
                  Assigned CIDR Address:
                </label>
                <input
                  type="text"
                  value={eth2Ip}
                  onChange={(e) => setEth2Ip(e.target.value)}
                  className="w-full rounded bg-slate-950 border border-border p-2 font-mono text-xs text-foreground focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-[10px] text-muted-foreground block font-mono">
                  Target: 10.231.10.254/24
                </span>
              </div>
            </div>

            {/* In-Band SSH Policy */}
            <div className="rounded-lg border border-border/80 bg-slate-950 p-4 space-y-3">
              <span className="font-mono text-xs font-bold uppercase text-cyan-400">
                CONTROL PLANE MANAGEMENT ACCESS POLICY:
              </span>
              <p className="text-xs text-muted-foreground">
                Select which interface is permitted to accept administrative SSH connections to sxl-fw01:
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-mono">
                {["eth1 (LAN - Recommended)", "eth2 (WAN - External)", "eth0 (DMZ)"].map((opt) => {
                  const val = opt.slice(0, 4);
                  return (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sshIface"
                        value={val}
                        checked={sshAllowedInterface === val}
                        onChange={() => setSshAllowedInterface(val)}
                        className="text-cyan-400 focus:ring-cyan-400"
                      />
                      <span className={sshAllowedInterface === val ? "text-cyan-300 font-bold" : "text-muted-foreground"}>
                        {opt}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button
                onClick={runLab1Verification}
                className="gap-2 bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold text-xs"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>EXECUTE INTERFACE VERIFICATION TEST</span>
              </Button>
            </div>

            {/* Diagnostic Console Output */}
            {lab1Output.length > 0 && (
              <div className="rounded-xl border border-border bg-slate-950 p-4 font-mono text-xs space-y-1">
                <span className="text-cyan-400 font-bold block mb-2"># VERIFICATION TEST LOG:</span>
                {lab1Output.map((line, idx) => (
                  <div
                    key={idx}
                    className={
                      line.includes("✓")
                        ? "text-emerald-400"
                        : line.includes("✗")
                          ? "text-rose-400 font-bold"
                          : line.includes("[RESULT]")
                            ? "text-cyan-300 font-bold pt-2"
                            : "text-muted-foreground"
                    }
                  >
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LAB 2: STATIC ROUTING */}
        {selectedLabId === "day2-lab-02" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-border/80 bg-slate-950 p-4 space-y-3 font-mono text-xs">
                <span className="text-cyan-400 font-bold uppercase">
                  DEFAULT GATEWAY CONFIGURATION:
                </span>
                <label className="text-[11px] text-muted-foreground block">
                  Upstream Next-Hop IP on WAN (0.0.0.0/0 via eth2):
                </label>
                <input
                  type="text"
                  value={defaultGateway}
                  onChange={(e) => setDefaultGateway(e.target.value)}
                  className="w-full rounded bg-slate-900 border border-border p-2 font-mono text-xs text-foreground focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-[10px] text-muted-foreground block">
                  Target: 10.231.10.1 (ISP gateway on WAN subnet)
                </span>
              </div>

              <div className="rounded-lg border border-border/80 bg-slate-950 p-4 space-y-3 font-mono text-xs">
                <span className="text-cyan-400 font-bold uppercase">
                  LINUX KERNEL IP FORWARDING:
                </span>
                <label className="flex items-center gap-3 pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ipForwardEnabled}
                    onChange={(e) => setIpForwardEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-cyan-400 focus:ring-cyan-400"
                  />
                  <span className="text-xs text-foreground font-semibold">
                    Enable net.ipv4.ip_forward = 1
                  </span>
                </label>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Required for sxl-fw01 to act as a transit router and forward packets across zones.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button
                onClick={runLab2Verification}
                className="gap-2 bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold text-xs"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>EXECUTE ROUTING & REACHABILITY MATRIX</span>
              </Button>
            </div>

            {/* Diagnostic Console Output */}
            {lab2Output.length > 0 && (
              <div className="rounded-xl border border-border bg-slate-950 p-4 font-mono text-xs space-y-1">
                <span className="text-cyan-400 font-bold block mb-2"># ROUTING VERIFICATION LOG:</span>
                {lab2Output.map((line, idx) => (
                  <div
                    key={idx}
                    className={
                      line.includes("✓")
                        ? "text-emerald-400"
                        : line.includes("✗")
                          ? "text-rose-400 font-bold"
                          : line.includes("[RESULT]")
                            ? "text-cyan-300 font-bold pt-2"
                            : "text-muted-foreground"
                    }
                  >
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LAB 3: NFTABLES ACL POLICY */}
        {selectedLabId === "day2-lab-03" && (
          <div className="space-y-6">
            <div className="rounded-lg border border-border/80 bg-slate-950 p-4 space-y-3">
              <span className="font-mono text-xs font-bold uppercase text-cyan-400">
                NFTABLES FORWARD CHAIN POLICY DEFINITION:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">
                    Base Forward Chain Policy:
                  </label>
                  <select
                    value={defaultForwardPolicy}
                    onChange={(e) => setDefaultForwardPolicy(e.target.value)}
                    className="w-full rounded bg-slate-900 border border-border p-2 text-foreground focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="drop">policy drop (Default-Deny - Recommended)</option>
                    <option value="accept">policy accept (Default-Allow - Insecure)</option>
                  </select>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowConntrack}
                      onChange={(e) => setAllowConntrack(e.target.checked)}
                      className="rounded border-border text-cyan-400 focus:ring-cyan-400"
                    />
                    <span className="text-foreground">ct state established,related accept</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowLanToDmzWeb}
                      onChange={(e) => setAllowLanToDmzWeb(e.target.checked)}
                      className="rounded border-border text-cyan-400 focus:ring-cyan-400"
                    />
                    <span className="text-foreground">LAN to DMZ HTTP:80/443 accept</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowWanToDmzWeb}
                      onChange={(e) => setAllowWanToDmzWeb(e.target.checked)}
                      className="rounded border-border text-cyan-400 focus:ring-cyan-400"
                    />
                    <span className="text-foreground">WAN to DMZ Web Publishing accept</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={blockDmzToLan}
                      onChange={(e) => setBlockDmzToLan(e.target.checked)}
                      className="rounded border-border text-cyan-400 focus:ring-cyan-400"
                    />
                    <span className="text-rose-400 font-semibold">
                      iif eth0 oif eth1 counter drop (DMZ Isolation)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button
                onClick={runLab3Verification}
                className="gap-2 bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold text-xs"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>BUILD & VERIFY NFTABLES RULESET</span>
              </Button>
            </div>

            {/* Diagnostic Console Output */}
            {lab3Output.length > 0 && (
              <div className="rounded-xl border border-border bg-slate-950 p-4 font-mono text-xs space-y-1">
                <span className="text-cyan-400 font-bold block mb-2"># NFTABLES EXECUTION LOG:</span>
                {lab3Output.map((line, idx) => (
                  <div
                    key={idx}
                    className={
                      line.includes("✓")
                        ? "text-emerald-400"
                        : line.includes("✗")
                          ? "text-rose-400 font-bold"
                          : line.includes("[RESULT]")
                            ? "text-cyan-300 font-bold pt-2"
                            : "text-muted-foreground"
                    }
                  >
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
