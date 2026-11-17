# ShadowXLab Cyber Academy — Firewall & VPN Security Administration
# Phase 9: Student Learning Experience & Lifecycle Audit

This audit examines the friction points and cognitive load experienced by corporate students progressing through the platform.

---

## 1. The 12-Step Student Learning Journey

The ShadowXLab student workflow is audited against the complete 12-stage enterprise training lifecycle:

```mermaid
flowchart TD
    S1[1. Understand Objective] --> S2[2. Study Technical Concept]
    S2 --> S3[3. View Topology Diagram]
    S3 --> S4[4. Calibrate Hardware & Select Mode]
    S4 --> S5[5. Verify Lab Readiness]
    S5 --> S6[6. Execute Step-by-Step Lab]
    S6 --> S7[7. Validate Expected Output]
    S7 --> S8{Passes Verification?}
    S8 -- No --> S9[8. Interactive Troubleshooting Wizard]
    S9 -- Blocked --> S10[8a. Dispatch Assistance Ticket]
    S9 -- Fixed --> S7
    S8 -- Yes --> S11[9. Capture Terminal Evidence]
    S11 --> S12[10. Submit Results to Instructor]
    S12 --> S13[11. Complete Assessment]
    S13 --> S14[12. Track Real Competency Score]
```

---

## 2. Friction Points & UX Recommendations

| Stage | Observed Student Friction | Implemented / Recommended Mitigation | Status |
| :--- | :--- | :--- | :--- |
| **Hardware Setup** | Laptop freezes running 3 GUI VMs; RAM exhaustion. | Added **Lab Readiness Center** with 4 execution modes (Modes A, B, C, D) and RAM sliders. | **IMPLEMENTED** |
| **VirtualBox NICs** | Case-sensitivity mismatch (`SXL-LAN` vs `sxl-lan`) causing zero DHCP leases. | Added copyable VBoxManage setup commands and explicit case-sensitivity alerts. | **IMPLEMENTED** |
| **pfSense Console** | Confusion during initial interface assignment (inverting WAN and LAN). | Created clear Option 1 and Option 2 numbered walkthroughs with expected prompt texts. | **IMPLEMENTED** |
| **Troubleshooting** | Instructor overwhelmed by 10 students asking the same DHCP question. | Built **Lab Troubleshooting Wizard** with an 8-step self-service decision tree. | **IMPLEMENTED** |
| **Command Typos** | Students miskeying complex BPF filters or routing commands. | Integrated 1-click **Copy to Clipboard** buttons on all practical commands. | **IMPLEMENTED** |
| **Proof of Competency** | Students marking checkboxes without actually performing the lab. | Enforced **Terminal Evidence Submission** requiring actual CLI terminal paste. | **IMPLEMENTED** |
| **Days 2–5 Navigation** | ModulesView for Days 2–5 only shows bullet points with no deep explanations. | Expand Day 2–5 curriculum structure to match Day 1's rich concept panel. | **RECOMMENDED ROADMAP** |
