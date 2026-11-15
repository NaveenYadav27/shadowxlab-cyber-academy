-- ==============================================================================
-- SHADOWXLAB CYBERSECURITY ACADEMY
-- FULL DATABASE INITIALIZATION SCRIPT (Consolidated Migrations 1 - 4)
-- Target: PostgreSQL 15+ / Supabase (Project: pfsoxbnsjejbljgbfbcs)
-- Version: 1.2.0 (Production Verified)
-- ==============================================================================

-- ==============================================================================
-- PART 1: CORE SCHEMA DEFINITION
-- ==============================================================================

-- Helper: updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Table: programmes
CREATE TABLE IF NOT EXISTS public.programmes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    instructor TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    start_date DATE,
    end_date DATE,
    duration_label TEXT NOT NULL DEFAULT '',
    initial_progress INTEGER NOT NULL DEFAULT 0 CHECK (initial_progress >= 0 AND initial_progress <= 100),
    published BOOLEAN NOT NULL DEFAULT false,
    archived BOOLEAN NOT NULL DEFAULT false,
    capstone_title TEXT NOT NULL DEFAULT '',
    completion_rules JSONB NOT NULL DEFAULT '{"completeAllSessions": true, "passScore": 70}'::jsonb,
    is_system_seed BOOLEAN NOT NULL DEFAULT false,
    seed_version INTEGER NOT NULL DEFAULT 1,
    customized_by_user BOOLEAN NOT NULL DEFAULT false,
    created_by TEXT NOT NULL DEFAULT 'system',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_programmes_published ON public.programmes(published);
CREATE INDEX IF NOT EXISTS idx_programmes_archived ON public.programmes(archived);
CREATE INDEX IF NOT EXISTS idx_programmes_seed ON public.programmes(is_system_seed, seed_version);

DROP TRIGGER IF EXISTS trg_programmes_updated_at ON public.programmes;
CREATE TRIGGER trg_programmes_updated_at
    BEFORE UPDATE ON public.programmes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Table: programme_days
CREATE TABLE IF NOT EXISTS public.programme_days (
    programme_id TEXT NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
    day_id TEXT NOT NULL,
    day_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    topics TEXT[] NOT NULL DEFAULT '{}',
    is_system_seed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (programme_id, day_id)
);

CREATE INDEX IF NOT EXISTS idx_programme_days_order ON public.programme_days(programme_id, day_index);

DROP TRIGGER IF EXISTS trg_programme_days_updated_at ON public.programme_days;
CREATE TRIGGER trg_programme_days_updated_at
    BEFORE UPDATE ON public.programme_days
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Table: programme_sessions
CREATE TABLE IF NOT EXISTS public.programme_sessions (
    id TEXT NOT NULL,
    programme_id TEXT NOT NULL,
    day_id TEXT NOT NULL,
    session_index INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    title TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('lesson', 'lab', 'capstone', 'assessment')),
    description TEXT NOT NULL DEFAULT '',
    is_system_seed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (programme_id, id),
    FOREIGN KEY (programme_id, day_id) REFERENCES public.programme_days(programme_id, day_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_lookup ON public.programme_sessions(programme_id, day_id, session_index);
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON public.programme_sessions(id);

DROP TRIGGER IF EXISTS trg_programme_sessions_updated_at ON public.programme_sessions;
CREATE TRIGGER trg_programme_sessions_updated_at
    BEFORE UPDATE ON public.programme_sessions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. Table: programme_labs
CREATE TABLE IF NOT EXISTS public.programme_labs (
    id TEXT NOT NULL,
    programme_id TEXT NOT NULL,
    day_id TEXT NOT NULL,
    title TEXT NOT NULL,
    instructions TEXT[] NOT NULL DEFAULT '{}',
    checklist TEXT[] NOT NULL DEFAULT '{}',
    is_system_seed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (programme_id, id),
    FOREIGN KEY (programme_id, day_id) REFERENCES public.programme_days(programme_id, day_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_labs_lookup ON public.programme_labs(programme_id, day_id);
CREATE INDEX IF NOT EXISTS idx_labs_lab_id ON public.programme_labs(id);

DROP TRIGGER IF EXISTS trg_programme_labs_updated_at ON public.programme_labs;
CREATE TRIGGER trg_programme_labs_updated_at
    BEFORE UPDATE ON public.programme_labs
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. Table: programme_assessments
CREATE TABLE IF NOT EXISTS public.programme_assessments (
    id TEXT NOT NULL,
    programme_id TEXT NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
    question_index INTEGER NOT NULL,
    prompt TEXT NOT NULL,
    options TEXT[] NOT NULL DEFAULT '{}',
    answer INTEGER NOT NULL DEFAULT 0,
    is_system_seed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (programme_id, id)
);

CREATE INDEX IF NOT EXISTS idx_assessments_order ON public.programme_assessments(programme_id, question_index);

DROP TRIGGER IF EXISTS trg_programme_assessments_updated_at ON public.programme_assessments;
CREATE TRIGGER trg_programme_assessments_updated_at
    BEFORE UPDATE ON public.programme_assessments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6. Table: programme_resources
CREATE TABLE IF NOT EXISTS public.programme_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    programme_id TEXT NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL DEFAULT '',
    kind TEXT NOT NULL DEFAULT 'Reference',
    created_by TEXT NOT NULL DEFAULT 'system',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_resources_programme ON public.programme_resources(programme_id);

-- 7. Table: learner_session_progress
CREATE TABLE IF NOT EXISTS public.learner_session_progress (
    user_id TEXT NOT NULL DEFAULT 'local-learner',
    programme_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT true,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, programme_id, session_id),
    FOREIGN KEY (programme_id, session_id) REFERENCES public.programme_sessions(programme_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_learner_session_progress_user ON public.learner_session_progress(user_id);

-- 8. Table: learner_lab_progress
CREATE TABLE IF NOT EXISTS public.learner_lab_progress (
    user_id TEXT NOT NULL DEFAULT 'local-learner',
    programme_id TEXT NOT NULL,
    checklist_key TEXT NOT NULL,
    checked BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, programme_id, checklist_key),
    FOREIGN KEY (programme_id) REFERENCES public.programmes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_learner_lab_progress_user ON public.learner_lab_progress(user_id);

DROP TRIGGER IF EXISTS trg_learner_lab_progress_updated_at ON public.learner_lab_progress;
CREATE TRIGGER trg_learner_lab_progress_updated_at
    BEFORE UPDATE ON public.learner_lab_progress
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 9. Table: session_attendance
CREATE TABLE IF NOT EXISTS public.session_attendance (
    user_id TEXT NOT NULL DEFAULT 'local-learner',
    programme_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    attended BOOLEAN NOT NULL DEFAULT true,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, programme_id, session_id),
    FOREIGN KEY (programme_id, session_id) REFERENCES public.programme_sessions(programme_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_session_attendance_user ON public.session_attendance(user_id);

-- 10. Table: assessment_attempts
CREATE TABLE IF NOT EXISTS public.assessment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL DEFAULT 'local-learner',
    programme_id TEXT NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_assessment_attempts_user ON public.assessment_attempts(user_id, programme_id);

-- 11. Table: learner_simulation_state
CREATE TABLE IF NOT EXISTS public.learner_simulation_state (
    user_id TEXT NOT NULL DEFAULT 'local-learner',
    programme_id TEXT NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
    firewall_enabled BOOLEAN NOT NULL DEFAULT true,
    nat_enabled BOOLEAN NOT NULL DEFAULT false,
    vpn_connected BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, programme_id)
);

CREATE INDEX IF NOT EXISTS idx_learner_simulation_user ON public.learner_simulation_state(user_id);

DROP TRIGGER IF EXISTS trg_learner_simulation_state_updated_at ON public.learner_simulation_state;
CREATE TRIGGER trg_learner_simulation_state_updated_at
    BEFORE UPDATE ON public.learner_simulation_state
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- PART 2: CANONICAL CURRICULUM SEED
-- ==============================================================================

-- 1. Insert Base Programme (Preserves instructor customizations)
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

-- ==============================================================================
-- PART 3: ROW LEVEL SECURITY & POLICY ENGINE
-- ==============================================================================

ALTER TABLE public.programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programme_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programme_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programme_labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programme_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programme_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_session_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_lab_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_simulation_state ENABLE ROW LEVEL SECURITY;

-- Clean legacy policies from earlier versions if present
DROP POLICY IF EXISTS "Learner session progress access" ON public.learner_session_progress;
DROP POLICY IF EXISTS "Learner lab progress access" ON public.learner_lab_progress;
DROP POLICY IF EXISTS "Session attendance access" ON public.session_attendance;
DROP POLICY IF EXISTS "Assessment attempts access" ON public.assessment_attempts;
DROP POLICY IF EXISTS "Simulation state access" ON public.learner_simulation_state;

-- Curriculum Catalog Read
DROP POLICY IF EXISTS "Public read published programmes" ON public.programmes;
CREATE POLICY "Public read published programmes" ON public.programmes
    FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Public read days of published programmes" ON public.programme_days;
CREATE POLICY "Public read days of published programmes" ON public.programme_days
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.programmes WHERE programmes.id = programme_days.programme_id AND programmes.published = true
    ));

DROP POLICY IF EXISTS "Public read sessions of published programmes" ON public.programme_sessions;
CREATE POLICY "Public read sessions of published programmes" ON public.programme_sessions
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.programmes WHERE programmes.id = programme_sessions.programme_id AND programmes.published = true
    ));

DROP POLICY IF EXISTS "Public read labs of published programmes" ON public.programme_labs;
CREATE POLICY "Public read labs of published programmes" ON public.programme_labs
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.programmes WHERE programmes.id = programme_labs.programme_id AND programmes.published = true
    ));

DROP POLICY IF EXISTS "Public read assessments of published programmes" ON public.programme_assessments;
CREATE POLICY "Public read assessments of published programmes" ON public.programme_assessments
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.programmes WHERE programmes.id = programme_assessments.programme_id AND programmes.published = true
    ));

DROP POLICY IF EXISTS "Public read resources of published programmes" ON public.programme_resources;
CREATE POLICY "Public read resources of published programmes" ON public.programme_resources
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.programmes WHERE programmes.id = programme_resources.programme_id AND programmes.published = true
    ));

-- Learner Session Progress Isolation
DROP POLICY IF EXISTS "Learner own session progress select" ON public.learner_session_progress;
CREATE POLICY "Learner own session progress select" ON public.learner_session_progress
    FOR SELECT USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

DROP POLICY IF EXISTS "Learner own session progress insert" ON public.learner_session_progress;
CREATE POLICY "Learner own session progress insert" ON public.learner_session_progress
    FOR INSERT WITH CHECK (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

DROP POLICY IF EXISTS "Learner own session progress update" ON public.learner_session_progress;
CREATE POLICY "Learner own session progress update" ON public.learner_session_progress
    FOR UPDATE USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    ) WITH CHECK (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

DROP POLICY IF EXISTS "Learner own session progress delete" ON public.learner_session_progress;
CREATE POLICY "Learner own session progress delete" ON public.learner_session_progress
    FOR DELETE USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

-- Learner Lab Progress Isolation
DROP POLICY IF EXISTS "Learner own lab progress select" ON public.learner_lab_progress;
CREATE POLICY "Learner own lab progress select" ON public.learner_lab_progress
    FOR SELECT USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

DROP POLICY IF EXISTS "Learner own lab progress insert" ON public.learner_lab_progress;
CREATE POLICY "Learner own lab progress insert" ON public.learner_lab_progress
    FOR INSERT WITH CHECK (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

DROP POLICY IF EXISTS "Learner own lab progress update" ON public.learner_lab_progress;
CREATE POLICY "Learner own lab progress update" ON public.learner_lab_progress
    FOR UPDATE USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    ) WITH CHECK (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

DROP POLICY IF EXISTS "Learner own lab progress delete" ON public.learner_lab_progress;
CREATE POLICY "Learner own lab progress delete" ON public.learner_lab_progress
    FOR DELETE USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

-- Learner Simulation State Isolation
DROP POLICY IF EXISTS "Learner own simulation state select" ON public.learner_simulation_state;
CREATE POLICY "Learner own simulation state select" ON public.learner_simulation_state
    FOR SELECT USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

DROP POLICY IF EXISTS "Learner own simulation state insert" ON public.learner_simulation_state;
CREATE POLICY "Learner own simulation state insert" ON public.learner_simulation_state
    FOR INSERT WITH CHECK (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

DROP POLICY IF EXISTS "Learner own simulation state update" ON public.learner_simulation_state;
CREATE POLICY "Learner own simulation state update" ON public.learner_simulation_state
    FOR UPDATE USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    ) WITH CHECK (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

-- Assessment Attempts Isolation
DROP POLICY IF EXISTS "Learner own assessment attempts select" ON public.assessment_attempts;
CREATE POLICY "Learner own assessment attempts select" ON public.assessment_attempts
    FOR SELECT USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

DROP POLICY IF EXISTS "Learner own assessment attempts insert" ON public.assessment_attempts;
CREATE POLICY "Learner own assessment attempts insert" ON public.assessment_attempts
    FOR INSERT WITH CHECK (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
    );

-- Programme Resources Contribution
DROP POLICY IF EXISTS "Learner resource contribution" ON public.programme_resources;
CREATE POLICY "Learner resource contribution" ON public.programme_resources
    FOR INSERT WITH CHECK (
        (auth.uid() IS NOT NULL AND created_by = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND created_by = 'local-learner')
    );

-- ==============================================================================
-- PART 4: RBAC, USER ROLES & PRIVILEGE ENFORCEMENT
-- ==============================================================================

-- 1. Table: user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'administrator')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER trg_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Security Definer Helper Functions
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
    assigned_role TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN 'guest';
    END IF;

    SELECT role INTO assigned_role
    FROM public.user_roles
    WHERE user_id = auth.uid();

    RETURN COALESCE(assigned_role, 'student');
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN false;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = required_role
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN false;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role IN ('instructor', 'administrator')
    );
END;
$$;

-- 3. Automatic Default Role Assignment Trigger for New Signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student')
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. RLS Policies for user_roles
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role" ON public.user_roles
    FOR SELECT USING (
        auth.uid() = user_id
        OR
        public.has_role('administrator')
    );

DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles" ON public.user_roles
    FOR UPDATE USING (
        public.has_role('administrator')
    ) WITH CHECK (
        public.has_role('administrator')
    );

DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles" ON public.user_roles
    FOR DELETE USING (
        public.has_role('administrator')
    );

-- 5. Updated RLS Policies for Staff/Admin Operations
DROP POLICY IF EXISTS "Admins can insert programmes" ON public.programmes;
CREATE POLICY "Admins can insert programmes" ON public.programmes
    FOR INSERT WITH CHECK (
        public.has_role('administrator')
    );

DROP POLICY IF EXISTS "Admins can update programmes" ON public.programmes;
CREATE POLICY "Admins can update programmes" ON public.programmes
    FOR UPDATE USING (
        public.has_role('administrator')
    ) WITH CHECK (
        public.has_role('administrator')
    );

DROP POLICY IF EXISTS "Admins can delete programmes" ON public.programmes;
CREATE POLICY "Admins can delete programmes" ON public.programmes
    FOR DELETE USING (
        public.has_role('administrator')
    );

-- Attendance: Viewable by learner, managed strictly by staff
DROP POLICY IF EXISTS "Learner own attendance select" ON public.session_attendance;
CREATE POLICY "Learner own attendance select" ON public.session_attendance
    FOR SELECT USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND user_id = 'local-learner')
        OR
        public.is_staff()
    );

DROP POLICY IF EXISTS "Learner own attendance insert" ON public.session_attendance;
DROP POLICY IF EXISTS "Learner own attendance update" ON public.session_attendance;

DROP POLICY IF EXISTS "Staff can manage session attendance" ON public.session_attendance;
CREATE POLICY "Staff can manage session attendance" ON public.session_attendance
    FOR ALL USING (
        public.is_staff()
    ) WITH CHECK (
        public.is_staff()
    );
