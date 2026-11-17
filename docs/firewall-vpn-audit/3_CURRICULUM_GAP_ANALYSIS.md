# ShadowXLab Cyber Academy — Firewall & VPN Security Administration
# Phase 4: Day-Wise Curriculum Gap Analysis

This analysis examines the instructional progression, technical rigor, and hands-on depth across all five training days.

---

## 1. Day 1: Security & Firewall Foundations

- **Current Status**: **HIGH QUALITY / PRODUCTION READY**
- **Existing Content**: 48 comprehensive concepts, 4 browser-based interactive labs, 1 standard pfSense VirtualBox lab, 360 assessment questions.
- **Sequencing Evaluation**:
  - Logical progression from foundational network threats (`d1-s1`) to packet header anatomy (`d1-s2`), IP subnetting and stateful inspection (`d1-s3`), concluding with NGFW architecture (`d1-s4`).
- **Gaps Identified**:
  - *Minor*: Does not cover IPv6 link-local addresses (`fe80::/10`) which are frequently encountered in modern dual-stack networks.
  - *Mitigation*: Introduce IPv6 prefix and SLAAC distinction during Session 1.3 concept checks.

---

## 2. Day 2: Firewall Architecture & Administration

- **Current Status**: **MEDIUM RIGOR / LACKS STEP-BY-STEP HANDS-ON DEPTH**
- **Existing Topics**: Firewall architecture, deployment modes, security zones (LAN/WAN/DMZ), topology design, initial setup, static routing, ACLs.
- **Gaps Identified**:
  1. **Missing Step-by-Step CLI/GUI Walkthrough**: Sessions 2.2 and 2.3 discuss DMZ and interfaces, but students are not given exact VirtualBox adapter assignment or pfSense webConfigurator step instructions for adding a 3rd interface (`OPT1` for DMZ `192.168.100.1/24`).
  2. **Rule Shadowing in pfSense**: Day 1 has an interactive simulator for rule shadowing, but Day 2 lacks a hands-on pfSense lab where students intentionally create a shadowed rule in pfSense (`Block All Outbound` above `Allow HTTP`) to see pfSense's rule evaluation in real time.
  3. **Assessment Gap**: 0 dedicated questions exist for Day 2; students cannot test their mastery of routing tables and zone isolation.
  4. **Sequencing Issue**: Static routing is introduced before NAT. In realistic corporate topologies, NAT and routing are tightly coupled.

---

## 3. Day 3: Advanced Firewall & VPN Foundations

- **Current Status**: **THEORY-HEAVY / LACKS PRACTICAL APPLIED ENGINEERING**
- **Existing Topics**: Application control, URL filtering, NAT, inter-zone traffic, VPN fundamentals, IPsec, SSL/TLS, IKE.
- **Gaps Identified**:
  1. **NAT Engineering Deficit**: Outbound NAT is covered in the standard lab, but **Inbound Port Forwarding (DNAT)** is missing. In an enterprise, exposing a DMZ web server or mail server is a fundamental daily task.
  2. **VPN Cryptographic Confusion**: IKEv1 vs IKEv2 is discussed theoretically, but students need a concrete comparison table detailing Phase 1 (ISAKMP SA: encryption, hash, DH group, lifetime) vs Phase 2 (IPsec SA: ESP encryption, auth, PFS group).
  3. **No Packet Capture Analysis**: Students do not capture or inspect the IKE Main Mode vs Aggressive Mode packets or ESP packet headers using Wireshark/`tcpdump`.
  4. **Assessment Gap**: 0 dedicated assessment questions.

---

## 4. Day 4: VPN Deployment & Enterprise Security

- **Current Status**: **HIGH RISK / CRITICAL LAB GAP**
- **Existing Topics**: Site-to-Site IPsec, Remote Access VPN, user authentication, client connectivity, firewall hardening, backup/restore, capstone.
- **Gaps Identified**:
  1. **Remote Access VPN Execution Gap**: Lab 7 is described as "Simulate remote access VPN setup," but contains only a static checkbox UI. Setting up OpenVPN Server or WireGuard in pfSense, generating certificates, and connecting a client is a signature corporate skill that must have clear guided instructions.
  2. **Hardware Constraint Blocker**: Running two pfSense instances for a Site-to-Site IPsec VPN requires 4+ VMs locally, which crashes 8 GB student laptops.
  3. **Solution**: Split into **Mode A (WireGuard/OpenVPN single-host remote access on local VM)** and **Mode B (Instructor-provided pre-staged remote tunnel endpoint)**.
  4. **Backup/Restore Gap**: pfSense XML configuration backup and encrypted backup should be a mandatory hands-on exercise with an immediate disaster recovery test.

---

## 5. Day 5: Monitoring, Troubleshooting & Wireless Security

- **Current Status**: **INCOMPLETE PRACTICAL WORKFLOW**
- **Existing Topics**: Firewall monitoring, traffic analysis, session management, logs, troubleshooting sequence, wireless security, final exam.
- **Gaps Identified**:
  1. **Log Analysis Deficit**: Students are told to "read firewall logs," but the pfSense raw filterlog format (`rule, subrule, anchor, tracker, real-int, reason, action, dir, ip-ver...`) is not decoded or explained.
  2. **Suricata / Snort Absence**: IDS/IPS is mentioned in Day 1 and Day 5, but no practical exercise teaches students how to install the package, download rules, enable an interface, and trigger a test rule (`curl -A "malicious_user_agent"`).
  3. **Final Exam Gap**: Currently, the platform has only a generic 4-question programme quiz. The final exam must be a rigorous 40–50 question comprehensive examination testing all 5 days.

---

## 6. Day-Wise Curriculum Gap Summary Matrix

| Day | Instructional Content | Step-by-Step Hands-On Labs | Diagnostic Scenarios | Assessment Coverage | Overall Readiness |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Day 1** | **Complete** (48 concepts) | **Complete** (4 labs + pfSense baseline) | **Complete** (8-step tree) | **Complete** (360 questions) | **100% PRODUCTION READY** |
| **Day 2** | Needs 12 structured concepts | Needs pfSense DMZ + Rule Ordering Lab | Needs Routing & Zone Drop Diagnostics | Needs 40 questions (Bank + Session) | **40% (Needs Instructional Depth)** |
| **Day 3** | Needs 12 structured concepts | Needs Port Forwarding + IKE/IPsec Lab | Needs NAT & Asymmetric Drop Diagnostics | Needs 40 questions (Bank + Session) | **35% (Needs Applied Engineering)** |
| **Day 4** | Needs 12 structured concepts | Needs OpenVPN/WireGuard Practical Lab | Needs VPN Phase 1/2 Drop Diagnostics | Needs 40 questions (Bank + Session) | **30% (Critical Lab Gap)** |
| **Day 5** | Needs 12 structured concepts | Needs Packet Capture + Suricata + Backup Lab | Needs End-to-End Enterprise Triage | Needs Comprehensive Final Exam (50 Qs)| **35% (Needs Capstone Integration)** |
