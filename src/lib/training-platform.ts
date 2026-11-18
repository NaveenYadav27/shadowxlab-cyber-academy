import type {
  LabMode,
  StandardLabVerificationState,
  AssistanceRequest,
} from "./lab-readiness-types";

export type SessionKind = "lesson" | "lab" | "capstone" | "assessment";

export type TrainingSession = {
  id: string;
  start: string;
  end: string;
  title: string;
  kind: SessionKind;
  description: string;
};

export type TrainingDay = {
  id: string;
  title: string;
  topics: string[];
  sessions: TrainingSession[];
};

export type LabConfig = {
  id: string;
  title: string;
  dayId: string;
  instructions: string[];
  checklist: string[];
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
};

export type ProgrammeConfig = {
  id: string;
  title: string;
  description: string;
  instructor: string;
  location: string;
  startDate: string;
  endDate: string;
  durationLabel: string;
  initialProgress: number;
  published: boolean;
  archived: boolean;
  days: TrainingDay[];
  labs: LabConfig[];
  capstoneTitle: string;
  completionRules: { completeAllSessions: boolean; passScore: number };
  assessments: QuizQuestion[];
};

export type TrainingState = {
  programmes: ProgrammeConfig[];
  activeProgrammeId: string;
  selectedDayId: string;
  completedSessionIds: string[];
  progressTouched: boolean;
  checklistState: Record<string, boolean>;
  simulation: { firewallEnabled: boolean; natEnabled: boolean; vpnConnected: boolean };
  archivedProgrammeIds: string[];
  resources: { id: string; title: string; url: string; kind: string }[];
  attendance: Record<string, boolean>;
  quizScore: number | null;
  quizSubmitted: boolean;
  day1CompletedConceptIds?: string[];
  day1LabScores?: Record<string, number>;
  day1SessionAssessmentScores?: Record<string, number>;
  day1FinalAssessmentScore?: number | null;
  day2CompletedConceptIds?: string[];
  day2LabScores?: Record<string, number>;
  day2SessionAssessmentScores?: Record<string, number>;
  day2FinalAssessmentScore?: number | null;
  activeConceptId?: string | null;
  selectedLabMode?: LabMode;
  standardLabVerification?: StandardLabVerificationState;
  assistanceRequests?: AssistanceRequest[];
};

const session = (
  id: string,
  start: string,
  end: string,
  title: string,
  kind: SessionKind,
  description: string,
): TrainingSession => ({ id, start, end, title, kind, description });

const seedProgramme: ProgrammeConfig = {
  id: "firewall-vpn-security-administration",
  title: "Firewall & VPN Security Administration",
  description: "A five-day learning and simulation programme for firewall and VPN administration.",
  instructor: "Mr. Naveen Kumar",
  location: "Engineering Staff College of India (ESCI) / ShadowXLab",
  startDate: "2026-11-16",
  endDate: "2026-11-20",
  durationLabel: "5 Days",
  initialProgress: 42,
  published: true,
  archived: false,
  capstoneTitle: "Enterprise Deployment",
  completionRules: { completeAllSessions: true, passScore: 70 },
  days: [
    {
      id: "day-1",
      title: "Security & Firewall Foundations",
      topics: [
        "Network security",
        "Threats and attack surfaces",
        "IP addressing and subnetting",
        "Firewall fundamentals",
        "Packet filtering",
        "Stateful inspection",
        "NGFW",
      ],
      sessions: [
        session(
          "d1-s1",
          "10:00",
          "11:30",
          "Introduction to Network Security, Threats, Vulnerabilities & Attack Surfaces",
          "lesson",
          "Explore threats, vulnerabilities, attack surfaces, Trojans, viruses, worms, logic bombs, phishing, rootkits and DDoS.",
        ),
        session(
          "d1-s2",
          "11:45",
          "13:00",
          "Lab: Threat Analysis, Ports & Protocol Packet Filtering",
          "lab",
          "Analyze network threats and practise port and protocol packet filtering in the simulated range.",
        ),
        session(
          "d1-s3",
          "14:00",
          "15:30",
          "IP Addressing, Subnetting, TCP/UDP Ports & Stateful Inspection",
          "lesson",
          "Work with IP addressing, subnetting, TCP/UDP ports, protocols and stateful inspection.",
        ),
        session(
          "d1-s4",
          "15:45",
          "17:00",
          "Next-Generation Firewall (NGFW) Architecture & Fundamentals",
          "lesson",
          "Review firewall fundamentals and next-generation firewall architecture.",
        ),
      ],
    },
    {
      id: "day-2",
      title: "Firewall Architecture & Administration",
      topics: [
        "Firewall architecture",
        "Deployment modes",
        "Security zones",
        "LAN / WAN / DMZ",
        "Perimeter security",
        "Topology design",
        "Installation and setup",
        "Static routing",
        "ACLs and policy management",
      ],
      sessions: [
        session(
          "d2-s1",
          "10:00",
          "11:30",
          "Firewall Architecture, Deployment Modes and Security Zones; Firewall Placement: LAN, WAN, DMZ and Perimeter Security",
          "lesson",
          "Architecture, deployment modes, security zones, LAN/WAN/DMZ and perimeter security.",
        ),
        session(
          "d2-s2",
          "11:45",
          "13:00",
          "Hands-on Lab: Network Topology Design and Basic Firewall Installation / Initial Setup, Firewall Interface Configuration, Management Access and Initial Setup",
          "lab",
          "Design the network topology and walk through basic firewall installation and initial setup.",
        ),
        session(
          "d2-s3",
          "14:00",
          "15:30",
          "Configuration of LAN, WAN, DMZ Interfaces and Static Routing",
          "lesson",
          "Configure LAN, WAN and DMZ interfaces and establish static routes.",
        ),
        session(
          "d2-s4",
          "15:45",
          "17:00",
          "Firewall Access Control Lists (ACLs), Rules and Policy Management",
          "lesson",
          "Create access control lists and manage firewall rules and policies.",
        ),
      ],
    },
    {
      id: "day-3",
      title: "Advanced Firewall & VPN Foundations",
      topics: [
        "Application control",
        "Web and URL filtering",
        "NAT",
        "Access restrictions",
        "Inter-zone traffic",
        "VPN fundamentals",
        "IPsec and SSL/TLS",
        "IKE",
        "Encryption and key exchange",
      ],
      sessions: [
        session(
          "d3-s1",
          "10:00",
          "11:30",
          "Application Control, Web Filtering, URL Filtering & Firewall Rules",
          "lesson",
          "Explore application control, web and URL filtering, and firewall rules.",
        ),
        session(
          "d3-s2",
          "11:45",
          "13:00",
          "Lab: NAT Configuration, Access Restrictions & Inter-Zone Traffic Control",
          "lab",
          "Configure NAT, access restrictions and inter-zone traffic control in the simulation.",
        ),
        session(
          "d3-s3",
          "14:00",
          "15:30",
          "VPN Fundamentals, Types, IPsec & SSL/TLS VPN Architecture",
          "lesson",
          "Compare VPN types and review IPsec and SSL/TLS VPN architecture.",
        ),
        session(
          "d3-s4",
          "15:45",
          "17:00",
          "IKEv1/IKEv2, Encryption, Authentication, Hashing, Certificates & Key Exchange",
          "lesson",
          "Review IKEv1/IKEv2, encryption, authentication, hashing, certificates and key exchange.",
        ),
      ],
    },
    {
      id: "day-4",
      title: "VPN Deployment & Enterprise Security",
      topics: [
        "Site-to-Site IPsec VPN",
        "VPN architecture",
        "Remote access VPN",
        "User authentication",
        "Client connectivity",
        "Firewall hardening",
        "Firmware",
        "Backup and restore",
        "Enterprise deployment",
      ],
      sessions: [
        session(
          "d4-s1",
          "10:00",
          "11:30",
          "Site-to-Site IPsec VPN Architecture & Configuration Parameters",
          "lesson",
          "Review Site-to-Site IPsec architecture and configuration parameters.",
        ),
        session(
          "d4-s2",
          "11:45",
          "13:00",
          "Lab: Remote Access VPN, User Authentication & Client Connectivity",
          "lab",
          "Simulate remote access VPN setup, user authentication and client connectivity.",
        ),
        session(
          "d4-s3",
          "14:00",
          "15:30",
          "Firewall Hardening, Firmware Updates, Backup & Restore",
          "lesson",
          "Apply firewall hardening practices and review firmware updates, configuration backup and restore.",
        ),
        session(
          "d4-s4",
          "15:45",
          "17:00",
          "Capstone Project: Enterprise Firewall & VPN Multi-Zone Deployment",
          "capstone",
          "Plan an enterprise firewall and VPN deployment spanning multiple security zones.",
        ),
      ],
    },
    {
      id: "day-5",
      title: "Monitoring, Troubleshooting & Wireless Security",
      topics: [
        "Firewall monitoring",
        "Traffic analysis",
        "Session management",
        "Firewall and VPN logs",
        "Troubleshooting",
        "Wireless security",
        "Security protocols",
        "Configuration",
      ],
      sessions: [
        session(
          "d5-s1",
          "10:00",
          "11:30",
          "Firewall Monitoring, Traffic Analysis, Session Management & Logs",
          "lesson",
          "Read firewall logs, analyze traffic, manage sessions and review VPN monitoring.",
        ),
        session(
          "d5-s2",
          "11:45",
          "13:00",
          "Lab: Troubleshooting Firewall Rules, Routing, NAT & VPN Tunnels",
          "lab",
          "Follow a troubleshooting sequence for firewall rules, routing, NAT and VPN tunnels.",
        ),
        session(
          "d5-s3",
          "14:00",
          "15:30",
          "Wireless Network Security, Security Protocols & Configuration",
          "lesson",
          "Review wireless network security, monitoring, security protocols and configuration.",
        ),
        session(
          "d5-s4",
          "15:45",
          "17:00",
          "Programme Review, Final Assessment & Course Wrap-up",
          "assessment",
          "Review the supplied programme topics and complete the final knowledge check.",
        ),
      ],
    },
  ],
  labs: [
    {
      id: "lab-1",
      title: "Threat Analysis, Ports & Packet Filtering",
      dayId: "day-1",
      instructions: [
        "Review the listed network threats.",
        "Inspect TCP/UDP ports and protocols.",
        "Apply a packet filtering rule in the simulation.",
      ],
      checklist: ["Threats reviewed", "Ports and protocols identified", "Filtering rule validated"],
    },
    {
      id: "lab-2",
      title: "Topology Design & Firewall Initial Setup",
      dayId: "day-2",
      instructions: [
        "Place WAN, firewall, LAN and DMZ nodes.",
        "Connect the security zones.",
        "Review the initial setup checklist.",
      ],
      checklist: ["Zones placed", "Links connected", "Setup checklist reviewed"],
    },
    {
      id: "lab-3",
      title: "LAN, WAN, DMZ Interfaces & Static Routing",
      dayId: "day-2",
      instructions: [
        "Select an interface.",
        "Assign its zone.",
        "Add a static route and inspect the simulated route table.",
      ],
      checklist: ["Interfaces assigned", "Zones verified", "Route table reviewed"],
    },
    {
      id: "lab-4",
      title: "Firewall ACLs, Rules & Policy Management",
      dayId: "day-2",
      instructions: [
        "Review the source and destination zones.",
        "Set an allow or restrict action.",
        "Validate the simulated policy result.",
      ],
      checklist: ["ACL scope reviewed", "Policy action selected", "Rule validated"],
    },
    {
      id: "lab-5",
      title: "NAT, Access Restrictions & Inter-Zone Traffic",
      dayId: "day-3",
      instructions: [
        "Review the NAT scenario.",
        "Set an access restriction.",
        "Inspect simulated inter-zone traffic control.",
      ],
      checklist: ["NAT scenario reviewed", "Restriction selected", "Traffic control checked"],
    },
    {
      id: "lab-6",
      title: "VPN Types, IPsec & SSL/TLS Architecture",
      dayId: "day-3",
      instructions: [
        "Compare the VPN types in the module.",
        "Review IPsec and SSL/TLS components.",
        "Confirm the selected architecture in the checklist.",
      ],
      checklist: ["VPN type reviewed", "Encryption concepts reviewed", "Architecture checked"],
    },
    {
      id: "lab-7",
      title: "Remote Access VPN & Client Connectivity",
      dayId: "day-4",
      instructions: [
        "Review the remote access scenario.",
        "Select the authentication approach.",
        "Check the simulated client connection state.",
      ],
      checklist: ["Scenario reviewed", "Authentication selected", "Client state checked"],
    },
    {
      id: "lab-8",
      title: "Troubleshooting Rules, Routing, NAT & VPN",
      dayId: "day-5",
      instructions: [
        "Inspect the simulated symptom.",
        "Check rules, routing and NAT in sequence.",
        "Review the VPN tunnel status.",
      ],
      checklist: ["Rules checked", "Routing and NAT checked", "VPN status checked"],
    },
  ],
  assessments: [
    {
      id: "q1",
      prompt: "Which firewall inspection approach tracks connection state?",
      options: ["Stateful inspection", "URL filtering", "Wireless monitoring"],
      answer: 0,
    },
    {
      id: "q2",
      prompt: "Which set names the network zones configured in the supplied timetable?",
      options: ["LAN, WAN and DMZ", "HTTP, DNS and SMTP", "IKEv1, IKEv2 and NAT"],
      answer: 0,
    },
    {
      id: "q3",
      prompt: "Which item belongs to the VPN topics in this programme?",
      options: ["IPsec", "Smurfing only", "Packet shaping"],
      answer: 0,
    },
    {
      id: "q4",
      prompt: "What does the Day 5 troubleshooting lab cover?",
      options: [
        "Rules, routing, NAT and VPN tunnels",
        "Firmware updates only",
        "Wireless configuration only",
      ],
      answer: 0,
    },
  ],
};

export const INITIAL_PROGRAMME = seedProgramme;
export const STORAGE_KEY = "shadowxlab-training-state-v1";

export function createInitialState(): TrainingState {
  return {
    programmes: [structuredClone(seedProgramme)],
    activeProgrammeId: seedProgramme.id,
    selectedDayId: "day-2",
    completedSessionIds: ["d1-s1", "d1-s2", "d1-s3", "d1-s4"],
    progressTouched: false,
    checklistState: {},
    simulation: { firewallEnabled: true, natEnabled: false, vpnConnected: false },
    archivedProgrammeIds: [],
    resources: [],
    attendance: {},
    quizScore: null,
    quizSubmitted: false,
    day1CompletedConceptIds: [],
    day1LabScores: {},
    day1SessionAssessmentScores: {},
    day1FinalAssessmentScore: null,
    day2CompletedConceptIds: [],
    day2LabScores: {},
    day2SessionAssessmentScores: {},
    day2FinalAssessmentScore: null,
    activeConceptId: null,
    selectedLabMode: "local-full",
    standardLabVerification: {
      kaliIpVerified: false,
      pfsensePingVerified: false,
      ubuntuPingVerified: false,
      internetPingVerified: false,
      dnsLookupVerified: false,
      pfsenseWebGuiVerified: false,
    },
    assistanceRequests: [],
  };
}

export function countSessions(programme: ProgrammeConfig) {
  return programme.days.reduce((count, day) => count + day.sessions.length, 0);
}

export function countCapstones(programme: ProgrammeConfig) {
  return programme.days.reduce(
    (count, day) => count + day.sessions.filter((item) => item.kind === "capstone").length,
    0,
  );
}

export function calculateProgress(completedIds: string[], programme: ProgrammeConfig) {
  const total = countSessions(programme);
  return total === 0
    ? 0
    : Math.round(
        (completedIds.filter((id) =>
          programme.days.some((day) => day.sessions.some((item) => item.id === id)),
        ).length /
          total) *
          100,
      );
}

export function getProgress(completedIds: string[], programme: ProgrammeConfig) {
  return programme.initialProgress;
}

export function dateRangeLabel(start: string, end: string) {
  const format = (value: string, withYear = false) =>
    new Date(`${value}T12:00:00`).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      ...(withYear ? { year: "numeric" } : {}),
    });
  return `${format(start)} – ${format(end, true)}`;
}

export function dayDateLabel(start: string, dayIndex: number) {
  const date = new Date(`${start}T12:00:00`);
  date.setDate(date.getDate() + dayIndex);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
