-- ==============================================================================
-- Migration: 20261115000002_seed_initial_programme.sql
-- Description: Idempotent & Safe Seed for Firewall & VPN Security Administration
-- Target: PostgreSQL 15+ / Supabase
-- Version: 1.1.0 (Audited & Hardened)
-- ==============================================================================

-- 1. Insert Base Programme (Preserves instructor customizations if customized_by_user = true)
INSERT INTO public.programmes (
    id, title, description, instructor, location, start_date, end_date,
    duration_label, initial_progress, published, archived, capstone_title,
    completion_rules, is_system_seed, seed_version, customized_by_user, created_by
) VALUES (
    'firewall-vpn-security-administration',
    'Firewall & VPN Security Administration',
    'A five-day learning and simulation programme for firewall and VPN administration.',
    'Naveen Kumar Yadav Loya',
    'ShadowXLab Cyber Range',
    '2026-11-16',
    '2026-11-20',
    '5 Days',
    42,
    true,
    false,
    'Enterprise Deployment',
    '{"completeAllSessions": true, "passScore": 70}'::jsonb,
    true,
    1,
    false,
    'system'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    instructor = EXCLUDED.instructor,
    location = EXCLUDED.location,
    duration_label = EXCLUDED.duration_label,
    initial_progress = EXCLUDED.initial_progress,
    published = EXCLUDED.published,
    capstone_title = EXCLUDED.capstone_title,
    completion_rules = EXCLUDED.completion_rules,
    seed_version = EXCLUDED.seed_version,
    updated_at = timezone('utc'::text, now())
WHERE programmes.customized_by_user = false;

-- 2. Insert Programme Days
INSERT INTO public.programme_days (programme_id, day_id, day_index, title, topics, is_system_seed) VALUES
('firewall-vpn-security-administration', 'day-1', 1, 'Security & Firewall Foundations', ARRAY['Network security', 'Threats and attack surfaces', 'IP addressing and subnetting', 'Firewall fundamentals', 'Packet filtering', 'Stateful inspection', 'NGFW'], true),
('firewall-vpn-security-administration', 'day-2', 2, 'Firewall Architecture & Administration', ARRAY['Firewall architecture', 'Deployment modes', 'Security zones', 'LAN / WAN / DMZ', 'Perimeter security', 'Topology design', 'Installation and setup', 'Static routing', 'ACLs and policy management'], true),
('firewall-vpn-security-administration', 'day-3', 3, 'Advanced Firewall & VPN Foundations', ARRAY['Application control', 'Web and URL filtering', 'NAT', 'Access restrictions', 'Inter-zone traffic', 'VPN fundamentals', 'IPsec and SSL/TLS', 'IKE', 'Encryption and key exchange'], true),
('firewall-vpn-security-administration', 'day-4', 4, 'VPN Deployment & Enterprise Security', ARRAY['Site-to-Site IPsec VPN', 'VPN architecture', 'Remote access VPN', 'User authentication', 'Client connectivity', 'Firewall hardening', 'Firmware', 'Backup and restore', 'Enterprise deployment'], true),
('firewall-vpn-security-administration', 'day-5', 5, 'Monitoring, Troubleshooting & Wireless Security', ARRAY['Firewall monitoring', 'Traffic analysis', 'Session management', 'Firewall and VPN logs', 'Troubleshooting', 'Wireless security', 'Security protocols', 'Configuration'], true)
ON CONFLICT (programme_id, day_id) DO UPDATE SET
    day_index = EXCLUDED.day_index,
    title = EXCLUDED.title,
    topics = EXCLUDED.topics,
    updated_at = timezone('utc'::text, now())
WHERE EXISTS (
    SELECT 1 FROM public.programmes p
    WHERE p.id = programme_days.programme_id AND p.customized_by_user = false
);

-- 3. Insert Programme Sessions
INSERT INTO public.programme_sessions (id, programme_id, day_id, session_index, start_time, end_time, title, kind, description, is_system_seed) VALUES
-- Day 1
('d1-s1', 'firewall-vpn-security-administration', 'day-1', 1, '10:00', '11:30', 'Introduction to Network Security, Threats, Vulnerabilities & Attack Surfaces', 'lesson', 'Explore threats, vulnerabilities, attack surfaces, Trojans, viruses, worms, logic bombs, phishing, rootkits and DDoS.', true),
('d1-s2', 'firewall-vpn-security-administration', 'day-1', 2, '11:45', '13:00', 'Lab: Threat Analysis, Ports & Protocol Packet Filtering', 'lab', 'Analyze network threats and practise port and protocol packet filtering in the simulated range.', true),
('d1-s3', 'firewall-vpn-security-administration', 'day-1', 3, '14:00', '15:30', 'IP Addressing, Subnetting, TCP/UDP Ports & Stateful Inspection', 'lesson', 'Work with IP addressing, subnetting, TCP/UDP ports, protocols and stateful inspection.', true),
('d1-s4', 'firewall-vpn-security-administration', 'day-1', 4, '15:45', '17:00', 'Next-Generation Firewall (NGFW) Architecture & Fundamentals', 'lesson', 'Review firewall fundamentals and next-generation firewall architecture.', true),
-- Day 2
('d2-s1', 'firewall-vpn-security-administration', 'day-2', 1, '10:00', '11:30', 'Firewall Architecture, Deployment Modes and Security Zones', 'lesson', 'Architecture, deployment modes, security zones, LAN/WAN/DMZ and perimeter security.', true),
('d2-s2', 'firewall-vpn-security-administration', 'day-2', 2, '11:45', '13:00', 'Lab: Network Topology Design and Basic Firewall Installation / Initial Setup', 'lab', 'Design the network topology and walk through basic firewall installation and initial setup.', true),
('d2-s3', 'firewall-vpn-security-administration', 'day-2', 3, '14:00', '15:30', 'Configuration of LAN, WAN, DMZ Interfaces and Static Routing', 'lesson', 'Configure LAN, WAN and DMZ interfaces and establish static routes.', true),
('d2-s4', 'firewall-vpn-security-administration', 'day-2', 4, '15:45', '17:00', 'Firewall Access Control Lists (ACLs), Rules and Policy Management', 'lesson', 'Create access control lists and manage firewall rules and policies.', true),
-- Day 3
('d3-s1', 'firewall-vpn-security-administration', 'day-3', 1, '10:00', '11:30', 'Application Control, Web Filtering, URL Filtering & Firewall Rules', 'lesson', 'Explore application control, web and URL filtering, and firewall rules.', true),
('d3-s2', 'firewall-vpn-security-administration', 'day-3', 2, '11:45', '13:00', 'Lab: NAT Configuration, Access Restrictions & Inter-Zone Traffic Control', 'lab', 'Configure NAT, access restrictions and inter-zone traffic control in the simulation.', true),
('d3-s3', 'firewall-vpn-security-administration', 'day-3', 3, '14:00', '15:30', 'VPN Fundamentals, Types, IPsec & SSL/TLS VPN Architecture', 'lesson', 'Compare VPN types and review IPsec and SSL/TLS VPN architecture.', true),
('d3-s4', 'firewall-vpn-security-administration', 'day-3', 4, '15:45', '17:00', 'IKEv1/IKEv2, Encryption, Authentication, Hashing, Certificates & Key Exchange', 'lesson', 'Review IKEv1/IKEv2, encryption, authentication, hashing, certificates and key exchange.', true),
-- Day 4
('d4-s1', 'firewall-vpn-security-administration', 'day-4', 1, '10:00', '11:30', 'Site-to-Site IPsec VPN Architecture & Configuration Parameters', 'lesson', 'Review Site-to-Site IPsec architecture and configuration parameters.', true),
('d4-s2', 'firewall-vpn-security-administration', 'day-4', 2, '11:45', '13:00', 'Lab: Remote Access VPN, User Authentication & Client Connectivity', 'lab', 'Simulate remote access VPN setup, user authentication and client connectivity.', true),
('d4-s3', 'firewall-vpn-security-administration', 'day-4', 3, '14:00', '15:30', 'Firewall Hardening, Firmware Updates, Backup & Restore', 'lesson', 'Apply firewall hardening practices and review firmware updates, configuration backup and restore.', true),
('d4-s4', 'firewall-vpn-security-administration', 'day-4', 4, '15:45', '17:00', 'Capstone Project: Enterprise Firewall & VPN Multi-Zone Deployment', 'capstone', 'Plan an enterprise firewall and VPN deployment spanning multiple security zones.', true),
-- Day 5
('d5-s1', 'firewall-vpn-security-administration', 'day-5', 1, '10:00', '11:30', 'Firewall Monitoring, Traffic Analysis, Session Management & Logs', 'lesson', 'Read firewall logs, analyze traffic, manage sessions and review VPN monitoring.', true),
('d5-s2', 'firewall-vpn-security-administration', 'day-5', 2, '11:45', '13:00', 'Lab: Troubleshooting Firewall Rules, Routing, NAT & VPN Tunnels', 'lab', 'Follow a troubleshooting sequence for firewall rules, routing, NAT and VPN tunnels.', true),
('d5-s3', 'firewall-vpn-security-administration', 'day-5', 3, '14:00', '15:30', 'Wireless Network Security, Security Protocols & Configuration', 'lesson', 'Review wireless network security, monitoring, security protocols and configuration.', true),
('d5-s4', 'firewall-vpn-security-administration', 'day-5', 4, '15:45', '17:00', 'Programme Review, Final Assessment & Course Wrap-up', 'assessment', 'Review the supplied programme topics and complete the final knowledge check.', true)
ON CONFLICT (programme_id, id) DO UPDATE SET
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time,
    title = EXCLUDED.title,
    kind = EXCLUDED.kind,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now())
WHERE EXISTS (
    SELECT 1 FROM public.programmes p
    WHERE p.id = programme_sessions.programme_id AND p.customized_by_user = false
);

-- 4. Insert Programme Labs
INSERT INTO public.programme_labs (id, programme_id, day_id, title, instructions, checklist, is_system_seed) VALUES
('lab-1', 'firewall-vpn-security-administration', 'day-1', 'Threat Analysis, Ports & Packet Filtering', ARRAY['Review the listed network threats.', 'Inspect TCP/UDP ports and protocols.', 'Apply a packet filtering rule in the simulation.'], ARRAY['Threats reviewed', 'Ports and protocols identified', 'Filtering rule validated'], true),
('lab-2', 'firewall-vpn-security-administration', 'day-2', 'Topology Design & Firewall Initial Setup', ARRAY['Place WAN, firewall, LAN and DMZ nodes.', 'Connect the security zones.', 'Review the initial setup checklist.'], ARRAY['Zones placed', 'Links connected', 'Setup checklist reviewed'], true),
('lab-3', 'firewall-vpn-security-administration', 'day-2', 'LAN, WAN, DMZ Interfaces & Static Routing', ARRAY['Select an interface.', 'Assign its zone.', 'Add a static route and inspect the simulated route table.'], ARRAY['Interfaces assigned', 'Zones verified', 'Route table reviewed'], true),
('lab-4', 'firewall-vpn-security-administration', 'day-2', 'Firewall ACLs, Rules & Policy Management', ARRAY['Review the source and destination zones.', 'Set an allow or restrict action.', 'Validate the simulated policy result.'], ARRAY['ACL scope reviewed', 'Policy action selected', 'Rule validated'], true),
('lab-5', 'firewall-vpn-security-administration', 'day-3', 'NAT, Access Restrictions & Inter-Zone Traffic', ARRAY['Review the NAT scenario.', 'Set an access restriction.', 'Inspect simulated inter-zone traffic control.'], ARRAY['NAT scenario reviewed', 'Restriction selected', 'Traffic control checked'], true),
('lab-6', 'firewall-vpn-security-administration', 'day-3', 'VPN Types, IPsec & SSL/TLS Architecture', ARRAY['Compare the VPN types in the module.', 'Review IPsec and SSL/TLS components.', 'Confirm the selected architecture in the checklist.'], ARRAY['VPN type reviewed', 'Encryption concepts reviewed', 'Architecture checked'], true),
('lab-7', 'firewall-vpn-security-administration', 'day-4', 'Remote Access VPN & Client Connectivity', ARRAY['Review the remote access scenario.', 'Select the authentication approach.', 'Check the simulated client connection state.'], ARRAY['Scenario reviewed', 'Authentication selected', 'Client state checked'], true),
('lab-8', 'firewall-vpn-security-administration', 'day-5', 'Troubleshooting Rules, Routing, NAT & VPN', ARRAY['Inspect the simulated symptom.', 'Check rules, routing and NAT in sequence.', 'Review the VPN tunnel status.'], ARRAY['Rules checked', 'Routing and NAT checked', 'VPN status checked'], true)
ON CONFLICT (programme_id, id) DO UPDATE SET
    title = EXCLUDED.title,
    instructions = EXCLUDED.instructions,
    checklist = EXCLUDED.checklist,
    updated_at = timezone('utc'::text, now())
WHERE EXISTS (
    SELECT 1 FROM public.programmes p
    WHERE p.id = programme_labs.programme_id AND p.customized_by_user = false
);

-- 5. Insert Assessments
INSERT INTO public.programme_assessments (id, programme_id, question_index, prompt, options, answer, is_system_seed) VALUES
('q1', 'firewall-vpn-security-administration', 1, 'Which firewall inspection approach tracks connection state?', ARRAY['Stateful inspection', 'URL filtering', 'Wireless monitoring'], 0, true),
('q2', 'firewall-vpn-security-administration', 2, 'Which set names the network zones configured in the supplied timetable?', ARRAY['LAN, WAN and DMZ', 'HTTP, DNS and SMTP', 'IKEv1, IKEv2 and NAT'], 0, true),
('q3', 'firewall-vpn-security-administration', 3, 'Which item belongs to the VPN topics in this programme?', ARRAY['IPsec', 'Smurfing only', 'Packet shaping'], 0, true),
('q4', 'firewall-vpn-security-administration', 4, 'What does the Day 5 troubleshooting lab cover?', ARRAY['Rules, routing, NAT and VPN tunnels', 'Firmware updates only', 'Wireless configuration only'], 0, true)
ON CONFLICT (programme_id, id) DO UPDATE SET
    question_index = EXCLUDED.question_index,
    prompt = EXCLUDED.prompt,
    options = EXCLUDED.options,
    answer = EXCLUDED.answer,
    updated_at = timezone('utc'::text, now())
WHERE EXISTS (
    SELECT 1 FROM public.programmes p
    WHERE p.id = programme_assessments.programme_id AND p.customized_by_user = false
);
