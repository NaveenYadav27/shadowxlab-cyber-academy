export type LabMode = "local-full" | "local-light" | "shared-range" | "simulation";

export interface HardwareCapabilities {
  totalRamGb: number;
  availableRamGb: number;
  cpuCores: number;
  virtualizationEnabled: boolean;
  freeDiskGb: number;
  hostOs: "windows" | "macos" | "linux" | "other";
}

export interface ReadinessChecklistItem {
  id: string;
  title: string;
  category: "hardware" | "hypervisor" | "images" | "network";
  status: "passed" | "warning" | "failed" | "pending";
  detail: string;
  remediation?: string | undefined;
}

export interface AssistanceRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  seat: string;
  labMode: LabMode;
  blockerCategory:
    | "virtualbox"
    | "pfsense_dhcp"
    | "kali_dhcp"
    | "sxl_lan"
    | "gateway_ping"
    | "internet_nat"
    | "dns"
    | "hardware_limit"
    | "other";
  description: string;
  systemSpecs: string;
  timestamp: string;
  status: "open" | "acknowledged" | "resolved";
  instructorNote?: string | undefined;
}

export interface TroubleshootingStep {
  id: string;
  title: string;
  category: string;
  question: string;
  checkCommand?: string;
  expectedOutput?: string;
  yesNextStepId?: string;
  noNextStepId?: string;
  actionIfNo?: {
    cause: string;
    fixSteps: string[];
    fixCommands: { label: string; cmd: string; explanation?: string }[];
  };
}

export interface StandardLabVerificationState {
  kaliIpVerified: boolean;
  kaliIpOutput?: string | undefined;
  pfsensePingVerified: boolean;
  ubuntuPingVerified: boolean;
  internetPingVerified: boolean;
  dnsLookupVerified: boolean;
  pfsenseWebGuiVerified: boolean;
  completionEvidenceNotes?: string | undefined;
  completedAt?: string | undefined;
  verifiedByInstructor?: boolean | undefined;
}

export interface StudentLabReadinessRecord {
  studentId: string;
  studentName: string;
  studentEmail: string;
  seat: string;
  hardware: HardwareCapabilities;
  selectedMode: LabMode;
  overallStatus: "READY" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED";
  currentBlocker?: string | undefined;
  activeTroubleshootingStepId?: string | undefined;
  verification: StandardLabVerificationState;
  lastUpdated: string;
}

export const HARDWARE_TIER_SPECS = {
  "local-full": {
    name: "Full Local VirtualBox",
    minRamGb: 16,
    recommendedRamGb: 16,
    minCores: 4,
    minDiskGb: 60,
    description:
      "Runs pfSense (1 GB), Kali Linux (4 GB), and Ubuntu Server (2 GB) simultaneously on your local machine.",
    suitableFor: "Laptops/Desktops with 16 GB+ RAM and Intel VT-x / AMD-V enabled.",
  },
  "local-light": {
    name: "Lightweight Local Lab",
    minRamGb: 8,
    recommendedRamGb: 8,
    minCores: 2,
    minDiskGb: 30,
    description:
      "Runs pfSense (768 MB) and a lightweight CLI Linux client (512 MB). Leaves 6+ GB for host OS.",
    suitableFor: "Laptops with 8–12 GB RAM where running desktop Kali would cause swapping/lag.",
  },
  "shared-range": {
    name: "Shared Instructor Cyber Range",
    minRamGb: 4,
    recommendedRamGb: 4,
    minCores: 2,
    minDiskGb: 5,
    description:
      "Connect via WireGuard VPN or secure web terminal to a dedicated multi-tenant pfSense instance on instructor infrastructure.",
    suitableFor:
      "Students with 4–6 GB RAM, locked corporate laptops, or disabled BIOS virtualization.",
  },
  simulation: {
    name: "In-Browser Deterministic Simulation",
    minRamGb: 2,
    recommendedRamGb: 4,
    minCores: 1,
    minDiskGb: 1,
    description:
      "Execute 100% of network rules, NAT, state table inspection, and packet traversal inside ShadowXLab's interactive engine.",
    suitableFor: "Zero local hypervisor requirement. Accessible from any modern web browser.",
  },
};

export const STANDARD_PFSENSE_TOPOLOGY = {
  wan: {
    interfaceName: "vtnet0 / em0",
    mode: "VirtualBox NAT",
    ipRange: "10.0.2.15/24 (VirtualBox NAT DHCP engine)",
    gateway: "10.0.2.2",
    purpose: "Upstream Internet access simulated through host connection",
  },
  lan: {
    interfaceName: "vtnet1 / em1",
    mode: "Internal Network (Name: SXL-LAN)",
    ip: "192.168.50.1/24",
    dhcpRange: "192.168.50.100 - 192.168.50.200",
    gateway: "192.168.50.1",
    dns: "192.168.50.1 (Unbound DNS Resolver)",
    purpose: "Isolated internal broadcast domain for training workstations and servers",
  },
  kali: {
    vmName: "SXL-Kali",
    adapterMode: "Internal Network: SXL-LAN",
    addressing: "DHCP Client (expects 192.168.50.10x)",
    role: "Attacker / Security Analyst workstation",
  },
  ubuntu: {
    vmName: "SXL-Ubuntu",
    adapterMode: "Internal Network: SXL-LAN",
    addressing: "Static 192.168.50.20/24 or DHCP Reservation",
    role: "Target enterprise database / web server",
  },
};

export const DIAGNOSTIC_DECISION_TREE: TroubleshootingStep[] = [
  {
    id: "step-1-kali-dhcp",
    title: "1. Kali Linux DHCP IP Lease Verification",
    category: "DHCP & Network Layer",
    question:
      "Run 'ip a show eth0' in Kali. Is Kali assigned an IP address in the 192.168.50.100-200 range?",
    checkCommand: "ip a show eth0",
    expectedOutput: "inet 192.168.50.10x/24 brd 192.168.50.255 scope global eth0",
    yesNextStepId: "step-2-pfsense-ping",
    noNextStepId: "step-1a-check-adapters",
    actionIfNo: {
      cause:
        "Kali has not received a DHCP lease from pfSense. Either the virtual network cables are not in the same Internal Network, or the pfSense DHCP daemon is not running.",
      fixSteps: [
        "Confirm pfSense VM is powered on and console shows 'LAN (lan) -> v4: 192.168.50.1/24'.",
        "Open VirtualBox VM Settings -> Network -> Adapter 1 for BOTH Kali and pfSense (Adapter 2).",
        "Verify Attached to: 'Internal Network' and Name: 'SXL-LAN' (EXACT spelling, case-sensitive!).",
        "In Kali terminal, force a new DHCP request using the commands below.",
      ],
      fixCommands: [
        {
          label: "Force DHCP Lease in Kali",
          cmd: "sudo dhclient -r eth0 && sudo dhclient -v eth0",
          explanation: "Releases any stale lease and requests an IP from the SXL-LAN DHCP server.",
        },
        {
          label: "Restart Kali Network Manager",
          cmd: "sudo systemctl restart NetworkManager",
          explanation: "Restarts the network daemon to re-trigger interface link detection.",
        },
      ],
    },
  },
  {
    id: "step-1a-check-adapters",
    title: "1a. VirtualBox Adapter Matching (SXL-LAN)",
    category: "Hypervisor Configuration",
    question:
      "In VirtualBox, are pfSense Adapter 2 AND Kali Adapter 1 BOTH set to 'Internal Network' with the exact name 'SXL-LAN'?",
    checkCommand: 'VBoxManage showvminfo "pfSense" | grep -i "nic 2"',
    expectedOutput:
      "NIC 2: MAC: ..., Attachment: 'Internal Network', Cable connected: on, Trace: off, Type: 82540EM, Reported: ... (SXL-LAN)",
    yesNextStepId: "step-1b-check-pfsense-dhcp",
    noNextStepId: "step-1-kali-dhcp",
    actionIfNo: {
      cause:
        "A mismatch in the Internal Network name isolates Kali in a separate virtual switch. 'SXL-LAN' and 'sxl-lan' are treated as two distinct networks!",
      fixSteps: [
        "Shut down Kali and pfSense (or edit VM network on the fly in Devices -> Network).",
        "For pfSense VM: Set Adapter 2 to 'Internal Network' -> Name: SXL-LAN -> Promiscuous Mode: Allow VMs -> Cable Connected: Checked.",
        "For Kali VM: Set Adapter 1 to 'Internal Network' -> Name: SXL-LAN -> Promiscuous Mode: Allow VMs -> Cable Connected: Checked.",
      ],
      fixCommands: [
        {
          label: "Configure SXL-LAN via VBoxManage (Host Terminal)",
          cmd: 'VBoxManage modifyvm "pfSense" --nic2 intnet --intnet2 "SXL-LAN" --cableconnected2 on\nVBoxManage modifyvm "Kali" --nic1 intnet --intnet1 "SXL-LAN" --cableconnected1 on',
          explanation: "Automates attaching both VMs to the common SXL-LAN virtual switch.",
        },
      ],
    },
  },
  {
    id: "step-1b-check-pfsense-dhcp",
    title: "1b. pfSense Console LAN IP & DHCP Service",
    category: "Firewall Configuration",
    question:
      "In the pfSense terminal/VBox console screen, does option 2 verify LAN is 192.168.50.1/24 with DHCP enabled?",
    checkCommand: "pfSense Console Menu -> Option 2 (Set interface(s) IP address)",
    expectedOutput:
      "LAN IPv4 address: 192.168.50.1, Subnet mask: 24, DHCP enabled: y, Range: 192.168.50.100 - 192.168.50.200",
    yesNextStepId: "step-2-pfsense-ping",
    noNextStepId: "step-1-kali-dhcp",
    actionIfNo: {
      cause:
        "pfSense defaults to 192.168.1.1/24 on initial install, which may conflict with your physical home router and fail to service the 192.168.50.x lab range.",
      fixSteps: [
        "In the pfSense console, type '2' and press Enter.",
        "Select interface '2' (LAN).",
        "Enter new LAN IPv4 address: 192.168.50.1",
        "Enter new LAN IPv4 subnet bit count: 24",
        "For WAN, enter a new LAN IPv4 upstream gateway address: Press Enter for none.",
        "Do you want to enable the DHCP server on LAN? Type 'y' and press Enter.",
        "Enter the start address: 192.168.50.100",
        "Enter the end address: 192.168.50.200",
        "Do you want to revert to HTTP for webConfigurator? Type 'n' (or 'y' if you don't want SSL warnings).",
      ],
      fixCommands: [
        {
          label: "pfSense Quick LAN Assignment Reference",
          cmd: "Option 2 -> Interface 2 -> 192.168.50.1 -> 24 -> [Enter] -> [Enter] -> y -> 192.168.50.100 -> 192.168.50.200 -> n",
          explanation:
            "Sequential answers to configure the standardized SXL-LAN interface and DHCP scope.",
        },
      ],
    },
  },
  {
    id: "step-2-pfsense-ping",
    title: "2. Gateway ICMP Connectivity (Kali -> pfSense)",
    category: "L2/L3 Network Reachability",
    question:
      "From Kali terminal, run 'ping -c 3 192.168.50.1'. Do you receive 3 successful replies (0% packet loss)?",
    checkCommand: "ping -c 3 192.168.50.1",
    expectedOutput: "3 packets transmitted, 3 received, 0% packet loss, time ... ms",
    yesNextStepId: "step-3-ubuntu-reachability",
    noNextStepId: "step-2a-arp-firewall",
    actionIfNo: {
      cause:
        "Kali has an IP but cannot communicate with the gateway. This is typically due to an ARP resolution failure, a misassigned interface (WAN and LAN swapped), or pfSense packet filter blocking.",
      fixSteps: [
        "Check ARP cache in Kali with 'ip neigh show'. You should see 192.168.50.1 dev eth0 lladdr ... REACHABLE.",
        "In pfSense console, check Option 1 (Assign Interfaces). Ensure vtnet0/em0 is WAN and vtnet1/em1 is LAN. If inverted, WAN is on the internal network!",
      ],
      fixCommands: [
        {
          label: "Inspect ARP Cache in Kali",
          cmd: "ip neigh show",
          explanation:
            "Confirms whether Layer 2 MAC address resolution succeeded for 192.168.50.1.",
        },
        {
          label: "pfSense Interface Inversion Fix",
          cmd: "Console Option 1 -> Should VLANs be set up now [n] -> WAN: em0 -> LAN: em1",
          explanation:
            "Ensures the first VirtualBox adapter (NAT) maps to WAN and the second (Internal) maps to LAN.",
        },
      ],
    },
  },
  {
    id: "step-2a-arp-firewall",
    title: "2a. pfSense Interface Assignment Check",
    category: "Interface Mapping",
    question:
      "In the pfSense console banner, is WAN assigned to em0/vtnet0 and LAN assigned to em1/vtnet1?",
    checkCommand: "Look at pfSense Console: WAN (wan) -> em0, LAN (lan) -> em1",
    expectedOutput:
      "WAN (wan) -> em0 -> v4/DHCP4: 10.0.2.15/24\nLAN (lan) -> em1 -> v4: 192.168.50.1/24",
    yesNextStepId: "step-3-ubuntu-reachability",
    noNextStepId: "step-1-kali-dhcp",
    actionIfNo: {
      cause:
        "If WAN and LAN are inverted, pfSense applies strict WAN default-drop rules to the internal network and will not respond to Kali.",
      fixSteps: [
        "Run Option 1 in the pfSense console menu.",
        "Do not configure VLANs.",
        "Enter 'em0' (or 'vtnet0') for WAN.",
        "Enter 'em1' (or 'vtnet1') for LAN.",
        "Confirm with 'y'.",
      ],
      fixCommands: [
        {
          label: "Temporarily Disable pfSense Packet Filter (Debug Only)",
          cmd: "pfctl -d",
          explanation:
            "Disables firewall filtering via pfSense shell (Option 8) to verify if a firewall rule is blocking traffic.",
        },
      ],
    },
  },
  {
    id: "step-3-ubuntu-reachability",
    title: "3. East-West Lateral Reachability (Kali -> Ubuntu)",
    category: "Internal Network Switching",
    question:
      "If running the multi-host lab with Ubuntu Server (192.168.50.20), can Kali ping Ubuntu?",
    checkCommand: "ping -c 3 192.168.50.20",
    expectedOutput: "3 packets transmitted, 3 received, 0% packet loss",
    yesNextStepId: "step-4-internet-nat",
    noNextStepId: "step-3a-ubuntu-config",
    actionIfNo: {
      cause:
        "Ubuntu server is either offline, not connected to SXL-LAN, has ufw enabled blocking ICMP, or has not configured its static IP.",
      fixSteps: [
        "Check that Ubuntu VM Adapter 1 is connected to 'Internal Network' SXL-LAN.",
        "In Ubuntu console, run 'ip a' to verify IP assignment.",
        "Check Ubuntu firewall with 'sudo ufw status'. If active, allow ICMP or test with ufw disabled temporarily.",
      ],
      fixCommands: [
        {
          label: "Configure Static IP in Ubuntu (Netplan)",
          cmd: "sudo tee /etc/netplan/01-netcfg.yaml << 'EOF'\nnetwork:\n  version: 2\n  ethernets:\n    enp0s3:\n      dhcp4: false\n      addresses: [192.168.50.20/24]\n      gateway4: 192.168.50.1\n      nameservers:\n        addresses: [192.168.50.1, 8.8.8.8]\nEOF\nsudo netplan apply",
          explanation: "Configures 192.168.50.20 statically on Ubuntu server.",
        },
      ],
    },
  },
  {
    id: "step-3a-ubuntu-config",
    title: "3a. Ubuntu Network & Firewall Setup",
    category: "Host Hardening",
    question: "Did applying netplan and checking ufw allow ping between Kali and Ubuntu?",
    checkCommand: "ping -c 2 192.168.50.20",
    expectedOutput: "2 packets transmitted, 2 received, 0% packet loss",
    yesNextStepId: "step-4-internet-nat",
    noNextStepId: "step-4-internet-nat",
    actionIfNo: {
      cause:
        "Note: In Lightweight Lab Mode or Single-Host mode, Ubuntu is optional. You can proceed directly to pfSense Internet NAT testing.",
      fixSteps: [
        "If you are on an 8 GB machine, switch to 'Lightweight Local Lab' mode in the Lab Readiness Center to skip the Ubuntu VM.",
        "Check VirtualBox hypervisor running processes to see if SXL-Ubuntu has started.",
      ],
      fixCommands: [
        {
          label: "Check Ubuntu VM Status (Host)",
          cmd: "VBoxManage list runningvms",
          explanation: "Confirm if SXL-Ubuntu virtual machine is powered on and active.",
        },
      ],
    },
  },
  {
    id: "step-4-internet-nat",
    title: "4. Outbound Internet NAT via pfSense",
    category: "NAT & Default Routing",
    question:
      "From Kali terminal, run 'ping -c 3 8.8.8.8'. Can you ping Google Public DNS through pfSense?",
    checkCommand: "ping -c 3 8.8.8.8",
    expectedOutput: "3 packets transmitted, 3 received, 0% packet loss",
    yesNextStepId: "step-5-dns-resolution",
    noNextStepId: "step-4a-pfsense-wan-nat",
    actionIfNo: {
      cause:
        "Kali reaches the pfSense LAN gateway, but pfSense is not translating/forwarding packets out of WAN. Either pfSense WAN does not have an internet connection from VirtualBox NAT, or pfSense Outbound NAT is misconfigured.",
      fixSteps: [
        "In pfSense console, check if WAN has an IP (e.g. 10.0.2.15). If 0.0.0.0, VirtualBox Adapter 1 NAT is disconnected.",
        "From pfSense console Option 7 (Ping host), ping 8.8.8.8. Does pfSense itself reach the internet?",
        "If pfSense reaches the internet but Kali cannot, log into pfSense webGUI (https://192.168.50.1) -> Firewall -> NAT -> Outbound -> Ensure 'Automatic outbound NAT rule generation' is selected.",
      ],
      fixCommands: [
        {
          label: "Test pfSense Outbound Route from Kali",
          cmd: "traceroute -n 8.8.8.8",
          explanation: "Identifies whether the packet reaches 192.168.50.1 before dropping.",
        },
      ],
    },
  },
  {
    id: "step-4a-pfsense-wan-nat",
    title: "4a. pfSense WAN VirtualBox Adapter Connection",
    category: "Upstream WAN NAT",
    question:
      "In pfSense console, select Option 7 and ping 8.8.8.8. Does pfSense itself have internet connectivity?",
    checkCommand: "Option 7 (Ping host) -> 8.8.8.8",
    expectedOutput: "3 packets transmitted, 3 packets received, 0.0% packet loss",
    yesNextStepId: "step-5-dns-resolution",
    noNextStepId: "step-1-kali-dhcp",
    actionIfNo: {
      cause: "pfSense Adapter 1 is not receiving internet from your host machine.",
      fixSteps: [
        "In VirtualBox VM Settings for pfSense -> Network -> Adapter 1.",
        "Ensure Attached to is set to 'NAT' (NOT NAT Network, NOT Bridged, NOT Internal).",
        "Ensure Cable Connected is checked.",
        "In pfSense console, select Option 11 (Restart webConfigurator) or Option 16 (Restart PHP-FPM).",
      ],
      fixCommands: [
        {
          label: "Renew pfSense WAN DHCP via Console",
          cmd: "Option 8 (Shell) -> dhclient vtnet0 (or em0)",
          explanation: "Forces pfSense to request a new IP from the VirtualBox NAT engine.",
        },
      ],
    },
  },
  {
    id: "step-5-dns-resolution",
    title: "5. DNS Resolution (Kali -> External Domains)",
    category: "DNS & Application Layer",
    question:
      "From Kali terminal, run 'curl -I https://www.google.com' or 'nslookup shadowxlab.com'. Does DNS resolve correctly?",
    checkCommand: "nslookup shadowxlab.com",
    expectedOutput: "Server: 192.168.50.1 (or 8.8.8.8), Address: ..., Name: shadowxlab.com",
    yesNextStepId: "step-6-all-passed",
    noNextStepId: "step-5a-dns-fix",
    actionIfNo: {
      cause:
        "You have full Layer 3/4 Internet connectivity (IP routing works), but DNS lookups fail. Either pfSense Unbound DNS resolver is still starting, or Kali's /etc/resolv.conf does not point to a working resolver.",
      fixSteps: [
        "Inspect Kali DNS settings with 'cat /etc/resolv.conf'. It should have 'nameserver 192.168.50.1'.",
        "If pfSense DNS is unresponsive, temporarily append a public DNS server such as 8.8.8.8 or 1.1.1.1 in Kali.",
        "In pfSense webConfigurator (https://192.168.50.1) -> Services -> DNS Resolver -> Enable 'DNS Query Forwarding' if your host ISP blocks root DNS lookups.",
      ],
      fixCommands: [
        {
          label: "Add Temporary Fallback DNS in Kali",
          cmd: "echo 'nameserver 8.8.8.8' | sudo tee /etc/resolv.conf",
          explanation:
            "Instantly restores DNS resolution while troubleshooting pfSense Unbound service.",
        },
      ],
    },
  },
  {
    id: "step-5a-dns-fix",
    title: "5a. pfSense DNS Forwarder Mode",
    category: "DNS Forwarding",
    question:
      "Did adding the fallback DNS or enabling DNS Query Forwarding restore domain resolution?",
    checkCommand: "curl -I https://www.google.com",
    expectedOutput: "HTTP/2 200 or HTTP/1.1 200 OK",
    yesNextStepId: "step-6-all-passed",
    noNextStepId: "step-6-all-passed",
    actionIfNo: {
      cause:
        "If DNS still fails, check host VPN or corporate firewall interference on UDP port 53.",
      fixSteps: [
        "Disable any active host corporate VPN (e.g. Cisco AnyConnect / GlobalProtect) which may intercept DNS packets on the host network.",
        "Test manual DNS resolution through Cloudflare 1.1.1.1 to confirm UDP port 53 egress.",
      ],
      fixCommands: [
        {
          label: "Test DNS via Public 1.1.1.1 (Kali)",
          cmd: "dig @1.1.1.1 shadowxlab.com +short",
          explanation:
            "Bypass local Unbound resolver to isolate whether failure is upstream host blocking or pfSense DNS service.",
        },
      ],
    },
  },
  {
    id: "step-6-all-passed",
    title: "6. Verification Complete - Fully Operational Lab",
    category: "Ready for Training",
    question:
      "All verification steps passed! Kali has an IP, can ping pfSense, can reach internal hosts, and has full outbound internet and DNS.",
    expectedOutput: "READY: 192.168.50.10x -> 192.168.50.1 -> NAT 10.0.2.15 -> Internet",
  },
];
