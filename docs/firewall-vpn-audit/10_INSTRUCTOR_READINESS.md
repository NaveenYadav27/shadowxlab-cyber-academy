# ShadowXLab Cyber Academy — Firewall & VPN Security Administration
# Phase 10: Instructor Readiness, Teaching Scripts & Console Audit

This document audits the operational tools available to the lead instructor (Naveen Kumar Yadav Loya) and delivery assistants to supervise, pace, and support a 10-student corporate cohort.

---

## 1. Instructor Console Capabilities (`InstructorView`)

### A. Real-Time Student Lab Readiness Roster
The instructor console provides live visibility across all 10 corporate demo students:
- **Alex Chen** (Station 01)
- **Beatriz Santos** (Station 02)
- **Chen Wei** (Station 03)
- **Dmitri Volkov** (Station 04)
- **Elena Rostova** (Station 05)
- **Fatima Al-Mansoor** (Station 06)
- **Gabriel Morales** (Station 07)
- **Hana Tanaka** (Station 08)
- **Ibrahim Diallo** (Station 09)
- **Zoe Washington** (Station 10)

For each student, the instructor can instantly see:
- Selected Lab Mode (Full Local, Lightweight, Shared Range, Simulation)
- Hardware capability rating
- Current operational status (`READY`, `IN_PROGRESS`, `BLOCKED`, `COMPLETED`)
- Active blocker category if stuck
- Verification status (Kali IP, pfSense Ping, Ubuntu Ping, Internet NAT, DNS, webConfigurator)

### B. Live Assistance Ticketing Queue
- When a student reaches a dead-end in the troubleshooting wizard, they can submit an assistance request.
- The ticket automatically captures the student's seat, lab mode, blocker category, hardware specs, and error description.
- The instructor can:
  1. **Acknowledge Ticket**: Informs the student that the instructor is reviewing their workstation.
  2. **Add Instructor Notes**: Documents root cause (e.g., "VirtualBox NIC case mismatch" or "Hyper-V conflict").
  3. **Resolve Ticket**: Closes the issue once connectivity is restored.

---

## 2. Instructor Lecture Pacing & Daily Scripts

| Time Slot | Daily Segment | Recommended Instructor Action | Break-Fix Intervention Preparedness |
| :--- | :--- | :--- | :--- |
| **09:45 - 10:00** | Lab Environment Warm-Up | Check student readiness center; confirm all student VMs are booting cleanly. | Keep pre-configured lightweight VM appliances ready on USB/shared drive. |
| **10:00 - 11:30** | Session 1 (Theory / Architecture) | Deliver conceptual foundations using Day 1 / Day 2 concept panels and diagrams. | Monitor chat/questions for protocol confusion (e.g. TCP flags vs UDP states). |
| **11:30 - 11:45** | Morning Bio Break | Review assistance queue; address any background hardware issues. | Reset corrupted student VMs if needed. |
| **11:45 - 13:00** | Session 2 (Hands-On Lab 1) | Guide students through step-by-step practical lab walkthrough. | Check pfSense console Option 2 DHCP assignments across the room. |
| **13:00 - 14:00** | Lunch Break | Verify submitted terminal evidence for Morning Lab. | Grade/review evidence submissions in instructor console. |
| **14:00 - 15:30** | Session 3 (Deep Dive / Advanced) | Technical exploration of NAT, cryptographic algorithms, or routing protocols. | Use Wireshark live capture demonstration on projector. |
| **15:30 - 15:45** | Afternoon Bio Break | Check afternoon attendance and session assessment completions. | Identify lagging students for 1-on-1 assistance. |
| **15:45 - 17:00** | Session 4 (Hands-On Lab 2 / Exam) | Supervise hands-on policy configuration or administer day-end exam. | Enforce strict terminal output evidence before signing off completion. |
