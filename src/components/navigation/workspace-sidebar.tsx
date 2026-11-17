import React from "react";
import {
  LayoutDashboard,
  GraduationCap,
  CalendarDays,
  BookOpen,
  FlaskConical,
  Radio,
  ClipboardCheck,
  Activity,
  FileJson2,
  MonitorCheck,
  Users,
  Presentation,
  ShieldAlert,
  SlidersHorizontal,
  FolderTree,
  CheckSquare,
  FileSpreadsheet,
  Settings,
  UserCheck,
  KeyRound,
  Server,
  Layers,
  History,
  Building,
  HeartPulse,
  type LucideIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@/lib/auth-service";

export interface NavEntry {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

interface WorkspaceSidebarProps {
  role: UserRole;
  activeNavId: string;
  onSelectNav: (id: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function WorkspaceSidebar({
  role,
  activeNavId,
  onSelectNav,
  isOpen = false,
  onClose,
}: WorkspaceSidebarProps) {
  // Student Navigation Items
  const studentNavItems: NavEntry[] = [
    { id: "my-learning", label: "My Learning", icon: LayoutDashboard },
    { id: "programmes", label: "My Programmes", icon: GraduationCap },
    { id: "sessions", label: "Learning Sessions", icon: CalendarDays },
    { id: "concepts", label: "Concepts Explorer", icon: BookOpen },
    { id: "labs", label: "Practical Labs", icon: FlaskConical },
    { id: "cyber-range", label: "Cyber Range", icon: Radio, badge: "LIVE" },
    { id: "assessments", label: "Assessments", icon: ClipboardCheck },
    { id: "progress", label: "My Progress", icon: Activity },
    { id: "resources", label: "Learning Resources", icon: FileJson2 },
    { id: "readiness", label: "Profile & Lab Mode", icon: MonitorCheck },
  ];

  // Instructor Navigation Items
  const instructorNavItems: NavEntry[] = [
    { id: "instructor-overview", label: "Instructor Overview", icon: LayoutDashboard },
    { id: "cohorts", label: "My Cohorts", icon: Users },
    { id: "session-delivery", label: "Session Delivery", icon: Presentation, badge: "TEACH" },
    { id: "curriculum", label: "Curriculum Management", icon: FolderTree },
    { id: "lab-control", label: "Practical Lab Control", icon: SlidersHorizontal },
    { id: "classroom-monitoring", label: "Live Classroom Monitoring", icon: ShieldAlert, badge: "LIVE" },
    { id: "assessment-review", label: "Assessment Review", icon: CheckSquare },
    { id: "student-performance", label: "Student Performance", icon: Activity },
    { id: "attendance", label: "Attendance", icon: UserCheck },
    { id: "reports", label: "Reports & Exports", icon: FileSpreadsheet },
  ];

  // Administrator Navigation Items
  const adminNavItems: NavEntry[] = [
    { id: "admin-overview", label: "Platform Overview", icon: LayoutDashboard },
    { id: "user-management", label: "User Management", icon: Users },
    { id: "role-management", label: "Role & Access (RBAC)", icon: KeyRound },
    { id: "programme-management", label: "Programme Management", icon: GraduationCap },
    { id: "cohort-management", label: "Cohort Management", icon: Building },
    { id: "curriculum-admin", label: "Curriculum Administration", icon: FolderTree },
    { id: "scheduling-admin", label: "Session Scheduling", icon: CalendarDays },
    { id: "lab-management", label: "Lab & Simulation Config", icon: Server },
    { id: "assessment-admin", label: "Assessment Administration", icon: ClipboardCheck },
    { id: "platform-health", label: "Platform Health & Diagnostics", icon: HeartPulse, badge: "OK" },
    { id: "audit-logs", label: "Audit & Activity Logs", icon: History },
    { id: "institutional-reports", label: "Institutional Reports", icon: FileSpreadsheet },
    { id: "system-config", label: "System Configuration", icon: Settings },
  ];

  const currentNavItems =
    role === "instructor"
      ? instructorNavItems
      : role === "administrator"
        ? adminNavItems
        : studentNavItems;

  const roleTitle =
    role === "instructor"
      ? "Instructor Console"
      : role === "administrator"
        ? "Administration"
        : "Student Workspace";

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border/80 bg-gradient-to-b from-card/95 via-card/90 to-background/95 p-3.5 transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Workspace Identifier Header */}
        <div className="mb-3 flex items-center justify-between border-b border-border/70 pb-3 px-2">
          <div className="flex flex-col">
            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-cyan-400">
              Active Environment
            </span>
            <span className="text-xs font-semibold text-foreground">{roleTitle}</span>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 md:hidden text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1 text-xs">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNavId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectNav(item.id);
                  if (onClose) onClose();
                }}
                className={`flex w-full items-center justify-between gap-2.5 rounded-md px-3 py-2 text-left font-medium transition-all ${
                  isActive
                    ? "border border-cyan-500/50 bg-cyan-500/10 text-cyan-300 shadow-[inset_2px_0_0_#00e5ff,0_0_12px_rgba(0,229,255,0.08)]"
                    : "border border-transparent text-muted-foreground hover:bg-card/70 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive ? "text-cyan-400" : "text-muted-foreground"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <Badge
                    variant="outline"
                    className="h-4 border-cyan-500/40 bg-cyan-950/40 px-1.5 font-mono text-[9px] font-bold text-cyan-400"
                  >
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Status */}
        <div className="mt-auto border-t border-border/70 pt-3 px-2">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
            <span>NETWORK SIM:</span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00e5ff]" />
              OPERATIONAL
            </span>
          </div>
          <div className="mt-1 text-[9px] text-muted-foreground/80">
            NPLRA Security Baseline • v2.4
          </div>
        </div>
      </aside>
    </>
  );
}
