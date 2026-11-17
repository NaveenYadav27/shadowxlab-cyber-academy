import React, { useState } from "react";
import {
  Users,
  Presentation,
  ShieldAlert,
  SlidersHorizontal,
  FolderTree,
  CheckSquare,
  Activity,
  UserCheck,
  FileSpreadsheet,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  Radio,
  Search,
  ExternalLink,
  ChevronRight,
  Terminal,
  Send,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { ProgrammeConfig, TrainingState } from "@/lib/training-platform";
import { DEMO_STUDENTS } from "@/lib/auth-service";
import { InstructorLabReadinessPanel } from "@/components/lab-readiness/instructor-lab-readiness-panel";
import PacketJourneySimulator from "@/components/day1/packet-journey-simulator";

interface InstructorWorkspaceProps {
  state: TrainingState;
  programme: ProgrammeConfig;
  activeNavId: string;
  onSelectNav: (navId: string) => void;
  onUpdateAttendance: (studentId: string, attended: boolean) => void;
}

export function InstructorWorkspace({
  state,
  programme,
  activeNavId,
  onSelectNav,
  onUpdateAttendance,
}: InstructorWorkspaceProps) {
  // Session Delivery active stage
  const [deliverySessionId, setDeliverySessionId] = useState<string>("d1-s1");
  const [deliveryStage, setDeliveryStage] = useState<number>(1);
  const [broadcastMessage, setBroadcastMessage] = useState<string>("");
  const [broadcastHistory, setBroadcastHistory] = useState<string[]>([
    "Welcome to Day 1: Please ensure your network simulator is set to Simulation Mode.",
  ]);

  const handleSendBroadcast = () => {
    if (!broadcastMessage.trim()) return;
    setBroadcastHistory((prev) => [broadcastMessage, ...prev]);
    setBroadcastMessage("");
  };

  const cohorts = [
    {
      id: "cohort-2026-alpha",
      name: "NPLRA Cyber Defense Cohort Nov-2026",
      studentsCount: DEMO_STUDENTS.length,
      currentDay: "Day 1 (Security & Firewall Foundations)",
      progressAvg: 45,
      activeStatus: "IN SESSION",
    },
    {
      id: "cohort-2026-beta",
      name: "Federal Infrastructure Security Dec-2026",
      studentsCount: 16,
      currentDay: "Scheduled (Starts Dec 01)",
      progressAvg: 0,
      activeStatus: "UPCOMING",
    },
  ];

  return (
    <div className="instructor-workspace space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner: Instructor Command Station */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-card via-card to-emerald-950/20 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <Presentation className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                INSTRUCTOR COMMAND CONSOLE
              </span>
              <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/40 text-emerald-300">
                AUTHORIZED FACILITATOR
              </Badge>
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {programme.title} • Active Session Delivery
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => onSelectNav("session-delivery")}
            className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-semibold text-xs h-8 gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
          >
            <Presentation className="h-3.5 w-3.5" />
            <span>Launch Live Delivery</span>
          </Button>
        </div>
      </div>

      {/* VIEW: INSTRUCTOR OVERVIEW */}
      {(activeNavId === "instructor-overview" || activeNavId === "instructor") && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 border-emerald-500/30 bg-card/60">
              <span className="font-mono text-[10px] text-muted-foreground uppercase font-bold">ASSIGNED COHORT</span>
              <div className="text-base font-bold text-foreground mt-1 truncate">NPLRA Nov-2026</div>
              <p className="text-[11px] text-emerald-400 mt-0.5">24 Active Enrolled Students</p>
            </Card>

            <Card className="p-4 border-border/80 bg-card/60">
              <span className="font-mono text-[10px] text-muted-foreground uppercase font-bold">ATTENDANCE RATE</span>
              <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">100%</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">All 24 seats checked in</p>
            </Card>

            <Card className="p-4 border-border/80 bg-card/60">
              <span className="font-mono text-[10px] text-muted-foreground uppercase font-bold">AVG COMPETENCY</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">88%</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Day 1 Practical Evaluation</p>
            </Card>

            <Card className="p-4 border-border/80 bg-card/60">
              <span className="font-mono text-[10px] text-muted-foreground uppercase font-bold">ASSISTANCE QUEUE</span>
              <div className="text-2xl font-bold text-foreground font-mono mt-1">0 Open</div>
              <p className="text-[11px] text-emerald-400 mt-0.5">Zero student blockers</p>
            </Card>
          </div>

          {/* Quick Actions & Live Classroom Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-400" />
                  <span>Enrolled Cohorts</span>
                </h3>
              </div>

              <div className="space-y-3">
                {cohorts.map((cohort) => (
                  <Card key={cohort.id} className="p-4 border-border/80 bg-card/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-emerald-400">{cohort.id.toUpperCase()}</span>
                      <Badge className="bg-emerald-950 text-emerald-300 border-emerald-500/40 text-[10px]">
                        {cohort.activeStatus}
                      </Badge>
                    </div>
                    <h4 className="text-sm font-bold text-foreground">{cohort.name}</h4>
                    <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/60">
                      <span>{cohort.studentsCount} Students • {cohort.currentDay}</span>
                      <span className="font-mono text-cyan-400 font-bold">{cohort.progressAvg}% Cohort Avg</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1 space-y-4">
              <Card className="p-5 border-border/80 bg-card/60 space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase text-muted-foreground">
                  Quick Broadcast to Cohort
                </h4>
                <div className="space-y-2">
                  <textarea
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Broadcast checkpoint hint to all students..."
                    rows={3}
                    className="w-full rounded-md border border-border/80 bg-slate-950 p-2.5 text-xs text-foreground font-mono focus:border-emerald-500 focus:outline-none"
                  />
                  <Button
                    size="sm"
                    onClick={handleSendBroadcast}
                    className="w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-xs font-semibold"
                  >
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    <span>Send Announcement</span>
                  </Button>
                </div>

                <div className="pt-2 border-t border-border/60 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">Recent Broadcasts:</span>
                  {broadcastHistory.map((msg, idx) => (
                    <div key={idx} className="text-[11px] text-muted-foreground bg-card/40 p-2 rounded border border-border/40">
                      {msg}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: SESSION DELIVERY (PRESENT / TEACH MODE) */}
      {activeNavId === "session-delivery" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-border/80 pb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Interactive Session Delivery</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Synchronous teaching mode with concept lecture notes, range demonstrations, and student checkpoint alerts.
              </p>
            </div>
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-300 font-mono text-xs">
              LIVE TEACHING CONSOLE
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-2">
              <span className="font-mono text-xs font-bold uppercase text-emerald-400">Select Session to Deliver:</span>
              <div className="space-y-1">
                {programme.days[0]?.sessions.map((sess) => (
                  <button
                    key={sess.id}
                    onClick={() => setDeliverySessionId(sess.id)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                      deliverySessionId === sess.id
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold"
                        : "border-border/60 bg-card/40 text-muted-foreground hover:bg-card/70"
                    }`}
                  >
                    <div className="font-mono text-[10px] text-emerald-400">{sess.id.toUpperCase()}</div>
                    <div className="font-bold truncate mt-0.5">{sess.title}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3 space-y-4">
              <Card className="p-6 border-border/80 bg-card/70 space-y-4">
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                  <div>
                    <span className="font-mono text-xs text-emerald-400 uppercase font-bold">
                      DELIVERING: {deliverySessionId.toUpperCase()}
                    </span>
                    <h3 className="text-lg font-bold text-foreground mt-1">
                      Instructor Guided Demonstration & Range Control
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs">
                      Reset Demo Telemetry
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border border-border/80 overflow-hidden">
                  <PacketJourneySimulator />
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: LIVE CLASSROOM MONITORING */}
      {activeNavId === "classroom-monitoring" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-border/80 pb-4">
            <h1 className="text-2xl font-bold text-foreground">Live Classroom & Lab Monitoring</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Real-time telemetry of student hardware tiers, verification progress, and assistance requests.
            </p>
          </div>

          <InstructorLabReadinessPanel
            assistanceRequests={state.assistanceRequests ?? []}
            onUpdateTicketStatus={(ticketId, status, note) => {
              // acknowledge or resolve ticket
            }}
          />
        </div>
      )}

      {/* VIEW: ATTENDANCE */}
      {activeNavId === "attendance" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-border/80 pb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Classroom Attendance Record</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Session check-ins for Cohort Nov-2026 Alpha (24 Students)
              </p>
            </div>
            <Button size="sm" className="bg-emerald-500 text-slate-950 font-semibold text-xs">
              Save Attendance Roster
            </Button>
          </div>

          <div className="rounded-xl border border-border/80 bg-card/60 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-card/90 border-b border-border/80 font-mono text-muted-foreground uppercase text-[10px]">
                <tr>
                  <th className="p-3">Seat</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Badge #</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {DEMO_STUDENTS.map((student) => (
                  <tr key={student.id} className="hover:bg-card/40">
                    <td className="p-3 font-mono font-bold text-cyan-400">{student.seat}</td>
                    <td className="p-3 font-medium text-foreground">{student.name}</td>
                    <td className="p-3 text-muted-foreground font-mono text-[11px]">{student.email}</td>
                    <td className="p-3 font-mono text-muted-foreground">{student.badge}</td>
                    <td className="p-3 text-center">
                      <Badge className="bg-emerald-950/60 text-emerald-300 border-emerald-500/40 text-[10px]">
                        PRESENT
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onUpdateAttendance(student.id, true)}
                        className="text-xs h-7 text-muted-foreground hover:text-foreground"
                      >
                        Toggle
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: ASSESSMENT REVIEW & STUDENT PERFORMANCE */}
      {(activeNavId === "assessment-review" || activeNavId === "student-performance") && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-border/80 pb-4">
            <h1 className="text-2xl font-bold text-foreground">Assessment Review & Competency Matrix</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Item analysis, misconception tracking, and cohort grade distribution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-5 border-border/80 bg-card/60 space-y-2">
              <span className="font-mono text-xs text-muted-foreground uppercase font-bold">COHORT PASS RATE</span>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono">92%</div>
              <p className="text-xs text-muted-foreground">Threshold: 70% or higher</p>
            </Card>

            <Card className="p-5 border-border/80 bg-card/60 space-y-2">
              <span className="font-mono text-xs text-muted-foreground uppercase font-bold">TOP IDENTIFIED GAP</span>
              <div className="text-base font-bold text-amber-400 mt-1">TCP Connection State Flags</div>
              <p className="text-xs text-muted-foreground">3 students missed SYN_RCVD transition</p>
            </Card>

            <Card className="p-5 border-border/80 bg-card/60 space-y-2">
              <span className="font-mono text-xs text-muted-foreground uppercase font-bold">TOTAL SUBMISSIONS</span>
              <div className="text-3xl font-extrabold text-cyan-400 font-mono">24</div>
              <p className="text-xs text-muted-foreground">Day 1 Session 1 & 2 evaluated</p>
            </Card>
          </div>
        </div>
      )}

      {/* VIEW: REPORTS & EXPORTS */}
      {activeNavId === "reports" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-border/80 pb-4">
            <h1 className="text-2xl font-bold text-foreground">Cohort Reports & CSV Exports</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Institutional grade sheets, attendance transcripts, and accreditation logs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Cohort Nov-2026 Attendance Summary", format: "CSV / XLSX", desc: "Complete 5-day attendance record with sign-in timestamps." },
              { title: "Practical Competency & Assessment Matrix", format: "CSV / PDF", desc: "Detailed breakdown of lab completion and exam percentages." },
              { title: "NPLRA Contact Hours Certification Log", format: "PDF Official", desc: "Authoritative 30-hour instruction log signed by instructor." },
            ].map((rep, idx) => (
              <Card key={idx} className="p-4 border-border/80 bg-card/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground">{rep.title}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{rep.desc}</p>
                  <span className="font-mono text-[10px] text-emerald-400 mt-1 block">{rep.format}</span>
                </div>
                <Button size="sm" variant="outline" className="text-xs h-8 shrink-0">
                  Export
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
