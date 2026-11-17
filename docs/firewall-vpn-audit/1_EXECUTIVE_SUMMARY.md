# ShadowXLab Cyber Academy — Firewall & VPN Security Administration
# Phase 1: Complete Repository & Curriculum Audit Inventory

This document represents the empirical codebase inventory conducted on 16 November 2026. Every finding is verified against actual TypeScript code, JSON schemas, Vitest suites, and React components.

---

## 1. Existing Course Structure & Schedule Inventory

- **Programme Title**: Enterprise Firewall & VPN Security Administration
- **Audience**: Corporate Enterprise Security Engineers, SOC Analysts, Systems Administrators
- **Format**: 5 Days, 20 Sessions (4 Sessions/Day, 90 mins each), 09:00 - 17:00
- **Lead Instructor**: Naveen Kumar Yadav Loya
- **Cyber Range**: ShadowXLab Cyber Range (`https://sxl-net.shadowxlab.com`)

| Day | Date | Title | Sessions Count | Concepts Count | Lab Type | Assessment Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Day 1** | Mon 16 Nov | Security & Firewall Foundations | 4 (`d1-s1`–`d1-s4`) | **48 Full Concepts** | 4 Interactive Browser Labs + Standard pfSense Lab | **360 Questions** (240 Concept, 80 Session, 40 Final) |
| **Day 2** | Tue 17 Nov | Firewall Architecture & Administration | 4 (`d2-s1`–`d2-s4`) | 9 Bullet Topics (0 Deep Concepts) | 3 Checkbox Mock Labs (`lab-2`, `lab-3`, `lab-4`) | 0 Dedicated Questions (Only 1 generic programme question) |
| **Day 3** | Wed 18 Nov | Advanced Firewall & VPN Foundations | 4 (`d3-s1`–`d3-s4`) | 9 Bullet Topics (0 Deep Concepts) | 2 Checkbox Mock Labs (`lab-5`, `lab-6`) | 0 Dedicated Questions (Only 1 generic programme question) |
| **Day 4** | Thu 19 Nov | VPN Deployment & Enterprise Security | 4 (`d4-s1`–`d4-s4`) | 9 Bullet Topics (0 Deep Concepts) | 1 Checkbox Mock Lab (`lab-7`) | 0 Dedicated Questions (Only 1 generic programme question) |
| **Day 5** | Fri 20 Nov | Monitoring, Troubleshooting & Wireless Security | 4 (`d5-s1`–`d5-s4`) | 8 Bullet Topics (0 Deep Concepts) | 1 Checkbox Mock Lab (`lab-8`) | 0 Dedicated Questions (Only 1 generic programme question) |

---

## 2. Technical Topics Covered (Actual Code vs Documentation)

### Day 1: Security & Firewall Foundations (COMPLETE IMPLEMENTATION)
- **Session 1.1 (`d1-s1`)**: Threat landscape, CIA triad, vulnerabilities, attack surfaces, malware categories (Trojans, worms, logic bombs, ransomware), reconnaissance, port scanning, OS fingerprinting, DoS/DDoS.
- **Session 1.2 (`d1-s2`)**: OSI vs TCP/IP layer mapping, packet structure, IP header validation, TCP/UDP headers, well-known ports (21, 22, 23, 25, 53, 80, 443, 3389), stateless packet filtering, rule match logic, default deny.
- **Session 1.3 (`d1-s3`)**: IPv4 addressing, RFC 1918 allocations, CIDR subnetting (`/8` to `/30`), netmasks, broadcast domains, TCP 3-way handshake (SYN, SYN-ACK, ACK), TCP teardown (FIN, RST), stateful connection tables, return traffic tracking.
- **Session 1.4 (`d1-s4`)**: NGFW architecture vs legacy firewalls, Deep Packet Inspection (DPI), Application Identification (App-ID), TLS/SSL decryption concepts, User-ID mapping, threat intelligence feed integration, IPS integration.

### Days 2–5: (DOCUMENTED ONLY — ARCHITECTURAL GAPS IDENTIFIED)
- **Day 2**: Contains titles for Security Zones, LAN/WAN/DMZ, Interface Assignment, and ACLs, but lacks exact CLI/GUI step instructions, VLAN tagging rules (802.1Q), and rule shadowing logic.
- **Day 3**: Mentions NAT (Outbound, Inbound, 1:1), URL filtering, and IPsec/SSL VPN theory, but lacks actual NAT reflection configurations, cryptographic cipher suite selection, and phase 1/2 parameter definitions.
- **Day 4**: Mentions Site-to-Site IPsec, Remote Access VPN, and pfSense backup/restore, but lacks OpenVPN server setup walkthrough, client export utility, WireGuard peer key exchange, and MTU troubleshooting.
- **Day 5**: Mentions syslog, traffic analysis, and troubleshooting, but lacks live packet capture (`tcpdump`/Wireshark) procedures, Suricata alert analysis, and systematic decision trees.

---

## 3. Hands-On Labs & Simulation Inventory

| Component | Code Location | Status | Implementation Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Standard pfSense Lab** | `src/components/lab-readiness/standard-pfsense-lab.tsx` | **FUNCTIONAL** | Practical Guide + Verification | WAN NAT, LAN SXL-LAN (192.168.50.1/24), Kali DHCP, Ubuntu Static, positive/negative ping tests, and terminal evidence submission. |
| **Lab Readiness Center** | `src/components/lab-readiness/lab-readiness-center.tsx` | **FUNCTIONAL** | Calibration Engine | Evaluates RAM/CPU/Disk/VT-x; assigns 1 of 4 hardware tiers; dispatches instructor assistance tickets. |
| **Troubleshooting Wizard** | `src/components/lab-readiness/lab-troubleshooting-wizard.tsx` | **FUNCTIONAL** | Interactive Decision Tree | 8-step decision tree covering DHCP failure, network name mismatch, gateway unreachability, NAT egress, and DNS failure. |
| **Day 1 Interactive Labs** | `src/components/day1/day1-labs.tsx` | **FUNCTIONAL** | Browser Simulation | 4 deterministic labs: (1) Attack Surface Mapping, (2) Rule Order Shadowing, (3) Segmentation Isolation, (4) NGFW Policy Pipeline. |
| **Legacy Range Labs (Days 2–5)** | `src/components/training-platform-app.tsx` (`LabView`) | **SUPERFICIAL** | UI Checkboxes Only | Simple checkboxes with mock network diagrams; no actual commands or execution validation. |

---

## 4. Assessment Coverage Inventory

- **Day 1 Concept Checks**: 240 questions in `src/data/day1-assessment-bank.json` (5 questions per concept for all 48 concepts).
- **Day 1 Session Assessments**: 4 assessments with 20 questions each (80 questions total) with automated grading and pass/fail thresholds.
- **Day 1 Final Comprehensive Exam**: 40 questions covering all Day 1 learning objectives.
- **Days 2–5 Assessments**: **MISSING**. Only 4 superficial questions exist in the root programme (`q1`, `q2`, `q3`, `q4`).
