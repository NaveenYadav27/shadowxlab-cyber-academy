# ShadowXLab Cyber Academy — Firewall & VPN Security Administration
# Phase 7: Hardware-Aware Lab Modes & Technical Requirements

To accommodate corporate trainees with diverse laptop hardware, ShadowXLab enforces a 3-tier execution model. Every lab clearly declares supported modes.

---

## 1. Execution Tiers & Hardware Boundaries

### Mode A: Full Local Virtual Lab
- **Target Audience**: Trainees on corporate workstations with 16 GB+ RAM and full administrative control.
- **Topology**: Runs pfSense (1 GB), Kali Linux (4 GB), and Ubuntu Server (2 GB) concurrently in Oracle VirtualBox.
- **Minimum Requirements**: 16 GB RAM, 4 CPU Cores, 60 GB Free SSD, VT-x / AMD-V virtualization enabled in BIOS.
- **Execution Reality**: Real kernel packet filtering, real FreeBSD PF state tables, real raw packet captures with Wireshark.

### Mode B: Lightweight Local Lab
- **Target Audience**: Trainees on standard 8–12 GB laptops where running 3 GUI VMs causes memory swapping and UI freezes.
- **Topology**: Runs pfSense (768 MB) and a lightweight headless Linux client (512 MB Alpine or minimal Ubuntu server). Leaves 6+ GB for host OS.
- **Minimum Requirements**: 8 GB RAM, 2 CPU Cores, 25 GB Free Disk, VT-x enabled.
- **Execution Reality**: Real pfSense firewall rules, real CLI testing (`curl`, `ping`, `nmap`), 100% genuine packet forwarding without desktop UI lag.

### Mode C: Shared Enterprise Cyber Range
- **Target Audience**: Trainees with 4–6 GB RAM, locked corporate laptops where VirtualBox cannot be installed, or disabled BIOS virtualization.
- **Topology**: Trainees connect via secure WireGuard VPN or HTTPS browser terminal (Apache Guacamole) to a dedicated multi-tenant pfSense instance on instructor infrastructure.
- **Minimum Requirements**: 4 GB RAM, Web Browser (Chrome/Firefox/Edge), Internet connectivity.
- **Execution Reality**: Interacts with real pfSense webConfigurator and live virtual machines hosted centrally.

### Mode D: Guided Deterministic In-Browser Simulation
- **Target Audience**: Offline trainees, review sessions, or emergency fallback when hypervisors fail.
- **Topology**: Runs inside ShadowXLab's React-based client-side packet traversal engine.
- **Minimum Requirements**: 2 GB RAM, Any modern web browser.
- **Notice**: Must clearly display "Interactive Software Simulation" banner. Never falsely claimed as real packet forwarding.

---

## 2. Lab Mode Declaration Matrix

| Lab ID | Lab Name | Mode A (Full Local) | Mode B (Lightweight) | Mode C (Shared Range) | Mode D (Simulation) | Requires Admin/Root | Real Packet Forwarding |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **LAB 01** | Asset Discovery & Nmap | YES | YES | YES | YES | NO | YES |
| **LAB 02** | 5-Tuple Stateless Filtering | YES | YES | YES | YES (Engine) | NO | YES |
| **LAB 03** | Stateful TCP Inspection | YES | YES | YES | YES (Engine) | NO | YES |
| **LAB 04** | NGFW Security Pipeline | YES | YES | YES | YES (Engine) | NO | YES |
| **LAB 05** | pfSense Base Setup & DHCP | YES | YES | YES | NO (Requires VM) | YES (VBox) | YES |
| **LAB 06** | 3-Zone Architecture (DMZ) | YES | YES | YES | NO (Requires VM) | YES (VBox) | YES |
| **LAB 07** | Rule Shadowing in pfSense | YES | YES | YES | YES (Engine) | NO | YES |
| **LAB 08** | Inbound Port Forwarding | YES | YES | YES | NO (Requires VM) | NO | YES |
| **LAB 09** | Outbound PAT / NAT | YES | YES | YES | YES (Engine) | NO | YES |
| **LAB 10** | Cryptographic Suite Bench | YES | YES | YES | YES | NO | NO |
| **LAB 11** | Site-to-Site IPsec VPN | YES (Dual VM) | NO | YES (Shared) | NO (Complex) | YES | YES |
| **LAB 12** | OpenVPN Server & PKI | YES | YES | YES | NO (Requires PKI)| YES | YES |
| **LAB 13** | WireGuard Peer Setup | YES | YES | YES | NO (Kernel module)| YES | YES |
| **LAB 14** | Split Tunnel & DNS Leak | YES | YES | YES | NO | YES | YES |
| **LAB 15** | Encrypted XML Backup | YES | YES | YES | NO | NO | NO |
| **LAB 16** | Disaster Recovery Restore | YES | YES | YES | NO | YES | NO |
| **LAB 17** | Filterlog Decoding & Syslog | YES | YES | YES | YES (Viewer) | NO | YES |
| **LAB 18** | Packet Capture & Wireshark| YES | YES | YES | NO (Requires PCAP)| NO | YES |
| **LAB 19** | Suricata IDS/IPS Rules | YES | NO (RAM heavy) | YES (Shared Range)| NO | YES | YES |
| **LAB 20** | Diagnostic Break-Fix Triage | YES | YES | YES | YES (Decision Tree)| NO | YES |
| **LAB 21** | High Availability CARP | NO (RAM heavy)| NO | YES (Dedicated) | YES (Simulated) | YES | YES |
| **LAB 22** | Enterprise Capstone | YES | YES | YES | NO | YES | YES |
