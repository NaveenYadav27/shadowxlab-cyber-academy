# ShadowXLab Cyber Academy — Firewall & VPN Security Administration
# Phase 6: Enterprise Lab Architecture & Network Topology

This document details the standardized network engineering architecture used across the ShadowXLab practical laboratories.

---

## 1. Master Network Topology Diagram

```
                             [ Upstream Internet ]
                                      │
                                      ▼ (VirtualBox NAT Engine)
                              ┌──────────────┐
                              │ WAN Interface│ IP: 10.0.2.15/24
                              │ (vtnet0/em0) │ Gateway: 10.0.2.2
                              └──────┬───────┘
                                     │
                     ┌───────────────┴───────────────┐
                     │   ShadowXLab pfSense 2.7.x    │
                     │   Enterprise Firewall Core    │
                     │  webConfigurator: 192.168.50.1│
                     └───────┬───────────────┬───────┘
                             │               │
     ┌───────────────────────┘               └───────────────────────┐
     │                                                               │
     ▼ (Internal Net: SXL-LAN)                                       ▼ (Internal Net: SXL-DMZ)
┌─────────────────────────┐                                     ┌─────────────────────────┐
│      LAN Interface      │ IP: 192.168.50.1/24                 │      DMZ Interface      │ IP: 192.168.100.1/24
│      (vtnet1/em1)       │ DHCP: .100 - .200                   │      (vtnet2/em2)       │ Static Subnet
└────────────┬────────────┘                                     └────────────┬────────────┘
             │                                                               │
     ┌───────┴───────┐                                                       │
     │               │                                                       ▼
     ▼               ▼                                            ┌─────────────────────┐
┌───────────┐ ┌───────────┐                                       │   SXL-Ubuntu Web    │
│ SXL-Kali  │ │ SXL-Win10 │                                       │ Database / Services │
│Workstation│ │(Optional) │                                       │  192.168.100.20/24  │
│192.168.50.│ │192.168.50.│                                       │   Gateway: .100.1   │
│10x (DHCP) │ │15x (DHCP) │                                       └─────────────────────┘
└───────────┘ └───────────┘
```

---

## 2. Interface & Addressing Specifications

| Node / Interface | Adapter Mode | Name / Driver | Assigned IP / Mask | Default Gateway | DNS Resolver | Role |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **pfSense WAN** | VirtualBox NAT | `vtnet0` or `em0` | `10.0.2.15/24` (DHCP) | `10.0.2.2` | Upstream (Host) | Simulates Public Internet Egress |
| **pfSense LAN** | Internal Network | `SXL-LAN` (`vtnet1` / `em1`) | `192.168.50.1/24` | Self (`192.168.50.1`) | `192.168.50.1` (Unbound) | Primary Trusted Corporate Network |
| **pfSense DMZ** | Internal Network | `SXL-DMZ` (`vtnet2` / `em2`) | `192.168.100.1/24` | Self (`192.168.100.1`) | `192.168.100.1` | Semi-trusted public services zone |
| **SXL-Kali** | Internal Network | `SXL-LAN` (`eth0`) | `192.168.50.10x/24` (DHCP) | `192.168.50.1` | `192.168.50.1` | Security Analyst / Testing Client |
| **SXL-Ubuntu** | Internal Network | `SXL-DMZ` (`enp0s3`) | `192.168.100.20/24` (Static) | `192.168.100.1` | `1.1.1.1` | Enterprise Application Server |
| **OpenVPN Tunnel** | Virtual Tunnel | `tun0` | `10.0.8.0/24` | `10.0.8.1` | `192.168.50.1` | Remote Worker Ingress |
| **WireGuard** | Modern Tunnel | `tun_wg0` | `10.0.9.0/24` | `10.0.9.1` | `192.168.50.1` | Mobile / Branch Tunneling |

---

## 3. Critical VirtualBox Hypervisor Rules

1. **Exact Name Match**:
   - Internal network names in VirtualBox are **case-sensitive strings**.
   - Kali's Adapter 1 MUST be named exactly `SXL-LAN`.
   - pfSense Adapter 2 MUST be named exactly `SXL-LAN`.
   - If a student types `sxl-lan` or `SXL_LAN`, VirtualBox silently places the VM on an isolated disconnected wire with 0 DHCP leases.

2. **Promiscuous Mode**:
   - Set **Promiscuous Mode: Allow All** or **Allow VMs** on all Internal Network adapters to allow packet captures and ARP queries to traverse cleanly.

3. **MAC Address Integrity**:
   - Ensure cloned VMs generate a new MAC address to prevent DHCP collision in the pfSense lease table.
