import { useState } from "react";
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Clock,
  Shield,
  Layers,
  Send,
  Sparkles,
  Terminal,
  Activity,
  Copy,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  type AssistanceRequest,
  type StudentLabReadinessRecord,
  type LabMode,
} from "@/lib/lab-readiness-types";
import { DEMO_STUDENTS } from "@/lib/auth-service";

interface InstructorLabReadinessPanelProps {
  assistanceRequests: AssistanceRequest[];
  onUpdateTicketStatus: (
    ticketId: string,
    status: AssistanceRequest["status"],
    note?: string,
  ) => void;
  studentRecords?: StudentLabReadinessRecord[];
  onSwitchAllBlockedToSimulation?: () => void;
}

export function InstructorLabReadinessPanel({
  assistanceRequests,
  onUpdateTicketStatus,
  studentRecords,
  onSwitchAllBlockedToSimulation,
}: InstructorLabReadinessPanelProps) {
  const [selectedStudentEmail, setSelectedStudentEmail] = useState<string | null>(null);
  const [instructorReplyNotes, setInstructorReplyNotes] = useState<Record<string, string>>({});
  const [filterMode, setFilterMode] = useState<"all" | "blocked" | "ready">("all");

  // Create default student records for all 10 demo profiles if not provided
  const records: StudentLabReadinessRecord[] =
    studentRecords && studentRecords.length > 0
      ? studentRecords
      : DEMO_STUDENTS.map((stu, idx) => {
          // Pre-populate with realistic corporate training distribution
          const modes: LabMode[] = [
            "local-full",
            "local-full",
            "local-light",
            "local-light",
            "shared-range",
            "simulation",
            "local-full",
            "local-light",
            "shared-range",
            "local-full",
          ];
          const statuses: StudentLabReadinessRecord["overallStatus"][] = [
            "READY",
            "IN_PROGRESS",
            "BLOCKED",
            "READY",
            "IN_PROGRESS",
            "COMPLETED",
            "READY",
            "BLOCKED",
            "READY",
            "READY",
          ];
          const blockers = [
            undefined,
            undefined,
            "Kali not receiving 192.168.50.x lease (SXL-LAN adapter check)",
            undefined,
            undefined,
            undefined,
            undefined,
            "VT-x disabled in host BIOS (8 GB RAM laptop)",
            undefined,
            undefined,
          ];

          return {
            studentId: stu.id,
            studentName: stu.name,
            studentEmail: stu.email,
            seat: stu.seat,
            selectedMode: modes[idx] ?? "local-full",
            overallStatus: statuses[idx] ?? "READY",
            currentBlocker: blockers[idx],
            hardware: {
              totalRamGb: idx % 3 === 0 ? 16 : idx % 3 === 1 ? 8 : 4,
              availableRamGb: idx % 3 === 0 ? 10 : idx % 3 === 1 ? 4 : 2,
              cpuCores: idx % 2 === 0 ? 8 : 4,
              virtualizationEnabled: idx !== 7,
              freeDiskGb: idx % 2 === 0 ? 120 : 35,
              hostOs: idx % 4 === 0 ? "windows" : idx % 4 === 1 ? "macos" : "linux",
            },
            verification: {
              kaliIpVerified: idx !== 2 && idx !== 7,
              pfsensePingVerified: idx === 0 || idx === 5 || idx === 9,
              ubuntuPingVerified: idx === 0 || idx === 5,
              internetPingVerified: idx === 0 || idx === 5 || idx === 9,
              dnsLookupVerified: idx === 0 || idx === 5,
              pfsenseWebGuiVerified: idx === 0 || idx === 5,
              kaliIpOutput:
                idx === 0
                  ? "inet 192.168.50.101/24 brd 192.168.50.255 scope global eth0"
                  : idx === 5
                    ? "In-browser simulation engine verified: 192.168.50.105"
                    : undefined,
              completedAt: idx === 5 ? "2026-11-16T09:45:00.000Z" : undefined,
              verifiedByInstructor: idx === 5,
            },
            lastUpdated: new Date().toLocaleTimeString(),
          };
        });

  const filteredRecords = records.filter((r) => {
    if (filterMode === "blocked") return r.overallStatus === "BLOCKED";
    if (filterMode === "ready")
      return r.overallStatus === "READY" || r.overallStatus === "COMPLETED";
    return true;
  });

  const readyCount = records.filter(
    (r) => r.overallStatus === "READY" || r.overallStatus === "COMPLETED",
  ).length;
  const blockedCount = records.filter((r) => r.overallStatus === "BLOCKED").length;
  const inProgressCount = records.filter((r) => r.overallStatus === "IN_PROGRESS").length;
  const openTickets = assistanceRequests.filter((t) => t.status !== "resolved");

  const handleResolveTicket = (ticketId: string) => {
    const note =
      instructorReplyNotes[ticketId] ?? "Diagnostic guide dispatched. Verified operational.";
    onUpdateTicketStatus(ticketId, "resolved", note);
    toast.success("Assistance ticket marked as resolved!");
  };

  const handleAcknowledgeTicket = (ticketId: string) => {
    onUpdateTicketStatus(ticketId, "acknowledged");
    toast.info("Assistance ticket acknowledged.");
  };

  return (
    <div className="space-y-6">
      {/* Zero-Troubleshooting Policy & Pre-Class Infrastructure Health Strip */}
      <Card className="border-cyber/40 bg-gradient-to-r from-surface to-cyber/5 p-4 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2.5">
            <Shield size={18} className="text-cyber shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Pre-Class Infrastructure Validation & Health Matrix
                </span>
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-mono font-semibold text-emerald-400">
                  ALL SYSTEMS GREEN
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Mandatory constraint: Students must not lose instructional time on local
                VM/hypervisor setup. Instant fallback active.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onSwitchAllBlockedToSimulation && blockedCount > 0 && (
              <Button
                size="sm"
                variant="destructive"
                className="h-7 text-[11px] gap-1.5"
                onClick={onSwitchAllBlockedToSimulation}
              >
                <Zap size={13} />
                Switch {blockedCount} Blocked to Simulation
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-[11px] gap-1.5 border-border"
              onClick={() => {
                void navigator.clipboard.writeText(
                  'VBoxManage snapshot "SXL-pfSense" restore "sxl-clean-baseline-v1"',
                );
                toast.success("Copied 10-second clean snapshot rollback command to clipboard!");
              }}
            >
              <Copy size={13} />
              Copy Snapshot Rollback
            </Button>
          </div>
        </div>

        {/* 6 Pre-Class Health Gates */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 text-[11px]">
          <div className="rounded border border-border/60 bg-background/50 p-2">
            <span className="text-[10px] text-muted-foreground block font-mono">
              1. FIREWALL CORE
            </span>
            <div className="flex items-center gap-1.5 mt-1 font-semibold text-emerald-400">
              <CheckCircle2 size={13} />
              <span>pfSense 2.7.x</span>
            </div>
            <small className="text-[9px] text-muted-foreground block">WAN NAT + LAN 50.1</small>
          </div>

          <div className="rounded border border-border/60 bg-background/50 p-2">
            <span className="text-[10px] text-muted-foreground block font-mono">
              2. NETWORK FABRICS
            </span>
            <div className="flex items-center gap-1.5 mt-1 font-semibold text-emerald-400">
              <CheckCircle2 size={13} />
              <span>SXL-LAN & DMZ</span>
            </div>
            <small className="text-[9px] text-muted-foreground block">Isolated L2 wire</small>
          </div>

          <div className="rounded border border-border/60 bg-background/50 p-2">
            <span className="text-[10px] text-muted-foreground block font-mono">
              3. CORE SERVICES
            </span>
            <div className="flex items-center gap-1.5 mt-1 font-semibold text-emerald-400">
              <CheckCircle2 size={13} />
              <span>DHCP & DNS</span>
            </div>
            <small className="text-[9px] text-muted-foreground block">.100-.200 / Unbound</small>
          </div>

          <div className="rounded border border-border/60 bg-background/50 p-2">
            <span className="text-[10px] text-muted-foreground block font-mono">
              4. CLEAN SNAPSHOTS
            </span>
            <div className="flex items-center gap-1.5 mt-1 font-semibold text-emerald-400">
              <CheckCircle2 size={13} />
              <span>sxl-baseline-v1</span>
            </div>
            <small className="text-[9px] text-muted-foreground block">10s instant restore</small>
          </div>

          <div className="rounded border border-border/60 bg-background/50 p-2">
            <span className="text-[10px] text-muted-foreground block font-mono">
              5. SHARED RANGE
            </span>
            <div className="flex items-center gap-1.5 mt-1 font-semibold text-emerald-400">
              <CheckCircle2 size={13} />
              <span>Mode B Ready</span>
            </div>
            <small className="text-[9px] text-muted-foreground block">10 pods on standby</small>
          </div>

          <div className="rounded border border-border/60 bg-background/50 p-2">
            <span className="text-[10px] text-muted-foreground block font-mono">
              6. SIMULATION FALLBACK
            </span>
            <div className="flex items-center gap-1.5 mt-1 font-semibold text-emerald-400">
              <CheckCircle2 size={13} />
              <span>Mode C Active</span>
            </div>
            <small className="text-[9px] text-muted-foreground block">Zero host dependencies</small>
          </div>
        </div>
      </Card>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3.5 border-border bg-surface/50">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>LAB READY STUDENTS</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {readyCount}{" "}
            <span className="text-xs font-normal text-muted-foreground">/ {records.length}</span>
          </div>
          <small className="text-[10px] text-muted-foreground block mt-0.5">
            Configured on SXL-LAN / Ready to start
          </small>
        </Card>

        <Card className="p-3.5 border-border bg-surface/50">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>BLOCKED / ROADBLOCK</span>
            <AlertTriangle size={16} className="text-destructive" />
          </div>
          <div className="mt-2 text-2xl font-bold text-destructive">{blockedCount}</div>
          <small className="text-[10px] text-muted-foreground block mt-0.5">
            Requires DHCP or VirtualBox fix
          </small>
        </Card>

        <Card className="p-3.5 border-border bg-surface/50">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>ACTIVE ASSISTANCE TICKETS</span>
            <HelpCircle size={16} className="text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400">{openTickets.length}</div>
          <small className="text-[10px] text-muted-foreground block mt-0.5">
            Awaiting instructor feedback
          </small>
        </Card>

        <Card className="p-3.5 border-border bg-surface/50">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>IN PROGRESS</span>
            <Activity size={16} className="text-cyber" />
          </div>
          <div className="mt-2 text-2xl font-bold text-cyber">{inProgressCount}</div>
          <small className="text-[10px] text-muted-foreground block mt-0.5">
            Actively verifying pfSense tasks
          </small>
        </Card>
      </div>

      {/* Main Grid: Student Readiness Roster (7 cols) + Assistance Queue (5 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Student Roster Table (7 cols) */}
        <div className="space-y-4 lg:col-span-7">
          <Card className="p-4 border-border space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-cyber uppercase">
                <Users size={15} />
                Student Lab Readiness Roster ({filteredRecords.length})
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                {(["all", "blocked", "ready"] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setFilterMode(filter)}
                    className={`text-[10px] px-2 py-0.5 rounded border capitalize transition-colors ${
                      filterMode === filter
                        ? "border-cyber bg-cyber/15 text-cyber font-semibold"
                        : "border-border text-muted-foreground hover:bg-surface"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredRecords.map((record) => {
                const isSelected = selectedStudentEmail === record.studentEmail;
                return (
                  <div
                    key={record.studentId}
                    onClick={() => setSelectedStudentEmail(record.studentEmail)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? "border-cyber bg-cyber/10"
                        : record.overallStatus === "BLOCKED"
                          ? "border-destructive/40 bg-destructive/5 hover:bg-destructive/10"
                          : "border-border bg-card/60 hover:bg-surface"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <strong className="text-foreground text-xs">{record.studentName}</strong>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            ({record.seat})
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-surface border border-border text-muted-foreground uppercase">
                            {record.selectedMode.replace("local-", "")}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {record.studentEmail} · {record.hardware.totalRamGb} GB RAM (
                          {record.hardware.availableRamGb} GB free) · VT-x:{" "}
                          {record.hardware.virtualizationEnabled ? "OK" : "NO"}
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                          record.overallStatus === "COMPLETED"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : record.overallStatus === "READY"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : record.overallStatus === "BLOCKED"
                                ? "bg-destructive/20 text-destructive"
                                : "bg-cyber/15 text-cyber"
                        }`}
                      >
                        {record.overallStatus}
                      </span>
                    </div>

                    {record.currentBlocker && (
                      <div className="mt-2 p-1.5 rounded bg-destructive/10 border border-destructive/20 text-[10px] text-destructive font-mono flex items-center gap-1.5">
                        <AlertTriangle size={12} className="flex-none" />
                        <span>Blocker: {record.currentBlocker}</span>
                      </div>
                    )}

                    {record.verification.kaliIpOutput && (
                      <div className="mt-1.5 text-[9px] font-mono text-muted-foreground">
                        Evidence:{" "}
                        <code className="text-cyber">{record.verification.kaliIpOutput}</code>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Live Assistance Queue (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          <Card className="p-4 border-border space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-400 uppercase">
                <HelpCircle size={15} />
                Live Student Assistance Requests
              </div>
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                {openTickets.length} Open
              </span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {assistanceRequests.length === 0 ? (
                <div className="p-6 text-center rounded border border-dashed border-border text-muted-foreground text-xs">
                  No assistance tickets in the queue. All student workstations are operating
                  normally.
                </div>
              ) : (
                assistanceRequests.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                      ticket.status === "resolved"
                        ? "border-border bg-surface/30 opacity-60"
                        : ticket.status === "acknowledged"
                          ? "border-sky-500/40 bg-sky-500/5"
                          : "border-amber-500/40 bg-amber-500/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-foreground text-xs">
                          {ticket.studentName} ·{" "}
                          <span className="font-mono text-muted-foreground">({ticket.seat})</span>
                        </div>
                        <div className="text-[10px] text-amber-300 font-mono mt-0.5 font-bold uppercase">
                          {ticket.blockerCategory.replace("_", " ")}
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
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

                    <p className="text-foreground text-[11px] bg-background/80 p-2 rounded border border-border/60">
                      "{ticket.description}"
                    </p>

                    <div className="text-[9px] text-muted-foreground font-mono">
                      Specs: {ticket.systemSpecs}
                    </div>

                    {/* Instructor Action Controls */}
                    {ticket.status !== "resolved" && (
                      <div className="pt-2 border-t border-border/70 space-y-2">
                        <Input
                          placeholder="Instructor resolution note..."
                          value={instructorReplyNotes[ticket.id] ?? ""}
                          onChange={(e) =>
                            setInstructorReplyNotes({
                              ...instructorReplyNotes,
                              [ticket.id]: e.target.value,
                            })
                          }
                          className="h-7 text-xs font-mono"
                        />
                        <div className="flex items-center justify-end gap-2">
                          {ticket.status === "open" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAcknowledgeTicket(ticket.id)}
                              className="h-6 text-[10px] border-sky-500/40 text-sky-400 hover:bg-sky-500/10"
                            >
                              Acknowledge
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleResolveTicket(ticket.id)}
                            className="h-6 text-[10px] bg-emerald-600 text-white hover:bg-emerald-500 gap-1"
                          >
                            <CheckCircle2 size={11} /> Mark Resolved
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
