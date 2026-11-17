import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Shield,
  Server,
  Laptop,
  Network,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  Terminal,
  FileCode,
  Radio,
  Globe,
  Database,
  Lock,
  Unlock,
  Info,
  Clock,
  Cpu,
  Sliders,
  Check,
  Send,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

/* =========================================================================
   TYPES & DATA MODELS
   ========================================================================= */

export type DeviceId =
  | "workstation"
  | "switch"
  | "router"
  | "firewall"
  | "dns"
  | "server"
  | "internet";

export interface NetworkDevice {
  id: DeviceId;
  name: string;
  role: string;
  os: string;
  ip: string;
  subnet: string;
  gateway?: string;
  interfaceName: string;
  mac: string;
  status: "ONLINE" | "FORWARDING" | "FILTERING" | "STANDBY";
  x: number; // percentage in diagram
  y: number;
}

export interface PacketDetails {
  sourceIp: string;
  destIp: string;
  sourcePort: number;
  destPort: number;
  protocol: "UDP" | "TCP" | "ARP" | "ICMP";
  packetType: string;
  networkInterface: string;
  currentNetworkStage: string;
  firewallDecision: "PERMIT" | "BLOCK" | "STATE_TRACKED" | "EVALUATING" | "BYPASS_L2";
  connectionState: "NONE" | "SYN_SENT" | "SYN_RECEIVED" | "ESTABLISHED" | "BLOCKED" | "CLOSED";
  tcpFlags?: string;
  seqNumber?: number;
  ackNumber?: number;
  payloadSummary: string;
  rawHeaderDump: string;
}

export interface SimulationStep {
  stepNumber: number;
  id: string;
  title: string;
  description: string;
  fromDevice: DeviceId;
  toDevice: DeviceId;
  packet: PacketDetails;
  firewallLog?: string;
  stateTableEntry?: {
    tuple: string;
    state: string;
    ttl: number;
  };
  isBlockedDrop?: boolean;
}

export interface FirewallRule {
  id: string;
  ruleNumber: number;
  name: string;
  action: "PASS" | "BLOCK";
  interface: string;
  source: string;
  destination: string;
  port: number;
  protocol: "TCP" | "UDP" | "ANY";
  description: string;
  matchCount: number;
}

/* =========================================================================
   STATIC TOPOLOGY DEFINITIONS
   ========================================================================= */

const TOPOLOGY_DEVICES: Record<DeviceId, NetworkDevice> = {
  workstation: {
    id: "workstation",
    name: "Client Workstation",
    role: "Government Employee PC (Finance/Records)",
    os: "Windows 11 Enterprise 23H2",
    ip: "10.50.10.25",
    subnet: "10.50.10.0/24 (VLAN 10)",
    gateway: "10.50.10.1",
    interfaceName: "Ethernet 1 (eth0)",
    mac: "00:50:56:a1:b2:c3",
    status: "ONLINE",
    x: 8,
    y: 35,
  },
  switch: {
    id: "switch",
    name: "Internal Core Switch",
    role: "Department Access & Aggregation Switch",
    os: "Enterprise L2 Managed Switch",
    ip: "10.50.10.2",
    subnet: "10.50.10.0/24 (VLAN 10)",
    interfaceName: "Gi1/0/12 (Access) / Gi1/0/1 (Trunk)",
    mac: "00:50:56:ee:10:02",
    status: "FORWARDING",
    x: 24,
    y: 35,
  },
  router: {
    id: "router",
    name: "Default Gateway Router",
    role: "L3 Inter-VLAN Transit Router",
    os: "VyOS / EdgeOS Router",
    ip: "10.50.10.1 (LAN) / 10.50.0.1 (Transit)",
    subnet: "10.50.10.0/24 ↔ 10.50.0.0/30",
    interfaceName: "ge-0/0/0.10 (LAN) & ge-0/0/1 (Transit)",
    mac: "00:50:56:fe:ed:01",
    status: "ONLINE",
    x: 40,
    y: 35,
  },
  firewall: {
    id: "firewall",
    name: "pfSense Security Gateway",
    role: "Perimeter & Zone Stateful Firewall",
    os: "pfSense 2.7.2-RELEASE (FreeBSD 14)",
    ip: "10.50.0.2 (LAN-In) / 10.50.40.1 (DMZ) / 10.50.1.1 (DNS)",
    subnet: "Multi-Zone Segmentation Gateway",
    interfaceName: "vtnet1 (LAN-Transit), vtnet2 (DMZ), vtnet3 (Services)",
    mac: "00:0c:29:ff:00:01",
    status: "FILTERING",
    x: 58,
    y: 35,
  },
  dns: {
    id: "dns",
    name: "Internal DNS Resolver",
    role: "Core Domain Resolution Service",
    os: "BIND 9.18 on Ubuntu 22.04 LTS",
    ip: "10.50.1.10",
    subnet: "10.50.1.0/24 (VLAN 50 Services)",
    gateway: "10.50.1.1",
    interfaceName: "ens192",
    mac: "00:0c:29:44:55:66",
    status: "ONLINE",
    x: 58,
    y: 75,
  },
  server: {
    id: "server",
    name: "Ubuntu App Server",
    role: "Public Licensing & Records Portal (DMZ)",
    os: "Ubuntu 22.04.4 LTS (Nginx + OpenSSH)",
    ip: "10.50.40.10",
    subnet: "10.50.40.0/24 (VLAN 40 DMZ)",
    gateway: "10.50.40.1",
    interfaceName: "ens160",
    mac: "00:0c:29:aa:bb:cc",
    status: "ONLINE",
    x: 82,
    y: 35,
  },
  internet: {
    id: "internet",
    name: "Internet WAN Gateway",
    role: "External Perimeter Uplink / BGP ISP",
    os: "Carrier Gateway",
    ip: "198.51.100.1",
    subnet: "198.51.100.0/29 (WAN Transit)",
    interfaceName: "vtnet0 (WAN)",
    mac: "00:1b:21:99:88:77",
    status: "STANDBY",
    x: 58,
    y: 5,
  },
};

/* =========================================================================
   SIMULATION ENGINE BUILDER
   ========================================================================= */

function generateSimulationSteps(
  trafficType: "https" | "ssh",
  httpsPolicy: "PASS" | "BLOCK",
  sshPolicy: "PASS" | "BLOCK"
): SimulationStep[] {
  const isHttps = trafficType === "https";
  const targetPort = isHttps ? 443 : 22;
  const targetApp = isHttps ? "HTTPS Web Service" : "SSH Management";
  const activePolicy = isHttps ? httpsPolicy : sshPolicy;
  const isPolicyPermit = activePolicy === "PASS";

  const clientIp = "10.50.10.25";
  const clientPort = isHttps ? 54320 : 51228;
  const serverIp = "10.50.40.10";
  const dnsIp = "10.50.1.10";
  const gatewayIp = "10.50.10.1";

  const steps: SimulationStep[] = [];

  // STAGE 1: DNS Query
  steps.push({
    stepNumber: 1,
    id: "step-01-dns-query",
    title: "Stage 1: DNS Query for portal.nplra.gov.local",
    description: `Workstation initiates name resolution for 'portal.nplra.gov.local'. It sends a UDP DNS query to configured resolver ${dnsIp}:53 via the default gateway and firewall.`,
    fromDevice: "workstation",
    toDevice: "dns",
    packet: {
      sourceIp: clientIp,
      destIp: dnsIp,
      sourcePort: 52410,
      destPort: 53,
      protocol: "UDP",
      packetType: "Standard DNS Query (A)",
      networkInterface: "eth0 → Gi1/0/12 → vtnet1 → vtnet3",
      currentNetworkStage: "1. DNS Name Resolution (Outbound)",
      firewallDecision: "PERMIT",
      connectionState: "NONE",
      payloadSummary: "Question: portal.nplra.gov.local IN A (ID: 0x4f12)",
      rawHeaderDump: `[Ethernet II: 00:50:56:a1:b2:c3 → 00:50:56:fe:ed:01]\n[IPv4: src=${clientIp}, dst=${dnsIp}, proto=UDP(17), len=68, ttl=128]\n[UDP: src=52410, dst=53, len=48, chksum=0x8a1b]\n[DNS: Flags=0x0100 (Standard query), Queries=1, Answers=0]`,
    },
    firewallLog: `filterlog[4102]: 5,,,1000000050,vtnet1,match,pass,in,4,0x0,,128,4912,0,none,17,udp,68,${clientIp},${dnsIp},52410,53,48`,
    stateTableEntry: {
      tuple: `udp ${clientIp}:52410 ↔ ${dnsIp}:53`,
      state: "MULTIPLE:MULTIPLE",
      ttl: 30,
    },
  });

  // STAGE 2: DNS Response
  steps.push({
    stepNumber: 2,
    id: "step-02-dns-response",
    title: "Stage 2: DNS Response Received",
    description: `Internal DNS resolver answers with IPv4 address ${serverIp}. The return packet matches the existing UDP state table entry on the firewall and returns to the workstation.`,
    fromDevice: "dns",
    toDevice: "workstation",
    packet: {
      sourceIp: dnsIp,
      destIp: clientIp,
      sourcePort: 53,
      destPort: 52410,
      protocol: "UDP",
      packetType: "Standard DNS Response (A)",
      networkInterface: "vtnet3 → vtnet1 → ge-0/0/0.10 → eth0",
      currentNetworkStage: "2. DNS Name Resolution (Inbound Return)",
      firewallDecision: "STATE_TRACKED",
      connectionState: "NONE",
      payloadSummary: `Answer: portal.nplra.gov.local = ${serverIp} (TTL: 300s)`,
      rawHeaderDump: `[Ethernet II: 00:0c:29:ff:00:01 → 00:50:56:a1:b2:c3]\n[IPv4: src=${dnsIp}, dst=${clientIp}, proto=UDP(17), len=84, ttl=63]\n[UDP: src=53, dst=52410, len=64, chksum=0x92f0]\n[DNS: Flags=0x8180 (Standard response, No error), Answers=1: 10.50.40.10]`,
    },
    firewallLog: `filterlog[4102]: state match for udp ${dnsIp}:53 → ${clientIp}:52410, age=0s, state closed`,
  });

  // STAGE 3: ARP Resolution
  steps.push({
    stepNumber: 3,
    id: "step-03-arp-resolution",
    title: "Stage 3: Layer 2 ARP Resolution for Gateway",
    description: `Workstation recognizes ${serverIp} is in a different subnet (10.50.40.0/24 vs 10.50.10.0/24). It checks its ARP table for default gateway ${gatewayIp} and resolves MAC 00:50:56:fe:ed:01.`,
    fromDevice: "workstation",
    toDevice: "router",
    packet: {
      sourceIp: clientIp,
      destIp: gatewayIp,
      sourcePort: 0,
      destPort: 0,
      protocol: "ARP",
      packetType: "ARP Reply (Cache Validated)",
      networkInterface: "eth0 ↔ Gi1/0/12 (VLAN 10)",
      currentNetworkStage: "3. ARP Gateway Resolution (L2)",
      firewallDecision: "BYPASS_L2",
      connectionState: "NONE",
      payloadSummary: `Sender MAC: 00:50:56:fe:ed:01, Sender IP: ${gatewayIp} (Target: ${clientIp})`,
      rawHeaderDump: `[Ethernet II: Broadcast ff:ff:ff:ff:ff:ff → 00:50:56:fe:ed:01]\n[ARP: Hardware=Ethernet(1), Protocol=IPv4(0x0800), Opcode=Reply(2)]\n[ARP Payload: 10.50.10.1 is at 00:50:56:fe:ed:01]`,
    },
  });

  // STAGE 4: TCP SYN (Connection Initiation & Firewall Evaluation)
  if (isPolicyPermit) {
    // Permitted SYN
    steps.push({
      stepNumber: 4,
      id: "step-04-tcp-syn-pass",
      title: `Stage 4: TCP SYN — Firewall Evaluates Rule & Creates State`,
      description: `Workstation sends TCP [SYN] to ${serverIp}:${targetPort}. The packet arrives at pfSense interface vtnet1. Rule #101/102 allows traffic: state table entry is instantiated!`,
      fromDevice: "workstation",
      toDevice: "firewall",
      packet: {
        sourceIp: clientIp,
        destIp: serverIp,
        sourcePort: clientPort,
        destPort: targetPort,
        protocol: "TCP",
        packetType: "TCP Connection Request [SYN]",
        networkInterface: "eth0 → Switch → Router → Firewall (vtnet1)",
        currentNetworkStage: "4. TCP Handshake Initiation [SYN]",
        firewallDecision: "PERMIT",
        connectionState: "SYN_SENT",
        tcpFlags: "[SYN]",
        seqNumber: 1000,
        ackNumber: 0,
        payloadSummary: `TCP SYN Seq=1000 Win=65535 MSS=1460 SACK_PERM (${targetApp})`,
        rawHeaderDump: `[IPv4: src=${clientIp}, dst=${serverIp}, proto=TCP(6), len=60, ttl=64]\n[TCP: sport=${clientPort}, dport=${targetPort}, seq=1000, ack=0, flags=[SYN], win=65535, mss=1460]\n[Firewall Action: PASS Rule #${isHttps ? "101" : "102"} (vtnet1)]`,
      },
      firewallLog: `filterlog[82110]: 5,,,100000010${isHttps ? "1" : "2"},vtnet1,match,pass,in,4,0x0,,64,12001,0,DF,6,tcp,60,${clientIp},${serverIp},${clientPort},${targetPort},0,S,1000,,65535,,mss;sackOK;TS`,
      stateTableEntry: {
        tuple: `tcp ${clientIp}:${clientPort} ↔ ${serverIp}:${targetPort}`,
        state: "SYN_SENT:CLOSED",
        ttl: 30,
      },
    });

    // STAGE 5: TCP SYN-ACK
    steps.push({
      stepNumber: 5,
      id: "step-05-tcp-synack",
      title: `Stage 5: TCP SYN-ACK — Server Accepts & State Transitions`,
      description: `Ubuntu App Server accepts the connection and responds with TCP [SYN, ACK]. pfSense verifies the reversed tuple matches the existing state table entry and forwards without re-evaluating static rules.`,
      fromDevice: "server",
      toDevice: "firewall",
      packet: {
        sourceIp: serverIp,
        destIp: clientIp,
        sourcePort: targetPort,
        destPort: clientPort,
        protocol: "TCP",
        packetType: "TCP Handshake Response [SYN, ACK]",
        networkInterface: "ens160 → Firewall (vtnet2 DMZ)",
        currentNetworkStage: "5. TCP Handshake Response [SYN, ACK]",
        firewallDecision: "STATE_TRACKED",
        connectionState: "SYN_RECEIVED",
        tcpFlags: "[SYN, ACK]",
        seqNumber: 5000,
        ackNumber: 1001,
        payloadSummary: `TCP SYN-ACK Seq=5000 Ack=1001 Win=65160 MSS=1460`,
        rawHeaderDump: `[IPv4: src=${serverIp}, dst=${clientIp}, proto=TCP(6), len=60, ttl=64]\n[TCP: sport=${targetPort}, dport=${clientPort}, seq=5000, ack=1001, flags=[SYN, ACK], win=65160]\n[State Lookup: FOUND entry 'tcp ${clientIp}:${clientPort} ↔ ${serverIp}:${targetPort}' → SYN_RECEIVED]`,
      },
      firewallLog: `filterlog[82110]: state match: inbound on vtnet2 matches existing state. Transitioned to SYN_RECEIVED:SYN_SENT.`,
      stateTableEntry: {
        tuple: `tcp ${clientIp}:${clientPort} ↔ ${serverIp}:${targetPort}`,
        state: "SYN_RECEIVED:SYN_SENT",
        ttl: 60,
      },
    });

    // STAGE 6: TCP ACK
    steps.push({
      stepNumber: 6,
      id: "step-06-tcp-ack",
      title: "Stage 6: TCP ACK — Handshake Complete & State ESTABLISHED",
      description: `Workstation returns final TCP [ACK]. 3-way handshake is officially complete. Firewall state transitions to ESTABLISHED and session timeout extends to 3600 seconds.`,
      fromDevice: "workstation",
      toDevice: "server",
      packet: {
        sourceIp: clientIp,
        destIp: serverIp,
        sourcePort: clientPort,
        destPort: targetPort,
        protocol: "TCP",
        packetType: "TCP Handshake Complete [ACK]",
        networkInterface: "eth0 → Switch → Router → Firewall → Server",
        currentNetworkStage: "6. TCP Handshake Complete [ACK]",
        firewallDecision: "STATE_TRACKED",
        connectionState: "ESTABLISHED",
        tcpFlags: "[ACK]",
        seqNumber: 1001,
        ackNumber: 5001,
        payloadSummary: "TCP ACK Seq=1001 Ack=5001 Win=65535 (Handshake Finished)",
        rawHeaderDump: `[IPv4: src=${clientIp}, dst=${serverIp}, proto=TCP(6), len=52, ttl=64]\n[TCP: sport=${clientPort}, dport=${targetPort}, seq=1001, ack=5001, flags=[ACK], win=65535]\n[State Table: Status set to ESTABLISHED:ESTABLISHED. TTL=3600s]`,
      },
      firewallLog: `filterlog[82110]: connection state established for ${clientIp}:${clientPort} <-> ${serverIp}:${targetPort}, window scaling verified.`,
      stateTableEntry: {
        tuple: `tcp ${clientIp}:${clientPort} ↔ ${serverIp}:${targetPort}`,
        state: "ESTABLISHED:ESTABLISHED",
        ttl: 3600,
      },
    });

    // STAGE 7: Application Request
    steps.push({
      stepNumber: 7,
      id: "step-07-app-request",
      title: `Stage 7: Application Payload Request (${isHttps ? "TLS Client Hello" : "SSH Protocol Exchange"})`,
      description: isHttps
        ? `Workstation transmits TLS 1.3 Client Hello requesting portal.nplra.gov.local over HTTPS.`
        : `Workstation transmits SSH identification string: SSH-2.0-OpenSSH_9.0.`,
      fromDevice: "workstation",
      toDevice: "server",
      packet: {
        sourceIp: clientIp,
        destIp: serverIp,
        sourcePort: clientPort,
        destPort: targetPort,
        protocol: "TCP",
        packetType: isHttps ? "TLS 1.3 Client Hello (HTTPS)" : "SSH Protocol Identification",
        networkInterface: "eth0 → Firewall → Server (ens160)",
        currentNetworkStage: "7. Application Request / TLS Negotiation",
        firewallDecision: "STATE_TRACKED",
        connectionState: "ESTABLISHED",
        tcpFlags: "[PSH, ACK]",
        seqNumber: 1001,
        ackNumber: 5001,
        payloadSummary: isHttps
          ? "TLS Record: Handshake (Client Hello, SNI: portal.nplra.gov.local, Len=512)"
          : "SSH Payload: SSH-2.0-OpenSSH_9.0 Windows_x64 (Len=32)",
        rawHeaderDump: `[TCP: sport=${clientPort}, dport=${targetPort}, flags=[PSH, ACK], len=${isHttps ? 512 : 32}]\n[Application Payload: ${isHttps ? "TLSv1.3 Client Hello (SNI: portal.nplra.gov.local)" : "SSH-2.0-OpenSSH_9.0"}]`,
      },
      firewallLog: `filterlog[82110]: state lookup hit: ${isHttps ? 512 : 32} bytes forwarded on established state table flow.`,
      stateTableEntry: {
        tuple: `tcp ${clientIp}:${clientPort} ↔ ${serverIp}:${targetPort}`,
        state: "ESTABLISHED:ESTABLISHED",
        ttl: 3600,
      },
    });

    // STAGE 8: Firewall Policy & State Table Deep Verification
    steps.push({
      stepNumber: 8,
      id: "step-08-state-verification",
      title: "Stage 8: Live Firewall State Table Verification",
      description: `pfSense inspects sequence windows, packet lengths, and bidirectional counters in hardware state memory. Because state exists, zero rule-lookup CPU latency is incurred.`,
      fromDevice: "firewall",
      toDevice: "server",
      packet: {
        sourceIp: clientIp,
        destIp: serverIp,
        sourcePort: clientPort,
        destPort: targetPort,
        protocol: "TCP",
        packetType: "State Verification & Window Tracking",
        networkInterface: "Firewall Kernel pf Engine",
        currentNetworkStage: "8. Firewall State Memory Validation",
        firewallDecision: "STATE_TRACKED",
        connectionState: "ESTABLISHED",
        payloadSummary: "State Tracking: InPackets=3 (624B), OutPackets=2 (112B), Window OK",
        rawHeaderDump: `[pf Engine: ID 0x8f22, Interface vtnet1 ↔ vtnet2]\n[Tuple: 10.50.10.25:${clientPort} -> 10.50.40.10:${targetPort}]\n[State: ESTABLISHED:ESTABLISHED, Sequence=Valid, Window=OK]`,
      },
      firewallLog: `pfctl -ss output: all tcp ${clientIp}:${clientPort} -> ${serverIp}:${targetPort} ESTABLISHED:ESTABLISHED [packets: 5, bytes: 736]`,
      stateTableEntry: {
        tuple: `tcp ${clientIp}:${clientPort} ↔ ${serverIp}:${targetPort}`,
        state: "ESTABLISHED:ESTABLISHED",
        ttl: 3600,
      },
    });

    // STAGE 9: Server Application Response
    steps.push({
      stepNumber: 9,
      id: "step-09-app-response",
      title: `Stage 9: Application Server Response (${isHttps ? "HTTP 200 OK / Server Certificate" : "SSH Banner & Key Exchange"})`,
      description: isHttps
        ? `Ubuntu Nginx server responds with TLS Server Hello, X.509 Certificate, and HTTP/1.1 200 OK containing National Records Portal data.`
        : `Ubuntu OpenSSH daemon responds with SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.4 banner and ECDH key exchange initiation.`,
      fromDevice: "server",
      toDevice: "workstation",
      packet: {
        sourceIp: serverIp,
        destIp: clientIp,
        sourcePort: targetPort,
        destPort: clientPort,
        protocol: "TCP",
        packetType: isHttps ? "TLS Server Certificate + HTTP 200 OK" : "SSH Server Banner & Key Exchange",
        networkInterface: "ens160 → Firewall (vtnet2) → Router → Workstation",
        currentNetworkStage: "9. Server Application Payload Return",
        firewallDecision: "STATE_TRACKED",
        connectionState: "ESTABLISHED",
        tcpFlags: "[PSH, ACK]",
        seqNumber: 5001,
        ackNumber: isHttps ? 1513 : 1033,
        payloadSummary: isHttps
          ? "HTTP/1.1 200 OK (Content-Type: text/html, Len=1420 bytes, Server: nginx/1.24.0)"
          : "SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.4 (Len=48 bytes)",
        rawHeaderDump: `[IPv4: src=${serverIp}, dst=${clientIp}, proto=TCP(6), len=${isHttps ? 1460 : 100}]\n[Payload: ${isHttps ? "HTTP/1.1 200 OK\\r\\nServer: nginx\\r\\n\\r\\n<!DOCTYPE html><html><title>NPLRA Portal</title>" : "SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.4\\r\\n"}]`,
      },
      firewallLog: `filterlog[82110]: state match: outbound to ${clientIp}:${clientPort} allowed by established state session.`,
      stateTableEntry: {
        tuple: `tcp ${clientIp}:${clientPort} ↔ ${serverIp}:${targetPort}`,
        state: "ESTABLISHED:ESTABLISHED",
        ttl: 3600,
      },
    });

    // STAGE 10: Connection Completion & Success
    steps.push({
      stepNumber: 10,
      id: "step-10-connection-complete",
      title: "Stage 10: Communication Successfully Established!",
      description: isHttps
        ? `SUCCESS: Government employee workstation successfully rendered the secure National Public Licensing & Records Administration portal over HTTPS (Port 443). Dynamic state tracking kept the session alive without opening unnecessary inbound holes.`
        : `SUCCESS: SSH connection to Ubuntu server port 22 reached authenticated terminal prompt because policy Rule #102 was explicitly set to PASS.`,
      fromDevice: "workstation",
      toDevice: "server",
      packet: {
        sourceIp: clientIp,
        destIp: serverIp,
        sourcePort: clientPort,
        destPort: targetPort,
        protocol: "TCP",
        packetType: "TCP Session Active [ESTABLISHED]",
        networkInterface: "Active Virtual Circuit",
        currentNetworkStage: "10. End-to-End Success & Session Persistence",
        firewallDecision: "PERMIT",
        connectionState: "ESTABLISHED",
        tcpFlags: "[ACK]",
        payloadSummary: `Status: CONNECTED (${targetApp}). Both forward and reverse packets authorized.`,
        rawHeaderDump: `[Connection Summary: ${clientIp}:${clientPort} ↔ ${serverIp}:${targetPort}]\n[Protocol: ${isHttps ? "HTTPS/TLS1.3" : "SSHv2"}, Status: ACTIVE]\n[Firewall Security Audit: PASSED - Policy verified]`,
      },
      firewallLog: `system: connection active. Total telemetry: 8 packets, 2,196 bytes transferred. Zero policy violations.`,
      stateTableEntry: {
        tuple: `tcp ${clientIp}:${clientPort} ↔ ${serverIp}:${targetPort}`,
        state: "ESTABLISHED:ESTABLISHED",
        ttl: 3600,
      },
    });
  } else {
    // BLOCKED AT FIREWALL!
    steps.push({
      stepNumber: 4,
      id: "step-04-tcp-syn-blocked",
      title: `Stage 4: TCP SYN — FIREWALL DROPS PACKET (Policy Violation)`,
      description: `Workstation transmits TCP [SYN] to ${serverIp}:${targetPort}. The packet reaches pfSense on interface vtnet1. Rule #${isHttps ? "101" : "102"} specifies ACTION: BLOCK. The packet is instantly discarded and logged. No state is created!`,
      fromDevice: "workstation",
      toDevice: "firewall",
      isBlockedDrop: true,
      packet: {
        sourceIp: clientIp,
        destIp: serverIp,
        sourcePort: clientPort,
        destPort: targetPort,
        protocol: "TCP",
        packetType: `TCP SYN [BLOCKED & DROPPED BY FIREWALL]`,
        networkInterface: "Firewall Ingress (vtnet1)",
        currentNetworkStage: `4. Packet Dropped at Perimeter Firewall (${targetApp})`,
        firewallDecision: "BLOCK",
        connectionState: "BLOCKED",
        tcpFlags: "[SYN]",
        seqNumber: 1000,
        ackNumber: 0,
        payloadSummary: `PACKET DISCARDED: Rule #${isHttps ? "101" : "102"} matched with Action=BLOCK. No state allocated.`,
        rawHeaderDump: `[FIREWALL DROP EVENT: Rule #${isHttps ? "101" : "102"} (vtnet1)]\n[IPv4: src=${clientIp}, dst=${serverIp}, proto=TCP(6), len=60]\n[TCP: sport=${clientPort}, dport=${targetPort}, flags=[SYN]]\n[Kernel Action: DROPPED without response. Packet purged from buffer.]`,
      },
      firewallLog: `filterlog[82110]: 4,,,100000010${isHttps ? "1" : "2"},vtnet1,match,block,in,4,0x0,,64,12001,0,DF,6,tcp,60,${clientIp},${serverIp},${clientPort},${targetPort},0,S,1000,,65535,,mss;sackOK`,
    });

    // STAGE 5: Client Timeout / Denied Result
    steps.push({
      stepNumber: 5,
      id: "step-05-client-timeout",
      title: "Stage 5: Client Connection Timeout & Failure",
      description: `Because pfSense silently dropped the SYN packet, the workstation receives no SYN-ACK. The client retransmits SYN (Exponential Backoff: 1s, 2s, 4s) until giving up with 'ERR_CONNECTION_TIMED_OUT'. The unauthorized ${targetApp} request was completely neutralized.`,
      fromDevice: "workstation",
      toDevice: "firewall",
      isBlockedDrop: true,
      packet: {
        sourceIp: clientIp,
        destIp: serverIp,
        sourcePort: clientPort,
        destPort: targetPort,
        protocol: "TCP",
        packetType: "TCP SYN Retransmit / Connection Timeout",
        networkInterface: "eth0 (Timeout reached)",
        currentNetworkStage: "5. Connection Failed / Access Denied",
        firewallDecision: "BLOCK",
        connectionState: "CLOSED",
        payloadSummary: `CONNECTION REFUSED / TIMED OUT: Target service ${serverIp}:${targetPort} unreachable due to security policy.`,
        rawHeaderDump: `[Client TCP Socket Error: WSAETIMEDOUT (10060)]\n[Diagnostic: The remote network dropped packets before three-way handshake completed.]\n[Security Status: Access properly restricted by firewall administrator.]`,
      },
      firewallLog: `filterlog[82110]: duplicate dropped packet logged: syn retransmit from ${clientIp}:${clientPort} to ${serverIp}:${targetPort}`,
    });
  }

  return steps;
}

/* =========================================================================
   MAIN COMPONENT
   ========================================================================= */

export default function PacketJourneySimulator({
  onLabScoreSave,
}: {
  onLabScoreSave?: (score: number) => void;
}) {
  // Simulator State
  const [trafficType, setTrafficType] = useState<"https" | "ssh">("https");
  const [httpsPolicy, setHttpsPolicy] = useState<"PASS" | "BLOCK">("PASS");
  const [sshPolicy, setSshPolicy] = useState<"PASS" | "BLOCK">("BLOCK");

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1800); // ms per step

  const [selectedDevice, setSelectedDevice] = useState<DeviceId | null>(null);
  const [selectedPacket, setSelectedPacket] = useState<PacketDetails | null>(null);

  const [syslogHistory, setSyslogHistory] = useState<string[]>([]);
  const [liveStateTable, setLiveStateTable] = useState<
    { tuple: string; state: string; ttl: number }[]
  >([]);

  // Competency Task
  const [studentExplanation, setStudentExplanation] = useState<string>("");
  const [explanationSubmitted, setExplanationSubmitted] = useState<boolean>(false);
  const [showModelAnswer, setShowModelAnswer] = useState<boolean>(false);

  // Criteria Verification Tracking
  const [hasRunHttpsPass, setHasRunHttpsPass] = useState<boolean>(false);
  const [hasRunHttpsBlock, setHasRunHttpsBlock] = useState<boolean>(false);
  const [hasRunSshPass, setHasRunSshPass] = useState<boolean>(false);
  const [hasRunSshBlock, setHasRunSshBlock] = useState<boolean>(false);

  // Generate steps based on current policies
  const simulationSteps = generateSimulationSteps(trafficType, httpsPolicy, sshPolicy);
  const currentStep: SimulationStep = simulationSteps[currentStepIndex] ?? simulationSteps[0]!;

  // Auto-play timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setTimeout(() => {
        if (currentStepIndex < simulationSteps.length - 1) {
          const nextIndex = currentStepIndex + 1;
          setCurrentStepIndex(nextIndex);
          const nextStep = simulationSteps[nextIndex];
          if (nextStep) {
            recordStepTelemetry(nextStep);
          }
        } else {
          setIsPlaying(false);
          verifyMilestoneCompletion();
        }
      }, playbackSpeed);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, simulationSteps, playbackSpeed]);

  // Keep packet details synced to current step unless manually overridden
  useEffect(() => {
    if (currentStep) {
      setSelectedPacket(currentStep.packet);
    }
  }, [currentStepIndex, trafficType, httpsPolicy, sshPolicy]);

  const recordStepTelemetry = (step: SimulationStep) => {
    if (step.firewallLog) {
      setSyslogHistory((prev) => [
        `[${new Date().toLocaleTimeString()}] ${step.firewallLog}`,
        ...prev.slice(0, 19),
      ]);
    }
    if (step.stateTableEntry) {
      setLiveStateTable([step.stateTableEntry]);
    } else if (step.isBlockedDrop) {
      setLiveStateTable([]);
    }
  };

  const verifyMilestoneCompletion = () => {
    if (trafficType === "https" && httpsPolicy === "PASS") setHasRunHttpsPass(true);
    if (trafficType === "https" && httpsPolicy === "BLOCK") setHasRunHttpsBlock(true);
    if (trafficType === "ssh" && sshPolicy === "PASS") setHasRunSshPass(true);
    if (trafficType === "ssh" && sshPolicy === "BLOCK") setHasRunSshBlock(true);
  };

  // Controller Actions
  const handleStart = () => {
    setCurrentStepIndex(0);
    setSyslogHistory([]);
    setLiveStateTable([]);
    const firstStep = simulationSteps[0];
    if (firstStep) {
      recordStepTelemetry(firstStep);
    }
    setIsPlaying(true);
    toast.info(`Initiated ${trafficType.toUpperCase()} packet journey simulation.`);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleResume = () => {
    if (currentStepIndex >= simulationSteps.length - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(true);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentStepIndex < simulationSteps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      const nextStep = simulationSteps[nextIndex];
      if (nextStep) {
        recordStepTelemetry(nextStep);
      }
      if (nextIndex === simulationSteps.length - 1) {
        verifyMilestoneCompletion();
      }
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setSyslogHistory([]);
    setLiveStateTable([]);
  };

  // Compute overall lab score
  const score =
    (hasRunHttpsPass ? 25 : 0) +
    (hasRunHttpsBlock ? 25 : 0) +
    (hasRunSshPass || hasRunSshBlock ? 25 : 0) +
    (explanationSubmitted ? 25 : 0);

  const handleSubmitExplanation = () => {
    if (studentExplanation.trim().length < 25) {
      toast.error("Please write a complete technical explanation (at least 25 characters).");
      return;
    }
    setExplanationSubmitted(true);
    setShowModelAnswer(true);
    const newScore = Math.min(100, score + (explanationSubmitted ? 0 : 25));
    onLabScoreSave?.(newScore);
    toast.success(`Competency explanation submitted! Lab score updated to ${newScore}%.`);
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-[10px] font-mono">
              PRACTICAL LAB: DAY 1
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              NPLRA GOVERNMENT OFFICE NETWORK
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
            Government Office Network Packet Journey Simulator
          </h1>
          <p className="text-xs text-muted-foreground max-w-3xl">
            Observe the deterministic 10-stage packet lifecycle between an employee workstation and
            an Ubuntu application server. Inspect headers, test live firewall policies, evaluate
            stateful connection tracking, and analyze drop logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-muted-foreground font-mono">COMPETENCY SCORE</span>
            <span className="text-xl font-bold text-cyan-400 font-mono">{score}%</span>
          </div>
          <Badge
            variant={score >= 70 ? "default" : "outline"}
            className={score >= 70 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" : ""}
          >
            {score >= 70 ? "PROFICIENT" : "IN PROGRESS"}
          </Badge>
        </div>
      </div>

      {/* FIREWALL POLICY EDITING CONTROLS */}
      <Card className="border border-border/80 bg-card/70 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-foreground">
                Firewall Security Policy Plane (pfSense Rules)
              </h2>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Change the active firewall rule actions and observe how the underlying packet journey
              and connection state outcome immediately transform.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Rule 101: HTTPS */}
            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/50 px-3 py-2">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Lock className="h-3 w-3 text-cyan-400" /> Rule 101: HTTPS (Port 443)
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Target: 10.50.40.10 (Ubuntu App)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={`text-[9px] font-mono ${
                    httpsPolicy === "PASS"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      : "bg-rose-500/20 text-rose-400 border-rose-500/40"
                  }`}
                >
                  {httpsPolicy}
                </Badge>
                <Switch
                  checked={httpsPolicy === "PASS"}
                  onCheckedChange={(checked) => {
                    const newPolicy = checked ? "PASS" : "BLOCK";
                    setHttpsPolicy(newPolicy);
                    handleReset();
                    toast.info(`Firewall Rule 101 updated to: ${newPolicy}`);
                  }}
                />
              </div>
            </div>

            {/* Rule 102: SSH */}
            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/50 px-3 py-2">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Terminal className="h-3 w-3 text-amber-400" /> Rule 102: SSH (Port 22)
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Target: 10.50.40.10 (Admin Shell)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={`text-[9px] font-mono ${
                    sshPolicy === "PASS"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      : "bg-rose-500/20 text-rose-400 border-rose-500/40"
                  }`}
                >
                  {sshPolicy}
                </Badge>
                <Switch
                  checked={sshPolicy === "PASS"}
                  onCheckedChange={(checked) => {
                    const newPolicy = checked ? "PASS" : "BLOCK";
                    setSshPolicy(newPolicy);
                    handleReset();
                    toast.info(`Firewall Rule 102 updated to: ${newPolicy}`);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* SIMULATOR CONTROLS & TRAFFIC SELECTOR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/20 border border-border/60 rounded-xl p-3">
        {/* Left: Traffic Mode Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-muted-foreground font-mono uppercase">
            Traffic:
          </span>
          <Button
            size="sm"
            variant={trafficType === "https" ? "default" : "outline"}
            onClick={() => {
              setTrafficType("https");
              handleReset();
            }}
            className="text-xs gap-1.5"
          >
            <Globe className="h-3.5 w-3.5 text-cyan-400" />
            HTTPS (portal.nplra.gov.local:443)
          </Button>
          <Button
            size="sm"
            variant={trafficType === "ssh" ? "default" : "outline"}
            onClick={() => {
              setTrafficType("ssh");
              handleReset();
            }}
            className="text-xs gap-1.5"
          >
            <Terminal className="h-3.5 w-3.5 text-amber-400" />
            SSH (10.50.40.10:22)
          </Button>
        </div>

        {/* Center: Stage Indicator */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs text-cyan-400 border-cyan-500/40">
            STAGE {currentStep.stepNumber} OF {simulationSteps.length}
          </Badge>
          <span className="text-xs font-semibold text-foreground line-clamp-1 max-w-[280px]">
            {currentStep.title}
          </span>
        </div>

        {/* Right: Execution Buttons */}
        <div className="flex items-center gap-2">
          {!isPlaying ? (
            <Button
              size="sm"
              onClick={currentStepIndex === 0 ? handleStart : handleResume}
              className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs gap-1.5"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              {currentStepIndex === 0 ? "START NETWORK COMMUNICATION" : "RESUME"}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handlePause}
              className="text-xs gap-1.5 text-amber-400 border-amber-500/40"
            >
              <Pause className="h-3.5 w-3.5" />
              PAUSE
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={handleStepForward}
            disabled={currentStepIndex >= simulationSteps.length - 1 || isPlaying}
            className="text-xs gap-1"
          >
            <StepForward className="h-3.5 w-3.5" />
            STEP
          </Button>

          <Button size="sm" variant="outline" onClick={handleReset} className="text-xs gap-1">
            <RotateCcw className="h-3.5 w-3.5" />
            REPLAY
          </Button>
        </div>
      </div>

      {/* TOPOLOGY MAP (INTERACTIVE ISOMETRIC DIAGRAM) */}
      <Card className="border border-border/80 bg-card/90 p-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-2">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-bold text-foreground font-mono">
              TOPOLOGY MAP: Fictional NPLRA Government Office Network
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-cyan-400" /> Active Path
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Permitted
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-400" /> Dropped / Blocked
            </span>
            <span className="text-xs font-mono text-cyan-400/80">Click any device for details</span>
          </div>
        </div>

        {/* TOPOLOGY SVG CANVAS & NODES */}
        <div className="relative w-full h-[360px] rounded-xl border border-border/40 bg-slate-950/70 p-4 overflow-hidden">
          {/* Subtle Grid Background */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(0, 229, 255, 0.4) 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Workstation -> Switch */}
            <line
              x1="14%"
              y1="40%"
              x2="28%"
              y2="40%"
              stroke={
                (currentStep.fromDevice === "workstation" && currentStep.toDevice === "switch") ||
                (currentStep.fromDevice === "switch" && currentStep.toDevice === "workstation")
                  ? "#00e5ff"
                  : "#1e293b"
              }
              strokeWidth={
                (currentStep.fromDevice === "workstation" && currentStep.toDevice === "switch") ||
                (currentStep.fromDevice === "switch" && currentStep.toDevice === "workstation")
                  ? "3"
                  : "2"
              }
              strokeDasharray={
                (currentStep.fromDevice === "workstation" && currentStep.toDevice === "switch") ||
                (currentStep.fromDevice === "switch" && currentStep.toDevice === "workstation")
                  ? "6 3"
                  : "none"
              }
            />

            {/* Switch -> Router */}
            <line
              x1="30%"
              y1="40%"
              x2="44%"
              y2="40%"
              stroke="#1e293b"
              strokeWidth="2"
            />

            {/* Router -> Firewall */}
            <line
              x1="46%"
              y1="40%"
              x2="60%"
              y2="40%"
              stroke="#1e293b"
              strokeWidth="2"
            />

            {/* Firewall -> Server */}
            <line
              x1="66%"
              y1="40%"
              x2="84%"
              y2="40%"
              stroke={
                currentStep.isBlockedDrop
                  ? "#f43f5e"
                  : (currentStep.fromDevice === "firewall" && currentStep.toDevice === "server") ||
                    (currentStep.fromDevice === "server" && currentStep.toDevice === "firewall")
                  ? "#10b981"
                  : "#1e293b"
              }
              strokeWidth="2"
            />

            {/* Firewall -> DNS (Vertical Down) */}
            <line
              x1="62%"
              y1="48%"
              x2="62%"
              y2="76%"
              stroke={
                (currentStep.fromDevice === "firewall" && currentStep.toDevice === "dns") ||
                (currentStep.fromDevice === "dns" && currentStep.toDevice === "firewall")
                  ? "#00e5ff"
                  : "#1e293b"
              }
              strokeWidth="2"
            />

            {/* Firewall -> Internet (Vertical Up) */}
            <line
              x1="62%"
              y1="32%"
              x2="62%"
              y2="15%"
              stroke="#1e293b"
              strokeWidth="2"
            />

            {/* Dynamic Packet Dot Indicator */}
            {isPlaying && (
              <circle
                cx={
                  currentStep.toDevice === "dns"
                    ? "62%"
                    : currentStep.toDevice === "server"
                    ? "84%"
                    : currentStep.toDevice === "firewall"
                    ? "62%"
                    : currentStep.toDevice === "router"
                    ? "44%"
                    : "14%"
                }
                cy={
                  currentStep.toDevice === "dns"
                    ? "76%"
                    : currentStep.toDevice === "internet"
                    ? "15%"
                    : "40%"
                }
                r="6"
                fill={currentStep.isBlockedDrop ? "#f43f5e" : "#00e5ff"}
                className="animate-ping"
              />
            )}
          </svg>

          {/* DEVICE CARDS (CLICKABLE) */}
          {Object.values(TOPOLOGY_DEVICES).map((dev) => {
            const isActive =
              currentStep.fromDevice === dev.id || currentStep.toDevice === dev.id;
            const isSelected = selectedDevice === dev.id;
            const isBlockedAtDevice = currentStep.isBlockedDrop && dev.id === "firewall";

            return (
              <div
                key={dev.id}
                onClick={() => setSelectedDevice(dev.id)}
                style={{
                  left: `${dev.x}%`,
                  top: `${dev.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                className={`absolute z-10 cursor-pointer rounded-xl border p-2.5 transition-all duration-300 w-[155px] ${
                  isSelected
                    ? "border-cyan-400 bg-cyan-950/80 shadow-[0_0_20px_rgba(0,229,255,0.3)] ring-2 ring-cyan-400/50"
                    : isActive
                    ? isBlockedAtDevice
                      ? "border-rose-500 bg-rose-950/70 shadow-[0_0_20px_rgba(244,63,94,0.4)]"
                      : "border-cyan-500/80 bg-slate-900/90 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                    : "border-border/70 bg-slate-900/60 hover:border-cyan-500/40 hover:bg-slate-900/80"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    {dev.id === "workstation" && <Laptop className="h-3.5 w-3.5 text-cyan-400" />}
                    {dev.id === "switch" && <Layers className="h-3.5 w-3.5 text-blue-400" />}
                    {dev.id === "router" && <Radio className="h-3.5 w-3.5 text-indigo-400" />}
                    {dev.id === "firewall" && (
                      <Shield
                        className={`h-3.5 w-3.5 ${
                          isBlockedAtDevice ? "text-rose-400 animate-pulse" : "text-emerald-400"
                        }`}
                      />
                    )}
                    {dev.id === "dns" && <Database className="h-3.5 w-3.5 text-purple-400" />}
                    {dev.id === "server" && <Server className="h-3.5 w-3.5 text-amber-400" />}
                    {dev.id === "internet" && <Globe className="h-3.5 w-3.5 text-slate-400" />}
                    <span className="font-bold text-[11px] text-foreground truncate">
                      {dev.name.split(" ")[0]}
                    </span>
                  </div>
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isBlockedAtDevice
                        ? "bg-rose-400"
                        : isActive
                        ? "bg-cyan-400 animate-pulse"
                        : "bg-slate-500"
                    }`}
                  />
                </div>

                <div className="text-[10px] font-mono text-cyan-300 font-bold truncate">
                  {dev.ip.split(" ")[0]}
                </div>
                <div className="text-[9px] text-muted-foreground truncate">{dev.interfaceName}</div>

                {isBlockedAtDevice && (
                  <Badge className="mt-1 h-3.5 px-1 bg-rose-500 text-white text-[8px] font-bold">
                    PACKET DROPPED
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        {/* SELECTED DEVICE INSPECTION DRAWER */}
        {selectedDevice && (
          <div className="mt-3 p-3 rounded-lg border border-cyan-500/30 bg-cyan-950/20 flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-cyan-300">
                  {TOPOLOGY_DEVICES[selectedDevice].name}
                </span>
                <Badge variant="outline" className="text-[9px]">
                  {TOPOLOGY_DEVICES[selectedDevice].os}
                </Badge>
                <Badge variant="outline" className="text-[9px] font-mono text-emerald-400">
                  {TOPOLOGY_DEVICES[selectedDevice].status}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {TOPOLOGY_DEVICES[selectedDevice].role}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono">
              <div>
                <span className="text-muted-foreground">IP/Subnet:</span>{" "}
                <span className="text-foreground">{TOPOLOGY_DEVICES[selectedDevice].ip}</span>
              </div>
              <div>
                <span className="text-muted-foreground">MAC:</span>{" "}
                <span className="text-foreground">{TOPOLOGY_DEVICES[selectedDevice].mac}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Interfaces:</span>{" "}
                <span className="text-foreground">
                  {TOPOLOGY_DEVICES[selectedDevice].interfaceName}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedDevice(null)}
                className="h-6 text-[10px] px-2 text-muted-foreground hover:text-foreground"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* TWO COLUMN GRID: PACKET INSPECTION & FIREWALL TELEMETRY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: 10-FIELD PACKET INSPECTION PANEL */}
        <Card className="border border-border/80 bg-card/70 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-foreground font-mono">
                PACKET INSPECTION & HEADER DECODER
              </h3>
            </div>
            <Badge
              className={`text-[9px] font-mono ${
                currentStep.packet.firewallDecision === "PERMIT" ||
                currentStep.packet.firewallDecision === "STATE_TRACKED"
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  : currentStep.packet.firewallDecision === "BLOCK"
                  ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                  : "bg-blue-500/20 text-blue-400 border-blue-500/40"
              }`}
            >
              DECISION: {currentStep.packet.firewallDecision}
            </Badge>
          </div>

          {/* 10 Required Inspection Fields Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-background/60 border border-border/50">
              <span className="text-[10px] text-muted-foreground block font-mono">1. SOURCE IP</span>
              <span className="font-mono font-bold text-cyan-400">
                {currentStep.packet.sourceIp}
              </span>
            </div>

            <div className="p-2 rounded bg-background/60 border border-border/50">
              <span className="text-[10px] text-muted-foreground block font-mono">
                2. DESTINATION IP
              </span>
              <span className="font-mono font-bold text-foreground">
                {currentStep.packet.destIp}
              </span>
            </div>

            <div className="p-2 rounded bg-background/60 border border-border/50">
              <span className="text-[10px] text-muted-foreground block font-mono">
                3. SOURCE PORT
              </span>
              <span className="font-mono text-foreground">
                {currentStep.packet.sourcePort || "N/A (L2/ARP)"}
              </span>
            </div>

            <div className="p-2 rounded bg-background/60 border border-border/50">
              <span className="text-[10px] text-muted-foreground block font-mono">
                4. DESTINATION PORT
              </span>
              <span className="font-mono font-bold text-cyan-400">
                {currentStep.packet.destPort || "N/A (L2/ARP)"}
              </span>
            </div>

            <div className="p-2 rounded bg-background/60 border border-border/50">
              <span className="text-[10px] text-muted-foreground block font-mono">5. PROTOCOL</span>
              <span className="font-mono font-semibold text-foreground">
                {currentStep.packet.protocol}
              </span>
            </div>

            <div className="p-2 rounded bg-background/60 border border-border/50">
              <span className="text-[10px] text-muted-foreground block font-mono">
                6. PACKET TYPE
              </span>
              <span className="font-semibold text-foreground truncate block">
                {currentStep.packet.packetType}
              </span>
            </div>

            <div className="p-2 rounded bg-background/60 border border-border/50 col-span-2">
              <span className="text-[10px] text-muted-foreground block font-mono">
                7. NETWORK INTERFACE PATH
              </span>
              <span className="font-mono text-xs text-foreground">
                {currentStep.packet.networkInterface}
              </span>
            </div>

            <div className="p-2 rounded bg-background/60 border border-border/50 col-span-2">
              <span className="text-[10px] text-muted-foreground block font-mono">
                8. CURRENT NETWORK STAGE
              </span>
              <span className="font-semibold text-xs text-cyan-300">
                {currentStep.packet.currentNetworkStage}
              </span>
            </div>

            <div className="p-2 rounded bg-background/60 border border-border/50">
              <span className="text-[10px] text-muted-foreground block font-mono">
                9. FIREWALL DECISION
              </span>
              <span
                className={`font-mono font-bold ${
                  currentStep.packet.firewallDecision === "BLOCK"
                    ? "text-rose-400"
                    : "text-emerald-400"
                }`}
              >
                {currentStep.packet.firewallDecision}
              </span>
            </div>

            <div className="p-2 rounded bg-background/60 border border-border/50">
              <span className="text-[10px] text-muted-foreground block font-mono">
                10. CONNECTION STATE
              </span>
              <span className="font-mono font-bold text-foreground">
                {currentStep.packet.connectionState}
              </span>
            </div>
          </div>

          {/* Raw Header & Payload Dump */}
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground font-mono uppercase block">
              Header Dissector & Payload Excerpt
            </span>
            <pre className="p-3 rounded-lg bg-slate-950/90 border border-border/60 text-[10px] font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {currentStep.packet.rawHeaderDump}
            </pre>
          </div>
        </Card>

        {/* RIGHT COLUMN: FIREWALL STATE TABLE & LIVE SYSLOG */}
        <div className="space-y-6">
          {/* STATE TABLE */}
          <Card className="border border-border/80 bg-card/70 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-foreground font-mono">
                  ACTIVE FIREWALL STATE TABLE (pfSense Memory)
                </h3>
              </div>
              <Badge variant="outline" className="text-[9px] font-mono">
                {liveStateTable.length} SESSIONS TRACKED
              </Badge>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Dynamic state entries track bidirectional TCP/UDP flows. When an entry exists, reverse
              response packets are automatically permitted without requiring static rules.
            </p>

            <div className="overflow-x-auto rounded border border-border/60 bg-background/60">
              <table className="w-full text-[10px] font-mono text-left">
                <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground">
                  <tr>
                    <th className="p-2">5-TUPLE SESSION</th>
                    <th className="p-2">TCP STATE</th>
                    <th className="p-2">TTL</th>
                  </tr>
                </thead>
                <tbody>
                  {liveStateTable.length > 0 ? (
                    liveStateTable.map((s, idx) => (
                      <tr key={idx} className="border-b border-border/40">
                        <td className="p-2 text-cyan-300 font-bold">{s.tuple}</td>
                        <td className="p-2 text-emerald-400">{s.state}</td>
                        <td className="p-2 text-muted-foreground">{s.ttl}s</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-3 text-center text-muted-foreground italic">
                        {currentStep.isBlockedDrop
                          ? "No state created — Inbound packet was DROPPED by policy rule."
                          : "State table empty. Click 'START NETWORK COMMUNICATION' to initiate flows."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* REALTIME FIREWALL SYSLOG (filterlog) */}
          <Card className="border border-border/80 bg-card/70 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-foreground font-mono">
                  LIVE FIREWALL SYSLOG (/var/log/filter.log)
                </h3>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">FACILITY: LOCAL0</span>
            </div>

            <div className="h-[140px] overflow-y-auto rounded-lg bg-slate-950 p-3 font-mono text-[10px] text-emerald-400/90 space-y-1 border border-border/60">
              {syslogHistory.length > 0 ? (
                syslogHistory.map((log, i) => (
                  <div
                    key={i}
                    className={`leading-relaxed ${
                      log.includes("block") || log.includes("DROPPED")
                        ? "text-rose-400"
                        : "text-emerald-300"
                    }`}
                  >
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground italic">
                  Waiting for network events... Syslog entries will stream here in real time.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* VERIFICATION & CONNECTION RESULT SUMMARY */}
      <Card
        className={`border p-4 ${
          currentStep.isBlockedDrop
            ? "border-rose-500/50 bg-rose-950/20"
            : currentStepIndex === simulationSteps.length - 1
            ? "border-emerald-500/50 bg-emerald-950/20"
            : "border-border/80 bg-card/60"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            {currentStep.isBlockedDrop ? (
              <XCircle className="h-5 w-5 text-rose-400 flex-none mt-0.5" />
            ) : currentStepIndex === simulationSteps.length - 1 ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-none mt-0.5" />
            ) : (
              <Clock className="h-5 w-5 text-cyan-400 flex-none mt-0.5" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-foreground">
                  {currentStep.isBlockedDrop
                    ? "COMMUNICATION TERMINATED: Access Denied by Security Policy"
                    : currentStepIndex === simulationSteps.length - 1
                    ? "COMMUNICATION SUCCESSFUL: Full Application Exchange Completed"
                    : "PACKET JOURNEY IN PROGRESS"}
                </h4>
                <Badge
                  variant="outline"
                  className={
                    currentStep.isBlockedDrop
                      ? "text-rose-400 border-rose-500/40"
                      : "text-emerald-400 border-emerald-500/40"
                  }
                >
                  {trafficType.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {currentStep.isBlockedDrop
                  ? `The inbound packet to port ${
                      trafficType === "https" ? "443" : "22"
                    } was discarded at the firewall interface because the active policy specifies Action: BLOCK. No reverse packets or state table entries were permitted.`
                  : currentStep.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-none">
            <span className="text-[11px] font-mono text-muted-foreground">
              {trafficType === "https" && httpsPolicy === "PASS"
                ? "Tested: HTTPS Allow (Passed)"
                : trafficType === "https" && httpsPolicy === "BLOCK"
                ? "Tested: HTTPS Deny (Passed)"
                : trafficType === "ssh" && sshPolicy === "BLOCK"
                ? "Tested: SSH Deny (Passed)"
                : "Tested: SSH Allow (Passed)"}
            </span>
          </div>
        </div>
      </Card>

      {/* LEARNER COMPETENCY TASK */}
      <Card className="border border-border/80 bg-card/70 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-foreground font-mono">
              LEARNER COMPETENCY EVALUATION TASK
            </h3>
          </div>
          <Badge
            variant={explanationSubmitted ? "default" : "outline"}
            className={
              explanationSubmitted
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                : "text-amber-400 border-amber-500/40"
            }
          >
            {explanationSubmitted ? "COMPLETED (+25 PTS)" : "PENDING SUBMISSION"}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-foreground">
            Practical Question:
          </div>
          <p className="text-xs text-cyan-300 font-mono bg-slate-950/80 p-3 rounded-lg border border-border/60">
            "Explain why the HTTPS connection succeeds and why the SSH connection is denied."
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] text-muted-foreground block font-mono">
            YOUR TECHNICAL EXPLANATION:
          </label>
          <textarea
            value={studentExplanation}
            onChange={(e) => setStudentExplanation(e.target.value)}
            placeholder="Describe policy evaluation (Rule 101 vs Rule 102), state table allocation on the initial SYN packet, and how reverse packets are tracked automatically..."
            rows={4}
            className="w-full rounded-lg border border-border/80 bg-slate-950/90 p-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-mono">
              Word count: {studentExplanation.trim() ? studentExplanation.trim().split(/\s+/).length : 0} words
            </span>
            <Button
              size="sm"
              onClick={handleSubmitExplanation}
              className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              Submit Explanation & Review Model Answer
            </Button>
          </div>
        </div>

        {/* MODEL ANSWER ACCORDION */}
        {showModelAnswer && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono">
              <Check className="h-4 w-4" />
              AUTHORITATIVE INSTRUCTOR MODEL ANSWER:
            </div>
            <div className="text-xs text-foreground space-y-2 leading-relaxed">
              <p>
                <strong>1. Policy Plane Matching:</strong> The packet journey begins with policy
                evaluation at the ingress interface (<code>vtnet1</code>). The security administrator
                configured Rule 101 with Action: <code>PASS</code> for destination TCP port 443
                (HTTPS), but configured Rule 102 with Action: <code>BLOCK</code> for destination TCP
                port 22 (SSH).
              </p>
              <p>
                <strong>2. Stateful Dynamic Tracking (HTTPS):</strong> When the initial TCP [SYN]
                for HTTPS arrives, it matches Rule 101 and the firewall dynamically instantiates a
                connection record in its state memory (<code>tcp 10.50.10.25:54320 ↔ 10.50.40.10:443</code>).
                When the Ubuntu server replies with [SYN, ACK], the firewall checks its state table,
                finds the matching reversed tuple, and permits the response through to the client
                without requiring an explicit inbound permit rule on the DMZ interface.
              </p>
              <p>
                <strong>3. Packet Discard & Timeout (SSH):</strong> In contrast, the TCP [SYN]
                packet directed to port 22 matches Rule 102 (Action: <code>BLOCK</code>). The firewall
                immediately discards the packet, logs the event to <code>/var/log/filter.log</code>,
                and allocates zero state table entries. Because no SYN-ACK can ever return, the client
                workstation experiences an application connection timeout.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
