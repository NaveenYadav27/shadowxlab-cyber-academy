# ShadowXLab Cyber Academy — Firewall & VPN Security Administration
# Phase 4: Day-Wise Recommendations & Harmonized Course Syllabus

This document outlines the authoritative recommendation to elevate the existing 5-day, 20-session programme to world-class enterprise competency standards without disrupting the frozen calendar dates (16–20 November 2026).

---

## Recommended 5-Day Instructional Architecture

### DAY 1: Security & Firewall Foundations (Mon 16 Nov)
- **Session 1.1 (`d1-s1`, 10:00–11:30)**: Enterprise Threat Landscape, Attack Surface Mapping, Reconnaissance & Port Scanning.
- **Session 1.2 (`d1-s2`, 11:45–13:00)**: **LAB 01 & 02**: Threat Profiling, OSI Layer Inspection & Stateless 5-Tuple Filtering.
- **Session 1.3 (`d1-s3`, 14:00–15:30)**: IPv4 Addressing, CIDR Subnet Calculations, TCP 3-Way Handshake & Stateful Connection Tables.
- **Session 1.4 (`d1-s4`, 15:45–17:00)**: **LAB 03 & 04**: Next-Generation Firewall (NGFW) Architecture, Deep Packet Inspection & Multi-Stage Security Pipeline.
- *Evening Milestone*: Pass Day 1 Final Exam (40 Questions) & Calibrate Hardware in Lab Readiness Center.

---

### DAY 2: Firewall Architecture, Interfaces & Security Zones (Tue 17 Nov)
- **Session 2.1 (`d2-s1`, 10:00–11:30)**: Firewall Deployment Topologies (Routed Mode vs Transparent Bridge), Security Zones (WAN, LAN, DMZ, Management) & Zone Boundary Control.
- **Session 2.2 (`d2-s2`, 11:45–13:00)**: **LAB 05**: Standard pfSense Installation, VirtualBox Host-Only/NAT NIC Mapping & Interface Assignment (WAN `10.0.2.15`, LAN `192.168.50.1`).
- **Session 2.3 (`d2-s3`, 14:00–15:30)**: **LAB 06**: Three-Zone Architecture Deployment — Adding `OPT1` (DMZ `192.168.100.1/24`), Static Routing & Inter-VLAN Gateway Concepts.
- **Session 2.4 (`d2-s4`, 15:45–17:00)**: **LAB 07**: Firewall Rule Engineering in pfSense — First-Match Evaluation, Default Deny Verification, Rule Shadowing Diagnostics & Anti-Spoofing.

---

### DAY 3: Advanced Traffic Management, NAT & VPN Foundations (Wed 18 Nov)
- **Session 3.1 (`d3-s1`, 10:00–11:30)**: NAT Engineering — Outbound PAT/MASQUERADE, Inbound Port Forwarding (DNAT), 1:1 NAT & Hairpin NAT Considerations.
- **Session 3.2 (`d3-s2`, 11:45–13:00)**: **LAB 08**: Web Services Publishing — Configuring Port Forwarding (WAN Port 80/443 -> DMZ Ubuntu Web Server `192.168.100.20`) & Testing Ingress/Egress Isolation.
- **Session 3.3 (`d3-s3`, 14:00–15:30)**: Cryptographic Foundations of VPNs — Symmetric vs Asymmetric Ciphers (AES-GCM, ChaCha20), Hashing (SHA-256), Diffie-Hellman Key Exchange (Groups 14, 19, 21) & Perfect Forward Secrecy.
- **Session 3.4 (`d3-s4`, 15:45–17:00)**: **LAB 09**: IPsec Protocol Architecture — IKEv1 vs IKEv2 Protocol Analysis, Phase 1 ISAKMP SA Parameters vs Phase 2 IPsec SA Child Security Associations.

---

### DAY 4: VPN Deployment, Remote Access & Enterprise Security (Thu 19 Nov)
- **Session 4.1 (`d4-s1`, 10:00–11:30)**: Site-to-Site IPsec VPN Architecture — Policy-Based vs Route-Based (VTI), Traffic Selectors, Dead Peer Detection (DPD) & NAT-Traversal (UDP 4500).
- **Session 4.2 (`d4-s2`, 11:45–13:00)**: **LAB 10**: Enterprise Remote Access VPN — Deploying OpenVPN / WireGuard on pfSense, Public Key Infrastructure (CA + Server/Client Certificates) & Client Configuration Export.
- **Session 4.3 (`d4-s3`, 14:00–15:30)**: **LAB 11**: Tunnel Routing & Access Policies — Split-Tunneling vs Full-Tunneling (`0.0.0.0/0`), DNS Leak Prevention & Intra-Tunnel Firewall Filtering.
- **Session 4.4 (`d4-s4`, 15:45–17:00)**: **LAB 12**: Firewall Hardening, Configuration Management, Encrypted XML Backup, Automated Rollback & Disaster Recovery.

---

### DAY 5: Monitoring, Deep Troubleshooting & Security Capstone (Fri 20 Nov)
- **Session 5.1 (`d5-s1`, 10:00–11:30)**: Security Monitoring — Decoding pfSense `filterlog`, Remote Syslog Export to SIEM, Session Table Inspection (`pftop`, `pfctl -ss`) & Top Talkers.
- **Session 5.2 (`d5-s2`, 11:45–13:00)**: **LAB 13**: Packet Capture Engineering — Live Captures via pfSense GUI and `tcpdump`, BPF Filter Syntax, Wireshark Protocol Decryption & Handshake Verification.
- **Session 5.3 (`d5-s3`, 14:00–15:30)**: **LAB 14**: Network Intrusion Prevention — Deploying Suricata/Snort on pfSense, Rule Category Management, Triggering Test Alerts & Blocking Malicious Traffic.
- **Session 5.4 (`d5-s4`, 15:45–17:00)**: **CAPSTONE LAB & FINAL COMPREHENSIVE EXAM**: End-to-End Enterprise Scenario (Multi-Zone Policy, NAT, VPN Tunnel, Troubleshooting Broken Config) + 50-Question Final Certification Assessment.
