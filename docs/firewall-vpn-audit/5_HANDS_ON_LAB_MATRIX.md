# ShadowXLab Cyber Academy — Firewall & VPN Security Administration
# Phase 5 & 6: Comprehensive Hands-On Lab Matrix

This master matrix specifies the 22 practical engineering labs required for an enterprise-ready firewall and VPN administrator.

---

## Master Lab Specifications

| Lab ID | Title | Day / Session | Primary Competency | Required VMs | Network Architecture | Est. Time | Verification Evidence Required |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **LAB 01** | Network Discovery & Asset Inventory | Day 1 / S1.2 | Nmap scanning, OS detection, port profiling | Kali Linux | VirtualBox Internal Network | 45 min | Nmap `-sS -sV -O` terminal output log |
| **LAB 02** | 5-Tuple Stateless Rule Filtering | Day 1 / S1.2 | L3/L4 filtering, rule ordering, default deny | Web Engine / Kali | Simulated Packet Pipeline | 45 min | Validated policy test matrix (100% score) |
| **LAB 03** | Subnet Isolation & Stateful Handshake | Day 1 / S1.4 | TCP state transitions, state table creation | Web Engine / Linux | Dual-Subnet Bridge | 45 min | State table dump showing `ESTABLISHED:ESTABLISHED` |
| **LAB 04** | NGFW Security Policy Pipeline | Day 1 / S1.4 | DPI, App-ID, TLS decrypt, Threat inspection | Web Engine / Linux | NGFW Multi-Stage Filter | 45 min | Rule pipeline logs with application payload match |
| **LAB 05** | pfSense Interface Setup & DHCP | Day 2 / S2.2 | Hypervisor NIC mapping, console assignment | pfSense + Kali | WAN NAT + LAN (`SXL-LAN`) | 60 min | `ip a show eth0` output in range `192.168.50.100–200` |
| **LAB 06** | Three-Zone Topology (WAN/LAN/DMZ) | Day 2 / S2.3 | Interface creation (`OPT1`), static routing | pfSense + Kali + Ubuntu | WAN + LAN + DMZ (`192.168.100.0/24`) | 60 min | pfSense interface summary showing WAN, LAN, DMZ up |
| **LAB 07** | pfSense Rule Engineering & Anti-Spoof | Day 2 / S2.4 | First-match evaluation, rule shadowing test | pfSense + Kali + Ubuntu | Multi-Zone Broadcast Domains | 60 min | Firewall log evidence showing dropped blocked packets |
| **LAB 08** | Inbound Port Forwarding (DNAT) | Day 3 / S3.2 | Exposing DMZ Web Server via WAN port | pfSense + Kali + Ubuntu | WAN NAT -> DMZ Web (`192.168.100.20:80`) | 60 min | `curl -I http://10.0.2.15:80` returning HTTP 200 OK |
| **LAB 09** | Outbound PAT & Egress Restrictions | Day 3 / S3.2 | Automatic Outbound NAT, port restrictions | pfSense + Kali | LAN -> WAN NAT Egress | 45 min | Ping to `8.8.8.8` passing, unauthorized port blocked |
| **LAB 10** | Cryptographic Parameter Validation | Day 3 / S3.4 | Cipher suites, DH groups, IKE negotiation | Kali + Linux Host | Cryptographic Suite Analysis | 45 min | OpenSSL / strongSwan cryptographic benchmark log |
| **LAB 11** | Site-to-Site IPsec Tunnel Setup | Day 4 / S4.1 | Phase 1 ISAKMP, Phase 2 IPsec SA, VTI | pfSense + Remote Endpoint | Encrypted Tunnel across simulated WAN | 75 min | `ipsec statusall` or pfSense status showing `ESTABLISHED` |
| **LAB 12** | OpenVPN Server & Certificate Authority | Day 4 / S4.2 | PKI, User Certificates, Client Export | pfSense + Kali Client | OpenVPN UDP 1194 Server | 75 min | Active OpenVPN client interface (`tun0`) with IP lease |
| **LAB 13** | WireGuard Peer Configuration | Day 4 / S4.3 | Modern public-key crypto, peer endpoints | pfSense + Kali Client | WireGuard UDP 51820 | 60 min | `wg show` output showing latest handshake < 2 minutes |
| **LAB 14** | Split Tunneling & DNS Leak Prevention | Day 4 / S4.3 | Routing table overrides, DNS hijacking fix | pfSense + Kali Client | VPN Split vs Full Tunnel | 45 min | `ip route show` verifying corporate routes via `tun0` |
| **LAB 15** | Firewall Hardening & Encrypted Backup | Day 4 / S4.4 | Admin protection, HTTPS cert, XML backup | pfSense | Management Network | 45 min | Downloaded encrypted `config-backup.xml` verification |
| **LAB 16** | Disaster Recovery & Configuration Restore| Day 4 / S4.4 | Clean install restoration, interface remap | pfSense | Recovery Console | 45 min | Successful restore without network service disruption |
| **LAB 17** | Firewall Log Decoding & Analysis | Day 5 / S5.1 | Raw `filterlog` parsing, rule ID correlation | pfSense + Syslog | Syslog Export | 45 min | Parsed log report isolating top 5 blocked IP sources |
| **LAB 18** | Live Packet Capture & Wireshark Triage | Day 5 / S5.2 | `tcpdump` filters, PCAP export, dissection | pfSense + Kali Wireshark | Ingress/Egress packet traces | 60 min | Saved `.pcap` file demonstrating 3-way handshake |
| **LAB 19** | Suricata IDS/IPS Deployment & Rules | Day 5 / S5.3 | Signature updates, alert generation, blocking | pfSense + Suricata + Kali | Inline IPS Inspection | 60 min | Suricata alert tab showing triggered test rule ID |
| **LAB 20** | Diagnostic Decision Tree Troubleshooting | Day 5 / S5.3 | Methodical triage of broken firewall config | pfSense + Kali Client | Break-Fix Environment | 60 min | Remediation log restoring end-to-end connectivity |
| **LAB 21** | High Availability (CARP/pfsync) Setup | Day 5 / S5.4 | Virtual IPs, state sync, heartbeat failure | Dual pfSense / Range | HA Cluster Architecture | 60 min | CARP status showing Master/Backup and synced states |
| **LAB 22** | Enterprise Security Policy Capstone | Day 5 / S5.4 | Complete multi-zone, NAT, VPN, IPS build | Full Range Deployment | Corporate Multi-Tier Network | 90 min | Comprehensive evidence packet & rubric signoff |
