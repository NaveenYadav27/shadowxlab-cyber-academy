import React, { useState } from "react";
import {
  Settings2,
  Users,
  KeyRound,
  GraduationCap,
  Building,
  FolderTree,
  CalendarDays,
  Server,
  ClipboardCheck,
  HeartPulse,
  History,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  RefreshCw,
  Database,
  Cloud,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { ProgrammeConfig, TrainingState } from "@/lib/training-platform";
import { DEMO_STUDENTS } from "@/lib/auth-service";

interface AdminWorkspaceProps {
  state: TrainingState;
  programme: ProgrammeConfig;
  activeNavId: string;
  onSelectNav: (navId: string) => void;
  onResetToSeed: () => void;
}

export function AdminWorkspace({
  state,
  programme,
  activeNavId,
  onSelectNav,
  onResetToSeed,
}: AdminWorkspaceProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const auditEvents = [
    { timestamp: "10:14:02", user: "student-01@shadowxlab.com", action: "Completed Session D1-S1 (Briefing → Summary)", level: "INFO" },
    { timestamp: "10:12:45", user: "instructor@shadowxlab.com", action: "Broadcasted announcement to Cohort Nov-2026", level: "NOTICE" },
    { timestamp: "09:58:10", user: "admin@shadowxlab.com", action: "Validated RLS security policies on user_roles", level: "SECURITY" },
    { timestamp: "09:30:00", user: "system", action: "Cloudflare Workers edge cache warmed", level: "SYSTEM" },
  ];

  return (
    <div className="admin-workspace space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner: Platform Governance */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-purple-500/40 bg-gradient-to-r from-card via-card to-purple-950/20 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.2)]">
            <Settings2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-purple-400">
                PLATFORM GOVERNANCE & ARCHITECTURE
              </span>
              <Badge variant="outline" className="text-[10px] font-mono border-purple-500/40 text-purple-300">
                ROOT PRIVILEGES
              </Badge>
            </div>
            <h2 className="text-xl font-bold text-foreground">
              ShadowXLab Cyber Academy • Institutional Administration
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onResetToSeed}
            variant="outline"
            className="border-purple-500/40 text-purple-300 hover:bg-purple-950/40 text-xs h-8 gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset Demo State</span>
          </Button>
        </div>
      </div>

      {/* VIEW: PLATFORM OVERVIEW */}
      {(activeNavId === "admin-overview" || activeNavId === "administration") && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 border-purple-500/30 bg-card/60">
              <span className="font-mono text-[10px] text-muted-foreground uppercase font-bold">TOTAL USERS</span>
              <div className="text-2xl font-bold text-foreground font-mono mt-1">26</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">24 Students, 1 Instructor, 1 Admin</p>
            </Card>

            <Card className="p-4 border-border/80 bg-card/60">
              <span className="font-mono text-[10px] text-muted-foreground uppercase font-bold">ACTIVE PROGRAMMES</span>
              <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">1 Published</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Firewall & VPN Administration</p>
            </Card>

            <Card className="p-4 border-border/80 bg-card/60">
              <span className="font-mono text-[10px] text-muted-foreground uppercase font-bold">DATABASE HEALTH</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-1 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                <span>ONLINE</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Supabase PostgREST & RLS Active</p>
            </Card>

            <Card className="p-4 border-border/80 bg-card/60">
              <span className="font-mono text-[10px] text-muted-foreground uppercase font-bold">EDGE LATENCY</span>
              <div className="text-2xl font-bold text-foreground font-mono mt-1">3 ms</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Cloudflare Workers Nitro</p>
            </Card>
          </div>

          {/* Infrastructure Health Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-5 border-border/80 bg-card/60 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-purple-400">
                <Database className="h-4 w-4" />
                <span>Supabase Persistence Tier</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                PostgreSQL schema version 20261115000004 with 11 tables. Client connects via anon key; service roles are strictly withheld.
              </p>
              <div className="flex items-center justify-between text-[11px] font-mono border-t border-border/60 pt-2 text-muted-foreground">
                <span>RLS ENFORCEMENT:</span>
                <span className="text-emerald-400 font-bold">STRICT (ALL 11 TABLES)</span>
              </div>
            </Card>

            <Card className="p-5 border-border/80 bg-card/60 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-cyan-400">
                <Cloud className="h-4 w-4" />
                <span>Cloudflare Deployment</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Running in Worker isolate environment with SSR Nitro bundle. Zero student VM networking configuration required.
              </p>
              <div className="flex items-center justify-between text-[11px] font-mono border-t border-border/60 pt-2 text-muted-foreground">
                <span>PRODUCTION HOST:</span>
                <span className="text-cyan-400 font-bold">sxl-net.shadowxlab.com</span>
              </div>
            </Card>

            <Card className="p-5 border-border/80 bg-card/60 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-emerald-400">
                <HardDrive className="h-4 w-4" />
                <span>LocalStorage Fallback</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Local-first storage guarantees complete offline resilience. Learner progress is safely mirrored under <code className="text-cyan-300">shadowxlab-training-state-v1</code>.
              </p>
              <div className="flex items-center justify-between text-[11px] font-mono border-t border-border/60 pt-2 text-muted-foreground">
                <span>LOCAL CACHE:</span>
                <span className="text-emerald-400 font-bold">SYNCHRONIZED</span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* VIEW: USER MANAGEMENT & ROLE ASSIGNMENT */}
      {(activeNavId === "user-management" || activeNavId === "role-management") && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-border/80 pb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">User Management & RBAC Permissions</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Manage academy users, enforce role privileges, and inspect identity tokens.
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Search by email or seat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-56 h-8 text-xs bg-slate-950 border-border"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border/80 bg-card/60 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-card/90 border-b border-border/80 font-mono text-muted-foreground uppercase text-[10px]">
                <tr>
                  <th className="p-3">User / Seat</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Assigned Role</th>
                  <th className="p-3">Cohort</th>
                  <th className="p-3 text-right">Access Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {DEMO_STUDENTS.map((student) => (
                  <tr key={student.id} className="hover:bg-card/40">
                    <td className="p-3 font-mono font-bold text-foreground">{student.seat}</td>
                    <td className="p-3 font-mono text-muted-foreground text-[11px]">{student.email}</td>
                    <td className="p-3">
                      <Badge className="bg-cyan-950/60 text-cyan-300 border-cyan-500/40 text-[10px]">
                        {student.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">Cohort Nov-2026</td>
                    <td className="p-3 text-right font-mono text-emerald-400">Verified</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: CURRICULUM ADMINISTRATION */}
      {(activeNavId === "curriculum-admin" || activeNavId === "programme-management" || activeNavId === "scheduling-admin") && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-border/80 pb-4">
            <h1 className="text-2xl font-bold text-foreground">Curriculum Governance & Policy Rules</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Curriculum catalog is locked to preserve the approved 5-Day / 20-Session Table of Contents.
            </p>
          </div>

          <Card className="p-6 border-border/80 bg-card/70 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-amber-400">
              <Lock className="h-4 w-4" />
              <span>NON-NEGOTIABLE CURRICULUM PRESERVATION LOCK</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              In accordance with institutional guidelines, all session titles, duration allocations (90 minutes each), day sequences, and contact hours (30 hours total) are locked to maintain certification compliance. Modification requires institutional authorization.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
              {programme.days.map((day, idx) => (
                <div key={day.id} className="p-3 rounded-lg border border-border/60 bg-card/40 text-xs">
                  <span className="font-mono text-[10px] text-cyan-400 font-bold">DAY {idx + 1}</span>
                  <div className="font-bold text-foreground truncate mt-0.5">{day.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{day.sessions.length} Sessions (6 Contact Hrs)</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* VIEW: AUDIT & ACTIVITY LOGS */}
      {(activeNavId === "audit-logs" || activeNavId === "platform-health") && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-border/80 pb-4">
            <h1 className="text-2xl font-bold text-foreground">Platform Health & Audit Activity Logs</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Immutable event log capturing authentication, assessment evaluations, and session completions.
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-slate-950 p-4 font-mono text-xs space-y-2">
            <div className="text-muted-foreground border-b border-border/60 pb-2 flex justify-between">
              <span>SECURITY AUDIT STREAM:</span>
              <span className="text-emerald-400">LOGGING ACTIVE</span>
            </div>
            {auditEvents.map((evt, idx) => (
              <div key={idx} className="flex items-start gap-3 py-1 text-[11px]">
                <span className="text-muted-foreground shrink-0">[{evt.timestamp}]</span>
                <span className="text-cyan-400 shrink-0 font-bold">[{evt.level}]</span>
                <span className="text-purple-300 shrink-0">{evt.user}:</span>
                <span className="text-foreground">{evt.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
