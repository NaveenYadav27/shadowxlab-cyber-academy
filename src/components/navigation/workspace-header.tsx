import React from "react";
import {
  Shield,
  ShieldCheck,
  User,
  LogOut,
  LogIn,
  Sliders,
  Radio,
  Menu,
  ChevronDown,
  MonitorCheck,
  GraduationCap,
  Users,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoImg from "@/assets/shadowxlab-logo.png";
import { useAuth } from "@/lib/auth-context";
import type { UserRole } from "@/lib/auth-service";
import type { LabMode } from "@/lib/lab-readiness-types";

interface WorkspaceHeaderProps {
  onToggleSidebar?: () => void;
  onOpenAuthModal: () => void;
  selectedLabMode?: LabMode;
  onOpenReadiness?: () => void;
}

export function WorkspaceHeader({
  onToggleSidebar,
  onOpenAuthModal,
  selectedLabMode = "simulation",
  onOpenReadiness,
}: WorkspaceHeaderProps) {
  const { user, role, signOut, setPreviewRole } = useAuth();
  const isDev = Boolean(import.meta.env?.DEV);

  const roleColors: Record<UserRole, string> = {
    student: "border-red-200 text-red-600 bg-red-50",
    instructor: "border-emerald-200 text-emerald-700 bg-emerald-50",
    administrator: "border-purple-200 text-purple-700 bg-purple-50",
    guest: "border-amber-200 text-amber-700 bg-amber-50",
  };

  const roleLabels: Record<UserRole, string> = {
    student: "Student Workspace",
    instructor: "Instructor Console",
    administrator: "Administrator Workspace",
    guest: "Guest Learner",
  };

  return (
    <header className="sticky top-0 z-30 flex min-h-[68px] items-center justify-between border-b border-border bg-white/95 px-4 py-2.5 backdrop-blur-md sm:px-6 shadow-xs">
      {/* Left: Mobile Trigger & Brand Identity */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={onToggleSidebar}
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <div className="flex items-center gap-2.5">
          <img
            src={logoImg}
            alt="ShadowXLab Logo"
            className="h-9 w-auto max-w-[140px] object-contain"
          />
          <div className="hidden border-l border-border pl-2.5 lg:block">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-red-600">
              Cyber Academy
            </span>
            <div className="text-[11px] text-muted-foreground font-medium">
              Enterprise Cybersecurity Learning & Simulation
            </div>
          </div>
        </div>
      </div>

      {/* Center: Active Role & Lab Telemetry */}
      <div className="hidden items-center gap-3 md:flex">
        <Badge
          variant="outline"
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold ${roleColors[role]}`}
        >
          {role === "student" && <GraduationCap className="h-3.5 w-3.5" />}
          {role === "instructor" && <Users className="h-3.5 w-3.5" />}
          {role === "administrator" && <Settings2 className="h-3.5 w-3.5" />}
          {role === "guest" && <User className="h-3.5 w-3.5" />}
          <span>{roleLabels[role]}</span>
        </Badge>

        {onOpenReadiness && (
          <button
            onClick={onOpenReadiness}
            className="flex items-center gap-1.5 rounded-md border border-border bg-slate-50 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-red-300 hover:text-red-600"
            title="Inspect or configure Lab Execution Mode"
          >
            <Radio className="h-3 w-3 text-red-600 animate-pulse" />
            <span className="font-mono uppercase text-foreground">
              {selectedLabMode === "simulation"
                ? "Simulated Range (Zero Blocker)"
                : selectedLabMode === "local-full"
                  ? "Local VirtualBox (Full)"
                  : selectedLabMode === "local-light"
                    ? "Local pfSense (Light)"
                    : "Shared Remote Range"}
            </span>
          </button>
        )}
      </div>

      {/* Right: Role Switcher (Dev/Preview) & User Session */}
      <div className="flex items-center gap-2">
        {isDev && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 border-border bg-white px-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <Sliders className="h-3.5 w-3.5 text-red-600" />
                <span className="hidden sm:inline">Role View:</span>
                <span className="font-semibold capitalize text-foreground">{role}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-mono">
                DEVELOPER ROLE PREVIEW
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setPreviewRole("student")}
                className="text-xs cursor-pointer flex items-center justify-between"
              >
                <span>Student Workspace</span>
                {role === "student" && <ShieldCheck className="h-3.5 w-3.5 text-red-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setPreviewRole("instructor")}
                className="text-xs cursor-pointer flex items-center justify-between"
              >
                <span>Instructor Console</span>
                {role === "instructor" && <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setPreviewRole("administrator")}
                className="text-xs cursor-pointer flex items-center justify-between"
              >
                <span>Administrator Workspace</span>
                {role === "administrator" && <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setPreviewRole("guest")}
                className="text-xs cursor-pointer flex items-center justify-between"
              >
                <span>Guest Learner</span>
                {role === "guest" && <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-2 border-border bg-white px-2.5 text-xs text-foreground hover:border-red-300"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-50 text-[10px] font-bold text-red-600 border border-red-200">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate font-medium hidden sm:inline">
                  {user.email}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-semibold leading-none text-foreground">{user.email}</p>
                  <p className="text-[10px] leading-none text-muted-foreground font-mono">
                    Role: {user.role.toUpperCase()}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {onOpenReadiness && (
                <DropdownMenuItem onClick={onOpenReadiness} className="text-xs cursor-pointer">
                  <MonitorCheck className="mr-2 h-3.5 w-3.5 text-red-600" />
                  <span>Lab Readiness Diagnostics</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-xs text-red-600 cursor-pointer focus:text-red-700"
              >
                <LogOut className="mr-2 h-3.5 w-3.5" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            size="sm"
            onClick={onOpenAuthModal}
            className="h-8 gap-1.5 bg-primary text-primary-foreground hover:bg-[#A91219] font-semibold text-xs px-3 shadow-xs"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In / Demo</span>
          </Button>
        )}
      </div>
    </header>
  );
}
