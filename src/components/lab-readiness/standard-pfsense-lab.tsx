import { useState, useId } from "react";
import {
  Shield,
  Network,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Send,
  Zap,
  Globe,
  Terminal,
  Activity,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  STANDARD_PFSENSE_TOPOLOGY,
  type StandardLabVerificationState,
  type LabMode,
} from "@/lib/lab-readiness-types";

interface StandardPfSenseLabProps {
  labMode: LabMode;
  verificationState: StandardLabVerificationState;
  onUpdateVerification: (state: Partial<StandardLabVerificationState>) => void;
  onSubmitEvidence: (evidence: string, notes: string) => void;
  onOpenTroubleshooting: () => void;
  onSwitchToSimulation?: () => void;
}

export function StandardPfSenseLab({
  labMode,
  verificationState,
  onUpdateVerification,
  onSubmitEvidence,
  onOpenTroubleshooting,
  onSwitchToSimulation,
}: StandardPfSenseLabProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [evidenceInput, setEvidenceInput] = useState(verificationState.kaliIpOutput ?? "");
  const [notesInput, setNotesInput] = useState(verificationState.completionEvidenceNotes ?? "");
  const [submitting, setSubmitting] = useState(false);
  const evidenceInputId = useId();
  const notesInputId = useId();

  const copyToClipboard = (text: string, id: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Command copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEvidenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceInput.trim()) {
      toast.error(
        "Please provide actual verification evidence (e.g. terminal output of 'ip a' or 'ping').",
      );
      return;
    }
    setSubmitting(true);
    onSubmitEvidence(evidenceInput.trim(), notesInput.trim());
    setSubmitting(false);
    toast.success("Lab verification evidence submitted successfully!");
  };

  const checklistItems = [
    {
      key: "kaliIpVerified" as const,
      label: "Kali Linux DHCP Lease Verified (192.168.50.100–200)",
      description: "Kali received a dynamic IPv4 lease from pfSense on SXL-LAN.",
      command: "ip a show eth0",
    },
    {
      key: "pfsensePingVerified" as const,
      label: "Gateway Reachability (Ping 192.168.50.1)",
      description: "Kali can reach pfSense internal LAN gateway over Layer 3 ICMP.",
      command: "ping -c 3 192.168.50.1",
    },
    {
      key: "ubuntuPingVerified" as const,
      label: "Lateral Reachability (Ping Ubuntu Server 192.168.50.20)",
      description: "East-west packet forwarding between internal workstations on SXL-LAN.",
      command: "ping -c 3 192.168.50.20",
    },
    {
      key: "internetPingVerified" as const,
      label: "Outbound Internet NAT (Ping 8.8.8.8)",
      description: "pfSense translates internal RFC 1918 addresses out to upstream WAN NAT.",
      command: "ping -c 3 8.8.8.8",
    },
    {
      key: "dnsLookupVerified" as const,
      label: "DNS Resolution (Unbound Resolver)",
      description: "Domain lookups resolve through pfSense Unbound DNS service on port 53.",
      command: "nslookup shadowxlab.com",
    },
    {
      key: "pfsenseWebGuiVerified" as const,
      label: "pfSense webConfigurator Access (https://192.168.50.1)",
      description: "Logged into web management portal as admin with password pfsense.",
      command: "curl -k -I https://192.168.50.1",
    },
  ];

  const totalChecks = checklistItems.length;
  const passedChecks = checklistItems.filter((i) => verificationState[i.key]).length;
  const progressPercent = Math.round((passedChecks / totalChecks) * 100);

  return (
    <div className="space-y-6">
      {/* Zero-Troubleshooting Student Fallback Strip */}
      {onSwitchToSimulation && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-xs shadow-sm">
          <div className="flex items-center gap-2 text-amber-300">
            <Zap size={15} className="shrink-0" />
            <span>
              <strong>Zero-Downtime Guarantee:</strong> Facing hypervisor or VM setup issues? Switch
              immediately to In-Browser Simulation to avoid losing scheduled lab time.
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[11px] shrink-0 border-amber-500/40 text-amber-300 hover:bg-amber-500/20 gap-1.5"
            onClick={onSwitchToSimulation}
          >
            <Zap size={12} />
            Instant Simulation Fallback
          </Button>
        </div>
      )}

      {/* Top Banner */}
      <div className="rounded-lg border border-border bg-gradient-to-r from-card via-surface to-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyber">
              <Shield size={15} />
              Standard Corporate Training Architecture
            </div>
            <h2 className="mt-1 text-xl font-bold text-foreground">
              Standardized pfSense + SXL-LAN Practical Lab
            </h2>
            <p className="mt-1 text-xs text-muted-foreground max-w-2xl">
              Deterministic, repeatable multi-VM network deployment designed for corporate training.
              Eliminates IP conflicts by standardizing on <strong>192.168.50.0/24</strong> and
              internal switch <strong>SXL-LAN</strong>.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenTroubleshooting}
              className="gap-2 text-xs border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
            >
              <Zap size={14} />
              Open Troubleshooting Wizard
            </Button>
          </div>
        </div>

        {/* Visual Topology Map Card */}
        <div className="mt-4 rounded-lg border border-border/80 bg-background/80 p-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <span className="text-xs font-semibold text-cyber uppercase tracking-wider flex items-center gap-1.5">
              <Network size={14} />
              Standard Corporate Topology Diagram
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              Mode: {labMode.toUpperCase()}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4 items-center">
            {/* WAN Node */}
            <div className="p-3 rounded border border-sky-500/30 bg-sky-500/5 text-center space-y-1">
              <div className="flex justify-center text-sky-400">
                <Globe size={22} />
              </div>
              <strong className="text-xs block text-foreground">WAN (Internet)</strong>
              <div className="text-[10px] font-mono text-muted-foreground">VirtualBox NAT</div>
              <div className="text-[10px] font-mono text-sky-300">10.0.2.15/24 (DHCP)</div>
              <div className="text-[9px] text-muted-foreground">Adapter 1: NAT</div>
            </div>

            {/* Core Firewall Node */}
            <div className="p-3.5 rounded border border-cyber bg-cyber/10 text-center space-y-1.5 shadow-[0_0_20px_rgba(0,255,255,0.1)]">
              <div className="flex justify-center text-cyber">
                <Shield size={26} />
              </div>
              <strong className="text-xs block text-foreground">pfSense 2.7.x Firewall</strong>
              <div className="text-[10px] font-mono text-cyber">LAN IP: 192.168.50.1/24</div>
              <div className="text-[10px] font-mono text-muted-foreground">
                DHCP Scope: 192.168.50.100–200
              </div>
              <div className="text-[9px] text-muted-foreground font-mono">
                webConfigurator: https://192.168.50.1
              </div>
            </div>

            {/* Internal Virtual Switch */}
            <div className="p-3 rounded border border-purple-500/30 bg-purple-500/5 text-center space-y-1">
              <div className="flex justify-center text-purple-400">
                <Layers size={22} />
              </div>
              <strong className="text-xs block text-foreground">SXL-LAN Virtual Switch</strong>
              <div className="text-[10px] font-mono text-purple-300">Internal Network</div>
              <div className="text-[10px] font-mono text-muted-foreground">
                Subnet: 192.168.50.0/24
              </div>
              <div className="text-[9px] text-muted-foreground">Promiscuous: Allow All</div>
            </div>

            {/* Clients Stack */}
            <div className="space-y-2">
              <div className="p-2.5 rounded border border-emerald-500/30 bg-emerald-500/5 text-xs space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Kali Linux Workstation</span>
                  <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-400 px-1 rounded">
                    DHCP
                  </span>
                </div>
                <div className="text-[10px] font-mono text-emerald-300">192.168.50.10x /24</div>
                <div className="text-[9px] text-muted-foreground">Adapter 1: Internal SXL-LAN</div>
              </div>

              <div className="p-2.5 rounded border border-amber-500/30 bg-amber-500/5 text-xs space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Ubuntu Server Target</span>
                  <span className="text-[9px] font-mono bg-amber-500/20 text-amber-400 px-1 rounded">
                    Static
                  </span>
                </div>
                <div className="text-[10px] font-mono text-amber-300">192.168.50.20 /24</div>
                <div className="text-[9px] text-muted-foreground">Adapter 1: Internal SXL-LAN</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Step-by-Step Instructions + Verification Panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Step-by-Step Guides (7 cols) */}
        <div className="space-y-4 lg:col-span-7">
          <Card className="p-4 border-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-cyber uppercase">
                <Terminal size={15} />
                Step-by-Step Execution Walkthrough
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">Phases 1–6</span>
            </div>

            {/* Phase 1: VirtualBox VM Network Setup */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyber/20 text-[10px] font-mono text-cyber">
                  1
                </span>
                VirtualBox Network Adapters Configuration
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Configure VirtualBox VM network interfaces before initial power-on. Ensure the
                internal switch name matches <strong>SXL-LAN</strong> exactly.
              </p>

              <div className="rounded bg-background border border-border p-3 font-mono text-[11px] space-y-2">
                <div className="flex items-center justify-between text-muted-foreground text-[10px]">
                  <span>VBoxManage CLI Configuration (Run in Host Terminal)</span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `# Configure pfSense (Adapter 1 NAT, Adapter 2 SXL-LAN)\nVBoxManage modifyvm "pfSense" --nic1 nat --cableconnected1 on\nVBoxManage modifyvm "pfSense" --nic2 intnet --intnet2 "SXL-LAN" --nicpromisc2 allow-all --cableconnected2 on\n\n# Configure Kali Linux (Adapter 1 SXL-LAN)\nVBoxManage modifyvm "Kali" --nic1 intnet --intnet1 "SXL-LAN" --nicpromisc1 allow-all --cableconnected1 on`,
                        "cmd-vbox-setup",
                      )
                    }
                    className="flex items-center gap-1 text-cyber hover:underline"
                  >
                    {copiedId === "cmd-vbox-setup" ? <Check size={12} /> : <Copy size={12} />}
                    Copy All
                  </button>
                </div>
                <pre className="text-cyber/90 overflow-x-auto whitespace-pre-wrap">
                  {`# 1. Attach pfSense Adapter 1 to NAT (WAN)
VBoxManage modifyvm "pfSense" --nic1 nat --cableconnected1 on

# 2. Attach pfSense Adapter 2 to Internal SXL-LAN (LAN)
VBoxManage modifyvm "pfSense" --nic2 intnet --intnet2 "SXL-LAN" --nicpromisc2 allow-all --cableconnected2 on

# 3. Attach Kali Workstation to Internal SXL-LAN
VBoxManage modifyvm "Kali" --nic1 intnet --intnet1 "SXL-LAN" --nicpromisc1 allow-all --cableconnected1 on`}
                </pre>
              </div>
            </div>

            {/* Phase 2: Interface Assignment in pfSense Console */}
            <div className="space-y-2 text-xs pt-3 border-t border-border/70">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyber/20 text-[10px] font-mono text-cyber">
                  2
                </span>
                pfSense Console Interface Assignment (Option 1)
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                On first boot of pfSense, map the virtual NICs to WAN and LAN. Prevent interface
                inversion:
              </p>
              <div className="rounded bg-background border border-border p-3 font-mono text-[11px] space-y-1 text-muted-foreground">
                <div>
                  1. Should VLANs be set up now [y|n]? <strong className="text-cyber">n</strong>
                </div>
                <div>
                  2. Enter the WAN interface name: <strong className="text-cyber">vtnet0</strong>{" "}
                  (or em0)
                </div>
                <div>
                  3. Enter the LAN interface name: <strong className="text-cyber">vtnet1</strong>{" "}
                  (or em1)
                </div>
                <div>
                  4. Do you want to proceed [y|n]? <strong className="text-cyber">y</strong>
                </div>
              </div>
            </div>

            {/* Phase 3: Setting pfSense LAN IP & DHCP Scope */}
            <div className="space-y-2 text-xs pt-3 border-t border-border/70">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyber/20 text-[10px] font-mono text-cyber">
                  3
                </span>
                Configure LAN IP & DHCP Scope (Option 2)
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                From the pfSense console menu, press <strong>2</strong> to set interface IP:
              </p>
              <div className="rounded bg-background border border-border p-3 font-mono text-[11px] space-y-1 text-muted-foreground">
                <div>
                  Enter the number of the interface: <strong className="text-cyber">2</strong> (LAN)
                </div>
                <div>
                  Enter the new LAN IPv4 address:{" "}
                  <strong className="text-cyber">192.168.50.1</strong>
                </div>
                <div>
                  Enter the new LAN IPv4 subnet bit count:{" "}
                  <strong className="text-cyber">24</strong>
                </div>
                <div>
                  For a WAN, enter upstream gateway:{" "}
                  <strong className="text-cyber">[Press Enter for none]</strong>
                </div>
                <div>
                  Do you want to enable the DHCP server on LAN [y|n]?{" "}
                  <strong className="text-cyber">y</strong>
                </div>
                <div>
                  Enter the start address: <strong className="text-cyber">192.168.50.100</strong>
                </div>
                <div>
                  Enter the end address: <strong className="text-cyber">192.168.50.200</strong>
                </div>
              </div>
            </div>

            {/* Phase 4: Kali Linux Client Verification */}
            <div className="space-y-2 text-xs pt-3 border-t border-border/70">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyber/20 text-[10px] font-mono text-cyber">
                  4
                </span>
                Kali Linux Client Verification Commands
              </div>
              <p className="text-muted-foreground text-[11px]">
                Run these commands in Kali terminal to verify IP lease, gateway routing, and
                internet access:
              </p>

              <div className="space-y-2">
                {[
                  {
                    id: "cmd-ip",
                    label: "Check Kali IP Lease",
                    cmd: "ip a show eth0",
                    note: "Expect inet 192.168.50.10x/24",
                  },
                  {
                    id: "cmd-ping-gw",
                    label: "Ping pfSense Gateway",
                    cmd: "ping -c 3 192.168.50.1",
                    note: "0% packet loss required",
                  },
                  {
                    id: "cmd-ping-inet",
                    label: "Ping Upstream Internet NAT",
                    cmd: "ping -c 3 8.8.8.8",
                    note: "Confirms pfSense outbound NAT translation",
                  },
                  {
                    id: "cmd-dns",
                    label: "Verify DNS Query Resolution",
                    cmd: "nslookup shadowxlab.com",
                    note: "Tests pfSense Unbound resolver on port 53",
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="rounded bg-background border border-border p-2.5 font-mono text-[11px]"
                  >
                    <div className="flex items-center justify-between text-muted-foreground text-[10px]">
                      <span>
                        {item.label} · <span className="text-cyber">{item.note}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(item.cmd, item.id)}
                        className="flex items-center gap-1 text-cyber hover:underline"
                      >
                        {copiedId === item.id ? <Check size={12} /> : <Copy size={12} />}
                        Copy
                      </button>
                    </div>
                    <code className="text-foreground block mt-1">{item.cmd}</code>
                  </div>
                ))}
              </div>
            </div>

            {/* Phase 5: webConfigurator Access */}
            <div className="space-y-2 text-xs pt-3 border-t border-border/70">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyber/20 text-[10px] font-mono text-cyber">
                  5
                </span>
                Accessing pfSense webConfigurator
              </div>
              <p className="text-muted-foreground text-[11px]">
                Open Firefox inside your Kali Linux VM and browse to:
              </p>
              <div className="p-3 rounded bg-surface border border-border font-mono text-xs flex items-center justify-between">
                <div>
                  <div className="text-cyber font-bold">https://192.168.50.1</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Username: <strong className="text-foreground">admin</strong> · Password:{" "}
                    <strong className="text-foreground">pfsense</strong>
                  </div>
                </div>
                <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                  Accept Self-Signed Certificate
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Verification Checklist & Evidence Submission (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          {/* Progress Tracker Card */}
          <Card className="p-4 border-border space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-cyber uppercase">
                <CheckCircle2 size={15} />
                Verification Checklist ({passedChecks}/{totalChecks})
              </div>
              <span className="text-xs font-mono font-bold text-cyber">{progressPercent}%</span>
            </div>

            <div className="w-full bg-surface-2/40 h-2 rounded-full overflow-hidden">
              <div
                className="bg-cyber h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="space-y-2 mt-2">
              {checklistItems.map((item) => (
                <label
                  key={item.key}
                  className={`flex items-start gap-2.5 p-2.5 rounded border text-xs cursor-pointer transition-colors ${
                    verificationState[item.key]
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-border bg-card/50 hover:bg-surface"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(verificationState[item.key])}
                    onChange={(e) => onUpdateVerification({ [item.key]: e.target.checked })}
                    className="accent-cyber mt-0.5 flex-none"
                  />
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground text-[11px] block">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      {item.description}
                    </span>
                    <code className="text-[9px] font-mono text-cyber block pt-0.5">
                      Verify: {item.command}
                    </code>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          {/* Practical Evidence Submission Card */}
          <Card className="p-4 border-border space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-cyber uppercase pb-3 border-b border-border">
              <Activity size={15} />
              Practical Lab Evidence Submission
            </div>
            <p className="text-[11px] text-muted-foreground">
              To complete this lab, paste your actual terminal output showing your assigned Kali IP
              (from <code className="text-cyber">ip a show eth0</code>) or ping test output. Labs
              are never marked as completed without student verification evidence.
            </p>

            <form onSubmit={handleEvidenceSubmit} className="space-y-3 text-xs">
              <div>
                <label htmlFor={evidenceInputId} className="text-muted-foreground block mb-1">
                  Terminal Output / Verification Log
                </label>
                <textarea
                  id={evidenceInputId}
                  rows={4}
                  required
                  placeholder="Paste output of 'ip a show eth0' or 'ping -c 3 192.168.50.1' here..."
                  value={evidenceInput}
                  onChange={(e) => setEvidenceInput(e.target.value)}
                  className="w-full p-2.5 rounded border border-border bg-background text-foreground text-xs font-mono"
                />
              </div>

              <div>
                <label htmlFor={notesInputId} className="text-muted-foreground block mb-1">
                  Learner Notes / Observed Behavior (Optional)
                </label>
                <input
                  id={notesInputId}
                  type="text"
                  placeholder="e.g. pfSense DHCP assigned 192.168.50.101 to eth0. WebGUI accessible."
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full h-8 px-2.5 rounded border border-border bg-background text-foreground text-xs"
                />
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  Status: {verificationState.completedAt ? "Evidence Saved" : "Pending Submission"}
                </span>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting || !evidenceInput.trim()}
                  className="gap-1.5 text-xs bg-cyber text-primary-foreground hover:bg-cyber/90"
                >
                  <Send size={13} />
                  {submitting ? "Saving..." : "Submit Verification Evidence"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
