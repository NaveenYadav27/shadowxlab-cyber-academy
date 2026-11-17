import { useState } from "react";
import {
  Zap,
  Check,
  Copy,
  ChevronRight,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Terminal,
  Activity,
  ArrowLeft,
  LifeBuoy,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DIAGNOSTIC_DECISION_TREE,
  type TroubleshootingStep,
  type AssistanceRequest,
} from "@/lib/lab-readiness-types";

interface LabTroubleshootingWizardProps {
  onOpenAssistanceModal: (
    category: AssistanceRequest["blockerCategory"],
    defaultMsg: string,
  ) => void;
  onOpenStandardLab: () => void;
}

export function LabTroubleshootingWizard({
  onOpenAssistanceModal,
  onOpenStandardLab,
}: LabTroubleshootingWizardProps) {
  const [currentStepId, setCurrentStepId] = useState<string>("step-1-kali-dhcp");
  const [history, setHistory] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentStep =
    DIAGNOSTIC_DECISION_TREE.find((s) => s.id === currentStepId) ?? DIAGNOSTIC_DECISION_TREE[0];

  const copyToClipboard = (text: string, id: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Command copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAnswer = (answer: "yes" | "no") => {
    if (!currentStep) return;
    setHistory((prev) => [...prev, currentStep.id]);

    if (answer === "yes") {
      if (currentStep.yesNextStepId) {
        setCurrentStepId(currentStep.yesNextStepId);
      } else {
        toast.success("All diagnostic checks passed!");
      }
    } else {
      if (currentStep.noNextStepId) {
        setCurrentStepId(currentStep.noNextStepId);
      }
    }
  };

  const handleBack = () => {
    if (history.length === 0) return;
    const prevId = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    if (prevId) {
      setCurrentStepId(prevId);
    }
  };

  const handleReset = () => {
    setHistory([]);
    setCurrentStepId("step-1-kali-dhcp");
    toast.info("Troubleshooting wizard reset to initial check");
  };

  const isCompleted = currentStep?.id === "step-6-all-passed";

  // Map step to blocker category for 1-click instructor help
  const getBlockerCategoryForStep = (stepId: string): AssistanceRequest["blockerCategory"] => {
    if (stepId.includes("dhcp") || stepId.includes("kali")) return "kali_dhcp";
    if (stepId.includes("adapter") || stepId.includes("sxl_lan")) return "sxl_lan";
    if (stepId.includes("ping") || stepId.includes("arp")) return "gateway_ping";
    if (stepId.includes("nat") || stepId.includes("internet")) return "internet_nat";
    if (stepId.includes("dns")) return "dns";
    return "other";
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-lg border border-border bg-gradient-to-r from-card via-surface to-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Zap size={15} />
              Interactive Diagnostic Troubleshooting Wizard
            </div>
            <h2 className="mt-1 text-xl font-bold text-foreground">
              Automated Network & VM Roadblock Resolver
            </h2>
            <p className="mt-1 text-xs text-muted-foreground max-w-2xl">
              Answer step-by-step diagnostic questions. The wizard pinpoints the exact cause of DHCP
              failures, Internal Network mismatches, ARP timeouts, and internet gateway routing
              bugs.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
              <RotateCcw size={13} />
              Reset Wizard
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onOpenStandardLab}
              className="gap-1.5 text-xs bg-cyber text-primary-foreground hover:bg-cyber/90"
            >
              <Terminal size={13} />
              Back to pfSense Lab
            </Button>
          </div>
        </div>

        {/* Diagnostic Breadcrumb Tracker */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border/70 pt-4 text-[10px] font-mono text-muted-foreground">
          <span className="text-foreground font-semibold">Diagnostic Path:</span>
          {DIAGNOSTIC_DECISION_TREE.slice(0, 6).map((step, idx) => {
            const isCurrent = step.id === currentStep?.id;
            const wasVisited = history.includes(step.id);
            return (
              <div key={step.id} className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setHistory((prev) => [...prev, currentStep?.id ?? ""]);
                    setCurrentStepId(step.id);
                  }}
                  className={`px-2 py-0.5 rounded border transition-colors ${
                    isCurrent
                      ? "border-amber-400 bg-amber-400/15 text-amber-300 font-bold"
                      : wasVisited
                        ? "border-cyber/40 bg-cyber/10 text-cyber"
                        : "border-border bg-surface text-muted-foreground"
                  }`}
                >
                  Step {idx + 1}
                </button>
                {idx < 5 && <ChevronRight size={12} className="text-border" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Step Questionnaire & Remediation View */}
      {currentStep && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Active Question & Command Execution Card (7 cols) */}
          <div className="space-y-4 lg:col-span-7">
            <Card className="p-5 border-border space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold">
                    {currentStep.category}
                  </span>
                  <span className="text-xs font-semibold text-foreground">{currentStep.title}</span>
                </div>
                {history.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="h-6 px-2 text-[10px] gap-1 text-muted-foreground"
                  >
                    <ArrowLeft size={11} /> Back
                  </Button>
                )}
              </div>

              {/* Big Question Prompt */}
              <div className="p-4 rounded-lg bg-surface border border-border/80">
                <h3 className="text-sm font-bold text-foreground leading-relaxed">
                  {currentStep.question}
                </h3>

                {currentStep.checkCommand && (
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                      <span>Verification Command:</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(currentStep.checkCommand!, "check-cmd")}
                        className="flex items-center gap-1 text-cyber hover:underline"
                      >
                        {copiedId === "check-cmd" ? <Check size={11} /> : <Copy size={11} />}
                        Copy Command
                      </button>
                    </div>
                    <code className="block p-2 rounded bg-background border border-border text-cyber text-xs font-mono">
                      {currentStep.checkCommand}
                    </code>
                  </div>
                )}

                {currentStep.expectedOutput && (
                  <div className="mt-2 text-[10px] font-mono text-muted-foreground">
                    <span className="text-foreground font-semibold">Expected Healthy Output:</span>
                    <pre className="mt-1 p-2 rounded bg-background/60 border border-border/60 text-emerald-400/90 whitespace-pre-wrap overflow-x-auto text-[11px]">
                      {currentStep.expectedOutput}
                    </pre>
                  </div>
                )}
              </div>

              {/* Action Buttons: Yes / No */}
              {!isCompleted ? (
                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    Does your VM terminal match the expected output?
                  </span>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAnswer("no")}
                      className="gap-1.5 text-xs border-destructive/50 text-destructive hover:bg-destructive/10 min-w-[90px]"
                    >
                      <AlertTriangle size={14} />
                      No / Failed
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleAnswer("yes")}
                      className="gap-1.5 text-xs bg-emerald-600 text-white hover:bg-emerald-500 min-w-[90px]"
                    >
                      <CheckCircle2 size={14} />
                      Yes / Passed
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 size={18} className="text-emerald-400" />
                    All Diagnostic Gates Successfully Cleared!
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Your Kali Linux, pfSense firewall, and internal network SXL-LAN are configured
                    in full alignment with the standardized corporate training architecture.
                  </p>
                  <Button
                    size="sm"
                    onClick={onOpenStandardLab}
                    className="mt-2 text-xs bg-cyber text-primary-foreground hover:bg-cyber/90"
                  >
                    Proceed to Practical Lab Tasks →
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Remediation & Instructor Escalation (5 cols) */}
          <div className="space-y-4 lg:col-span-5">
            {currentStep.actionIfNo ? (
              <Card className="p-4 border-amber-500/40 bg-card space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-400 uppercase pb-2 border-b border-border">
                  <LifeBuoy size={15} />
                  Remediation & Fix Guide
                </div>

                <div className="space-y-1.5 text-xs">
                  <strong className="text-foreground block text-[11px]">Probable Cause:</strong>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    {currentStep.actionIfNo.cause}
                  </p>
                </div>

                {currentStep.actionIfNo.fixSteps.length > 0 && (
                  <div className="space-y-1.5 text-xs pt-2 border-t border-border/70">
                    <strong className="text-foreground block text-[11px]">
                      Recommended Fix Steps:
                    </strong>
                    <ol className="list-decimal pl-4 space-y-1 text-muted-foreground text-[11px]">
                      {currentStep.actionIfNo.fixSteps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {currentStep.actionIfNo.fixCommands.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border/70">
                    <strong className="text-foreground block text-[11px]">
                      Remediation Commands:
                    </strong>
                    {currentStep.actionIfNo.fixCommands.map((cmdItem, idx) => (
                      <div
                        key={idx}
                        className="rounded bg-background border border-border p-2.5 font-mono text-[11px]"
                      >
                        <div className="flex items-center justify-between text-muted-foreground text-[10px]">
                          <span>{cmdItem.label}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(cmdItem.cmd, `fix-cmd-${idx}`)}
                            className="flex items-center gap-1 text-cyber hover:underline"
                          >
                            {copiedId === `fix-cmd-${idx}` ? (
                              <Check size={11} />
                            ) : (
                              <Copy size={11} />
                            )}
                            Copy
                          </button>
                        </div>
                        <code className="text-foreground block mt-1 whitespace-pre-wrap">
                          {cmdItem.cmd}
                        </code>
                        {cmdItem.explanation && (
                          <span className="text-[10px] text-muted-foreground block mt-1">
                            {cmdItem.explanation}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Still blocked?</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onOpenAssistanceModal(
                        getBlockerCategoryForStep(currentStep.id),
                        `Stuck on ${currentStep.title}: ${currentStep.question}`,
                      )
                    }
                    className="h-7 text-[10px] gap-1.5 border-amber-500/50 text-amber-300 hover:bg-amber-500/20"
                  >
                    <HelpCircle size={12} />
                    Escalate to Instructor
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-4 border-border space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-cyber uppercase pb-2 border-b border-border">
                  <Activity size={15} />
                  Diagnostic Status
                </div>
                <p className="text-xs text-muted-foreground">
                  Running sequential diagnostic validation. Answer the question on the left to
                  verify your networking and firewall interfaces.
                </p>
                <div className="p-3 rounded bg-surface border border-border/70 text-[11px] text-muted-foreground space-y-1">
                  <div>• Subnet Range: 192.168.50.0/24</div>
                  <div>• Gateway: 192.168.50.1</div>
                  <div>• Virtual Switch: SXL-LAN</div>
                  <div>• DHCP Scope: 192.168.50.100 - 200</div>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
